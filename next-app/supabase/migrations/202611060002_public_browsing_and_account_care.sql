begin;
-- Public browsing uses explicit projections; raw identities and private tables
-- remain protected by their existing grants and row-level policies.
create function public.get_public_feed(p_before bigint default null,p_limit integer default 20) returns jsonb
language sql stable security definer set search_path=public as $$
 select coalesce(jsonb_agg(x.data order by x.id desc),'[]'::jsonb) from (
 select p.id,jsonb_build_object('id',p.id,'body',mask_offensive_text(p.body),'created_at',p.created_at,'anonymous',true,'mine',false,
 'alias','Quiet '||substr(md5(pr.alias_seed::text||'public-lounge'),1,6),
 'likes',(select count(*) from post_likes l where l.post_id=p.id),'liked',false,
 'replies',coalesce((select jsonb_agg(jsonb_build_object('id',r.id,'body',mask_offensive_text(r.body),'created_at',r.created_at,'mine',false,'alias','Quiet '||substr(md5(rp.alias_seed::text||'public-lounge'),1,6)) order by r.id)
 from posts r join profiles rp on rp.id=r.author_id where r.parent_id=p.id and r.group_id is null and r.anonymous and not r.hidden),'[]'::jsonb)) data
 from posts p join profiles pr on pr.id=p.author_id
 where p.group_id is null and p.parent_id is null and p.anonymous and not p.hidden and (p_before is null or p.id<p_before)
 order by p.id desc limit least(greatest(coalesce(p_limit,20),1),50)
 ) x;
$$;
create function public.find_public_members(p_search text default '',p_offset integer default 0)
returns table(id text,name text,avatar integer,bio text,interests text[]) language sql stable security definer set search_path=public as $$
 select md5('public-card:'||p.id::text),mask_offensive_text(p.name),p.avatar,mask_offensive_text(p.bio),
 array(select mask_offensive_text(i) from unnest(p.interests) i)
 from profiles p where char_length(trim(p.name))>=2
 and (coalesce(p_search,'')='' or position(lower(left(p_search,100)) in lower(p.name))>0)
 order by p.name,p.id limit 30 offset greatest(coalesce(p_offset,0),0);
$$;
create function public.list_public_activities() returns jsonb language sql stable security definer set search_path=public as $$
 select coalesce(jsonb_agg(x order by date_time),'[]'::jsonb) from (
 select s.id,mask_offensive_text(s.title) title,mask_offensive_text(s.description) description,s.program_type,s.date_time,s.created_at,s.max_participants,
 mask_offensive_text(s.space_name) space_name,mask_offensive_text(s.location) location,
 (select count(*) from session_members m where m.session_id=s.id) participant_count
 from sessions s where s.date_time>now() order by s.date_time limit 100
 ) x;
$$;
revoke all on function public.get_public_feed(bigint,integer),public.find_public_members(text,integer),public.list_public_activities() from public;
grant execute on function public.get_public_feed(bigint,integer),public.find_public_members(text,integer),public.list_public_activities() to anon,authenticated;

-- Care is available to any confirmed account, independent of organisation
-- verification. Community participation keeps its existing verification checks.
drop trigger verify_booking on public.provider_bookings;
alter table public.provider_bookings add column contact_name text check(char_length(contact_name) between 2 and 100);
alter table public.provider_bookings add column contact_email text;
create function public.require_care_account() returns trigger language plpgsql security definer set search_path=public as $$
begin
 if auth.uid() is null or new.user_id<>auth.uid() then raise exception 'Please sign in to request care'; end if;
 select email into new.contact_email from auth.users where id=auth.uid() and email_confirmed_at is not null;
 if new.contact_email is null then raise exception 'Confirm your account email before requesting care'; end if;
 if (select count(*) from provider_bookings where user_id=auth.uid() and created_at>now()-interval '1 day')>=3 then raise exception 'You can request up to three appointments per day'; end if;
 return new;
end $$;
create trigger care_account before insert on public.provider_bookings for each row execute function public.require_care_account();
create function public.book_care(p_provider bigint,p_time timestamptz,p_name text) returns bigint language plpgsql security definer set search_path=public as $$
declare bid bigint;
begin
 perform require_user();
 if p_name is null or length(trim(p_name)) not between 2 and 100 then raise exception 'Enter your name (2–100 characters)'; end if;
 bid:=book_provider(p_provider,p_time);
 update provider_bookings set contact_name=mask_offensive_text(trim(p_name)) where id=bid and user_id=auth.uid();
 return bid;
end $$;
create or replace function public.request_guest_appointment(p_provider bigint,p_time timestamptz,p_email text,p_server_key text,p_requester_hash text) returns jsonb language plpgsql security definer set search_path=public as $$
begin raise exception 'Please sign in to request care'; end $$;
-- Existing guest receipts remain usable for viewing/cancelling old requests.
create or replace function public.provider_appointments() returns jsonb language plpgsql stable security definer set search_path=public as $$
begin
 perform require_user();
 return coalesce((select jsonb_agg(x order by booking_time) from (
 select b.id::text id,'member' kind,b.provider_id,p.name provider,coalesce(b.contact_name,'Private member') client,b.contact_email email,b.booking_time,case when b.confirmed then 'confirmed' else 'pending' end status
 from provider_bookings b join providers p on p.id=b.provider_id where p.applicant=auth.uid() or is_admin()
 union all
 select b.id::text,'guest',b.provider_id,p.name,'Guest client',b.email,b.booking_time,b.status from guest_appointments b join providers p on p.id=b.provider_id where p.applicant=auth.uid() or is_admin()
 ) x),'[]'::jsonb);
end $$;
revoke all on function public.require_care_account(),public.book_care(bigint,timestamptz,text) from public,anon;
grant execute on function public.book_care(bigint,timestamptz,text) to authenticated;
commit;
