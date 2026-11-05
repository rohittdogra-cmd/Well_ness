begin;
-- A confirmed custom mailbox alone is not evidence of corporate/student status.
create table public.organisation_domains (
 domain text primary key check(domain = lower(domain) and domain ~ '^[a-z0-9][a-z0-9.-]+[.][a-z]{2,}$'),
 member_type text not null check(member_type in ('corporate','student')),
 created_at timestamptz not null default now()
);
alter table public.organisation_domains enable row level security;
grant select on public.organisation_domains to authenticated;
create policy domains_admin on public.organisation_domains for select to authenticated using(public.is_admin());
create function public.set_organisation_domain(p_domain text,p_type text,p_remove boolean default false) returns void language plpgsql security definer set search_path=public as $$
begin
 if not is_admin() then raise exception 'Administrator access required'; end if;
 if lower(trim(p_domain)) in ('gmail.com','yahoo.com','outlook.com','hotmail.com','icloud.com','aol.com','proton.me','protonmail.com','googlemail.com') then raise exception 'Personal email services cannot be approved as organisation domains'; end if;
 if p_remove then delete from organisation_domains where domain=lower(trim(p_domain));
 else insert into organisation_domains(domain,member_type) values(lower(trim(p_domain)),p_type) on conflict(domain) do update set member_type=excluded.member_type; end if;
end $$;
create or replace function public.verification_status() returns jsonb language plpgsql stable security definer set search_path=public as $$
declare u uuid:=require_user(); r verification_requests; verified_domain boolean;
begin
 select * into r from verification_requests where user_id=u;
 select exists(select 1 from auth.users a join organisation_domains d on d.domain=lower(split_part(a.email,'@',2)) where a.id=u and a.email_confirmed_at is not null) into verified_domain;
 return jsonb_build_object('verified',verified_domain or coalesce(r.status='approved',false),'status',case when verified_domain then 'approved' else coalesce(r.status,'unverified') end,'method',case when verified_domain then 'organisation_email' else r.method end,'reason',r.reason);
end $$;

-- Guest creation goes through the server; receipt lookup/cancellation use bearer links.
create table public.booking_gateway_config (id boolean primary key default true check(id), secret_hash text not null);
alter table public.booking_gateway_config enable row level security;
revoke all on public.booking_gateway_config from public,anon,authenticated;
-- Configure one random server secret hash before enabling guest requests in production.
-- Matching plaintext belongs only in the Vercel GUEST_BOOKING_SERVER_KEY environment variable.
-- Contact data and receipt hashes are never readable by anonymous/community users.
create table public.guest_appointments (
 id uuid primary key default gen_random_uuid(), provider_id bigint not null references providers on delete cascade,
 email text not null check(length(email)<=254), token_hash text not null, requester_hash text not null,
 booking_time timestamptz not null, status text not null default 'pending' check(status in ('pending','confirmed','cancelled')),
 created_at timestamptz not null default now()
);
alter table public.guest_appointments enable row level security;
revoke all on public.guest_appointments from public,anon,authenticated;
create index guest_appointment_slots on guest_appointments(provider_id,booking_time) where status<>'cancelled';
create index guest_appointment_rate on guest_appointments(email,created_at);
grant select(id,name,description,provider_type,status) on public.providers to anon;
create policy providers_public_care on public.providers for select to anon using(status='approved' and provider_type='psychologist');

