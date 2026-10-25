begin;
create table public.verification_requests (
 id bigint generated always as identity primary key,
 user_id uuid not null unique references auth.users on delete cascade,
 method text not null check(method in ('linkedin','employee_id','student_id','professional_id')),
 evidence text not null check(length(evidence) between 10 and 2800000),
 status text not null default 'pending' check(status in ('pending','approved','rejected')),
 reason text,
 reviewed_by uuid references auth.users,
 created_at timestamptz not null default now()
);
alter table public.verification_requests enable row level security;
revoke all on public.verification_requests from public,anon,authenticated;
grant select on public.verification_requests to authenticated;
create policy verification_private on public.verification_requests for select to authenticated using(user_id=auth.uid() or public.is_admin());
create function public.verification_status() returns jsonb language plpgsql stable security definer set search_path=public as $$
declare u uuid:=require_user(); r verification_requests; work_verified boolean;
begin
 select * into r from verification_requests where user_id=u;
 select coalesce(email_confirmed_at is not null and email ~ '^[^@]+@[^@]+[.][^@]+$' and lower(split_part(email,'@',2)) !~ '^(gmail|googlemail|yahoo|outlook|hotmail|live|icloud|aol|proton|protonmail|mail|yandex)[.]',false) into work_verified from auth.users where id=u;
 return jsonb_build_object('verified',coalesce(work_verified,false) or coalesce(r.status='approved',false),'status',case when work_verified then 'approved' else coalesce(r.status,'unverified') end,'method',case when work_verified then 'work_email' else r.method end,'reason',r.reason);
end $$;
create function public.submit_verification(p_method text,p_evidence text) returns void language plpgsql security definer set search_path=public as $$
declare u uuid:=require_user();
begin
 if p_method='linkedin' and p_evidence !~ '^https://(www[.])?linkedin[.]com/in/[^/ ]+/?$' then raise exception 'Enter a valid LinkedIn profile URL'; end if;
 if p_method<>'linkedin' and p_evidence !~ '^data:image/(jpeg|png);base64,[A-Za-z0-9+/=]+$' then raise exception 'Upload a JPG or PNG ID image'; end if;
 if exists(select 1 from verification_requests where user_id=u and status in ('pending','approved')) then raise exception 'Your verification is already submitted'; end if;
 insert into verification_requests(user_id,method,evidence) values(u,p_method,p_evidence)
 on conflict(user_id) do update set method=excluded.method,evidence=excluded.evidence,status='pending',reason=null,reviewed_by=null,created_at=now();
end $$;
create function public.review_verification(p_request bigint,p_approve boolean,p_reason text default '') returns void language plpgsql security definer set search_path=public as $$
begin
 if not is_admin() then raise exception 'Administrator access required'; end if;
 if exists(select 1 from verification_requests where id=p_request and user_id=auth.uid()) then raise exception 'You cannot review your own verification'; end if;
 update verification_requests set status=case when p_approve then 'approved' else 'rejected' end,reason=left(p_reason,500),reviewed_by=auth.uid(),evidence='[reviewed; proof removed]' where id=p_request and status='pending';
 if not found then raise exception 'No pending request found'; end if;
end $$;
create function public.require_verified_interaction() returns trigger language plpgsql security definer set search_path=public as $$
begin
 if not coalesce((verification_status()->>'verified')::boolean,false) then raise exception 'Verify your profile to chat, message or book'; end if;
 return new;
end $$;
create trigger verify_group before insert on public.groups for each row execute function require_verified_interaction();
create trigger verify_group_member before insert on public.group_members for each row execute function require_verified_interaction();
create trigger verify_reaction before insert on public.post_likes for each row execute function require_verified_interaction();
create trigger verify_post before insert on public.posts for each row execute function require_verified_interaction();
create trigger verify_message before insert on public.direct_messages for each row execute function require_verified_interaction();
create trigger verify_connection before insert or update on public.connections for each row execute function require_verified_interaction();
create trigger verify_booking before insert on public.provider_bookings for each row execute function require_verified_interaction();
create trigger verify_session before insert on public.sessions for each row execute function require_verified_interaction();
create trigger verify_session_member before insert on public.session_members for each row execute function require_verified_interaction();
revoke all on function public.verification_status(),public.submit_verification(text,text),public.review_verification(bigint,boolean,text),public.require_verified_interaction() from public,anon;
grant execute on function public.verification_status(),public.submit_verification(text,text),public.review_verification(bigint,boolean,text) to authenticated;
commit;
