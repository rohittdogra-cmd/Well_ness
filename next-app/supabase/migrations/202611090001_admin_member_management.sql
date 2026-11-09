begin;
-- Suspension is reversible. No account or member content is deleted by this action.
create table public.account_suspensions (
 user_id uuid primary key references auth.users on delete cascade,
 reason text not null check(char_length(trim(reason)) between 5 and 500),
 suspended_by uuid references auth.users on delete set null,
 suspended_at timestamptz not null default now()
);
alter table public.account_suspensions enable row level security;
revoke all on public.account_suspensions from public,anon,authenticated;
grant select on public.account_suspensions to authenticated;
create function public.account_is_active() returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from auth.users where id=auth.uid()) and not exists(select 1 from account_suspensions where user_id=auth.uid());
$$;
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$
 select account_is_active() and exists(select 1 from admins where user_id=auth.uid());
$$;
create policy suspension_read on public.account_suspensions for select to authenticated using(user_id=auth.uid() or is_admin());
create function public.profile_is_complete(p_user uuid) returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from profiles where id=p_user and char_length(trim(name))>=2 and cardinality(interests)>0 and cardinality(availability)>0 and char_length(trim(goal))>0);
$$;
create function public.account_access() returns jsonb language plpgsql stable security definer set search_path=public as $$
begin
 if auth.uid() is null then raise exception 'Please sign in'; end if;
 return jsonb_build_object('active',account_is_active(),'profile_complete',profile_is_complete(auth.uid()));
end $$;
create or replace function public.require_user() returns uuid language plpgsql stable security definer set search_path=public as $$
begin
 if auth.uid() is null then raise exception 'Please sign in'; end if;
 if not account_is_active() then raise exception 'This account is suspended or no longer available'; end if;
 if not is_admin() and not profile_is_complete(auth.uid()) then raise exception 'Complete your profile: name, interests, availability and goal'; end if;
 return auth.uid();
end $$;
-- Restrictive policies also cover direct REST access with an already issued token.
do $$ declare t text; begin
 foreach t in array array['profiles','groups','group_members','posts','post_likes','reports','sessions','session_members','tasks','providers','provider_bookings','check_ins','notifications','contact_requests','activity_logs','connections','direct_messages','verification_requests','organisation_domains'] loop
 execute format('create policy active_account_required on public.%I as restrictive for all to authenticated using(public.account_is_active()) with check(public.account_is_active())',t);
 end loop;
end $$;
create function public.admin_set_suspension(p_user uuid,p_suspend boolean,p_reason text default '') returns void language plpgsql security definer set search_path=public as $$
begin
 if not is_admin() then raise exception 'Administrator access required'; end if;
 if p_user is null or p_suspend is null then raise exception 'Choose an account and action'; end if;
 perform 1 from profiles where id=p_user for update;
 if not found then raise exception 'Account not found'; end if;
 if p_user=auth.uid() or exists(select 1 from admins where user_id=p_user) then raise exception 'Administrator accounts cannot be suspended here'; end if;
 if p_suspend then
  if char_length(trim(coalesce(p_reason,''))) not between 5 and 500 then raise exception 'Give a reason (5–500 characters)'; end if;
  insert into account_suspensions(user_id,reason,suspended_by) values(p_user,trim(p_reason),auth.uid())
  on conflict(user_id) do update set reason=excluded.reason,suspended_by=excluded.suspended_by,suspended_at=now();
 else delete from account_suspensions where user_id=p_user; end if;
end $$;
-- Admin group management does not require a community profile or member verification.
create or replace function public.require_verified_interaction() returns trigger language plpgsql security definer set search_path=public as $$
begin
 perform require_user();
 if tg_table_name in ('groups','group_members') and is_admin() then return new; end if;
 if not coalesce((verification_status()->>'verified')::boolean,false) then raise exception 'Verify your profile to participate'; end if;
 return new;
end $$;
create function public.admin_create_group(p_name text,p_description text,p_category text) returns bigint language plpgsql security definer set search_path=public as $$
begin
 if not is_admin() then raise exception 'Administrator access required'; end if;
 return create_group(p_name,p_description,p_category);
end $$;
-- Cascading account deletion must not create audit rows referring to a deleted user.
create or replace function public.audit_wellness() returns trigger language plpgsql security definer set search_path=public as $$
declare actor uuid:=auth.uid(); kind text; related bigint; begin
 if actor is null or not exists(select 1 from auth.users where id=actor) then return coalesce(new,old); end if;
 if tg_table_name='sessions' then kind:='sessionCreated';related:=new.id;
 elsif tg_table_name='session_members' then kind:=case when tg_op='DELETE' then 'sessionLeft' else 'sessionJoined' end;related:=coalesce(new.session_id,old.session_id);
 elsif tg_table_name='tasks' then
  if tg_op='UPDATE' and (not new.completed or old.completed) then return new; end if;
  kind:=case when tg_op='INSERT' then 'taskCreated' else 'taskCompleted' end;related:=new.id;
 else kind:='providerBooked';related:=new.id; end if;
 insert into activity_logs(user_id,activity_type,related_id) values(actor,kind,related);
 return coalesce(new,old);
end $$;
create function public.delete_own_account(p_confirmation text) returns void language plpgsql security definer set search_path=public as $$
declare u uuid:=auth.uid(); begin
 if u is null then raise exception 'Please sign in'; end if;
 if p_confirmation is distinct from 'DELETE MY ACCOUNT' then raise exception 'Type DELETE MY ACCOUNT to confirm'; end if;
 if exists(select 1 from admins where user_id=u) then raise exception 'Administrator accounts require an administrator access transfer before deletion'; end if;
 if exists(select 1 from provider_bookings b join providers p on p.id=b.provider_id where p.applicant=u and b.booking_time>now()) or exists(select 1 from guest_appointments b join providers p on p.id=b.provider_id where p.applicant=u and b.booking_time>now() and b.status<>'cancelled') then raise exception 'Cancel or transfer future provider appointments before deleting your account'; end if;
 delete from provider_bookings where user_id=u;
 delete from auth.users where id=u;
 if not found then raise exception 'Account not found'; end if;
end $$;
revoke all on function public.account_is_active(),public.profile_is_complete(uuid),public.account_access(),public.admin_set_suspension(uuid,boolean,text),public.admin_create_group(text,text,text),public.delete_own_account(text) from public,anon;
-- Profile completion is exposed only through the caller-scoped account_access RPC.
grant execute on function public.account_is_active(),public.account_access(),public.admin_set_suspension(uuid,boolean,text),public.admin_create_group(text,text,text),public.delete_own_account(text) to authenticated;
commit;