create function public.request_guest_appointment(p_provider bigint,p_time timestamptz,p_email text,p_server_key text,p_requester_hash text) returns jsonb language plpgsql security definer set search_path=public as $$
declare receipt text:=gen_random_uuid()::text || gen_random_uuid()::text; guest_id uuid;
begin
 if p_server_key is null or not exists(select 1 from booking_gateway_config where secret_hash=encode(sha256(convert_to(p_server_key,'UTF8')),'hex')) then raise exception 'Guest booking gateway is not configured'; end if;
 if p_requester_hash is null or p_requester_hash !~ '^[0-9a-f]{64}$' then raise exception 'Invalid request identity'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_requester_hash,0));
 if (select count(*) from guest_appointments where requester_hash=p_requester_hash and created_at>now()-interval '1 hour')>=20 then raise exception 'Too many requests. Please try again later'; end if;
 p_email:=lower(trim(p_email));
 if p_email is null or length(p_email)>254 or p_email !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$' then raise exception 'Enter a valid contact email'; end if;
 if p_time is null or p_time<=now() or p_time>now()+interval '180 days' then raise exception 'Choose a time within the next 180 days'; end if;
 if not exists(select 1 from providers where id=p_provider and status='approved' and provider_type='psychologist') then raise exception 'Provider unavailable'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_email,0));
 if (select count(*) from guest_appointments where email=p_email and created_at>now()-interval '1 day')>=3 then raise exception 'You have reached the daily request limit. Please use your existing status link'; end if;
 perform pg_advisory_xact_lock(p_provider);
 if exists(select 1 from provider_bookings where provider_id=p_provider and abs(extract(epoch from booking_time-p_time))<3600) or exists(select 1 from guest_appointments where provider_id=p_provider and status<>'cancelled' and abs(extract(epoch from booking_time-p_time))<3600) then raise exception 'This time overlaps another appointment'; end if;
 insert into guest_appointments(provider_id,email,token_hash,booking_time,requester_hash) values(p_provider,p_email,encode(sha256(convert_to(receipt,'UTF8')),'hex'),p_time,p_requester_hash) returning id into guest_id;
 return jsonb_build_object('id',guest_id,'receipt',receipt);
end $$;
create function public.guest_appointment_status(p_receipt text) returns jsonb language plpgsql stable security definer set search_path=public as $$
declare output jsonb;
begin
 if p_receipt is null or length(p_receipt)<>72 then raise exception 'Invalid private appointment link'; end if;
 select jsonb_build_object('id',b.id,'provider',p.name,'booking_time',b.booking_time,'status',b.status) into output from guest_appointments b join providers p on p.id=b.provider_id where b.token_hash=encode(sha256(convert_to(p_receipt,'UTF8')),'hex');
 if output is null then raise exception 'Appointment link not found'; end if; return output;
end $$;
create function public.cancel_guest_appointment(p_receipt text) returns void language plpgsql security definer set search_path=public as $$
begin
 if p_receipt is null or length(p_receipt)<>72 then raise exception 'Invalid private appointment link'; end if;
 update guest_appointments set status='cancelled' where token_hash=encode(sha256(convert_to(p_receipt,'UTF8')),'hex') and status<>'cancelled';
 if not found then raise exception 'No active appointment found'; end if;
end $$;
create function public.provider_appointments() returns jsonb language plpgsql stable security definer set search_path=public as $$
begin
 perform require_user();
 return coalesce((select jsonb_agg(x order by booking_time) from (
 select b.id::text id,'member' kind,b.provider_id,p.name provider,'Private member' client,null::text email,b.booking_time,case when b.confirmed then 'confirmed' else 'pending' end status from provider_bookings b join providers p on p.id=b.provider_id where p.applicant=auth.uid() or is_admin()
 union all
 select b.id::text,'guest',b.provider_id,p.name,'Guest client',b.email,b.booking_time,b.status from guest_appointments b join providers p on p.id=b.provider_id where p.applicant=auth.uid() or is_admin()
 ) x),'[]'::jsonb);
end $$;
create function public.confirm_guest_appointment(p_booking uuid) returns void language plpgsql security definer set search_path=public as $$
begin
 perform require_user();
 update guest_appointments b set status='confirmed' where b.id=p_booking and b.status='pending' and exists(select 1 from providers p where p.id=b.provider_id and (p.applicant=auth.uid() or is_admin()));
 if not found then raise exception 'Not allowed or request is no longer pending'; end if;
end $$;
create or replace function public.book_provider(p_provider bigint,p_time timestamptz) returns bigint language plpgsql security definer set search_path=public as $$
declare bid bigint;
begin
 perform require_user();
 if p_time is null or p_time<=now() or p_time>now()+interval '180 days' then raise exception 'Choose a time within the next 180 days'; end if;
 if not exists(select 1 from providers where id=p_provider and status='approved') then raise exception 'Provider unavailable'; end if;
 perform pg_advisory_xact_lock(p_provider);
 if exists(select 1 from provider_bookings where provider_id=p_provider and abs(extract(epoch from booking_time-p_time))<3600) or exists(select 1 from guest_appointments where provider_id=p_provider and status<>'cancelled' and abs(extract(epoch from booking_time-p_time))<3600) then raise exception 'This time overlaps another appointment'; end if;
 insert into provider_bookings(provider_id,user_id,booking_time) values(p_provider,auth.uid(),p_time) returning id into bid; return bid;
end $$;

create function public.notify_care_workflow() returns trigger language plpgsql security definer set search_path=public as $$
declare owner_id uuid; target bigint; provider_name text;
begin
 if tg_table_name='providers' then
  if tg_op='INSERT' then
   insert into notifications(user_id,message,href) select user_id,'A provider application is ready for review.','/dashboard' from admins;
   insert into notifications(user_id,message,href) values(new.applicant,'Your provider application is awaiting review.','/provider');
  elsif new.status is distinct from old.status then
   insert into notifications(user_id,message,href) values(new.applicant,'Your provider application is '||new.status||'.','/provider');
  end if;
  return new;
 end if;
 if tg_op='DELETE' then target:=old.provider_id; else target:=new.provider_id; end if;
 select applicant,name into owner_id,provider_name from providers where id=target;
 if owner_id is null then return coalesce(new,old); end if;
 if tg_op='INSERT' then
  insert into notifications(user_id,message,href) values(owner_id,'New private appointment request for '||provider_name||'.','/provider');
  if tg_table_name='provider_bookings' then insert into notifications(user_id,message,href) values(new.user_id,'Your appointment request is awaiting confirmation.','/my-sessions#appointments'); end if;
 elsif tg_op='DELETE' then
  insert into notifications(user_id,message,href) values(owner_id,'An appointment request was cancelled.','/provider');
  if tg_table_name='provider_bookings' then insert into notifications(user_id,message,href) values(old.user_id,'Your appointment was cancelled.','/my-sessions#appointments'); end if;
 elsif tg_table_name='guest_appointments' then
  if new.status is distinct from old.status and new.status='cancelled' then insert into notifications(user_id,message,href) values(owner_id,'A guest appointment was cancelled.','/provider'); end if;
 elsif new.confirmed and not old.confirmed then
  insert into notifications(user_id,message,href) values(new.user_id,'Your appointment with '||provider_name||' is confirmed.','/my-sessions#appointments');
 end if;
 return coalesce(new,old);
end $$;
create trigger notify_provider after insert or update on providers for each row execute function notify_care_workflow();
create trigger notify_member_booking after insert or update or delete on provider_bookings for each row execute function notify_care_workflow();
create trigger notify_guest_booking after insert or update on guest_appointments for each row execute function notify_care_workflow();
revoke all on function public.set_organisation_domain(text,text,boolean),public.request_guest_appointment(bigint,timestamptz,text,text,text),public.guest_appointment_status(text),public.cancel_guest_appointment(text),public.provider_appointments(),public.confirm_guest_appointment(uuid),public.notify_care_workflow() from public,anon,authenticated;
grant execute on function public.request_guest_appointment(bigint,timestamptz,text,text,text),public.guest_appointment_status(text),public.cancel_guest_appointment(text) to anon,authenticated;
grant execute on function public.set_organisation_domain(text,text,boolean),public.provider_appointments(),public.confirm_guest_appointment(uuid) to authenticated;
commit;
