-- Wellness Hub: apply to an empty, dedicated Supabase project.

-- Migration: 202609270001_wellness.sql
-- One private community per deployment. All authorization lives in Postgres.
begin;
create table public.profiles (
 id uuid primary key references auth.users on delete cascade,
 alias_seed uuid not null default gen_random_uuid(),
 name text not null default '' check (char_length(name)<=50),
 avatar integer not null default 0 check (avatar between 0 and 5),
 bio text not null default '' check (char_length(bio)<=160),
 interests text[] not null default '{}', availability text[] not null default '{}',
 goal text not null default '' check (char_length(goal)<=100),
 created_at timestamptz not null default now()
);
create table public.admins (user_id uuid primary key references auth.users on delete cascade);
create function public.is_admin() returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from admins where user_id=auth.uid()) $$;
create function public.new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin insert into profiles(id) values(new.id); return new; end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.new_user();
insert into profiles(id) select id from auth.users on conflict do nothing;

create table public.groups (
 id bigint generated always as identity primary key, slug text unique not null check(slug ~ '^[a-z0-9-]{2,80}$'),
 name text not null check(char_length(trim(name)) between 2 and 60),
 description text not null check(char_length(description)<=500),
 creator uuid references auth.users on delete set null, created_at timestamptz not null default now()
);
create table public.group_members (group_id bigint references groups on delete cascade, user_id uuid references auth.users on delete cascade, created_at timestamptz not null default now(), primary key(group_id,user_id));
create table public.posts (
 id bigint generated always as identity primary key,
 group_id bigint references groups on delete cascade,
 parent_id bigint references posts on delete cascade,
 author_id uuid not null references auth.users on delete cascade,
 body text not null check(char_length(trim(body)) between 1 and 3000),
 anonymous boolean not null default false, hidden boolean not null default false,
 created_at timestamptz not null default now()
);
create table public.post_likes (post_id bigint references posts on delete cascade, user_id uuid references auth.users on delete cascade, primary key(post_id,user_id));
create table public.reports (
 id bigint generated always as identity primary key, post_id bigint not null references posts on delete cascade,
 reporter uuid not null references auth.users on delete cascade, reason text not null check(char_length(trim(reason)) between 5 and 500),
 resolved boolean not null default false, created_at timestamptz not null default now(), unique(post_id,reporter)
);
create table public.sessions (
 id bigint generated always as identity primary key, creator uuid not null references auth.users on delete cascade,
 title text not null check(char_length(trim(title)) between 3 and 100), description text not null check(char_length(description)<=3000),
 program_type text not null check(program_type in ('boxCricket','socialGathering','exercise','pickleball','taskAllocation','tennis','badminton','meetup')),
 date_time timestamptz not null, max_participants integer not null check(max_participants between 1 and 200),
 space_name text check(char_length(space_name)<=120), location text check(char_length(location)<=200), created_at timestamptz not null default now()
);
create table public.session_members(session_id bigint references sessions on delete cascade, user_id uuid references auth.users on delete cascade, primary key(session_id,user_id));
create table public.tasks (
 id bigint generated always as identity primary key, session_id bigint not null references sessions on delete cascade,
 creator uuid not null references auth.users on delete cascade, assigned_to uuid references auth.users on delete set null,
 title text not null check(char_length(trim(title)) between 1 and 160), description text not null check(char_length(description)<=2000),
 completed boolean not null default false, created_at timestamptz not null default now()
);
create table public.providers (
 id bigint generated always as identity primary key, applicant uuid not null references auth.users on delete cascade,
 name text not null check(char_length(trim(name)) between 2 and 100), description text not null check(char_length(trim(description)) between 20 and 4000),
 provider_type text not null check(provider_type in ('psychologist','sportsCompany')),
 status text not null default 'pending' check(status in ('pending','approved','rejected')), created_at timestamptz not null default now()
);
create table public.provider_bookings (
 id bigint generated always as identity primary key, provider_id bigint not null references providers on delete cascade,
 user_id uuid not null references auth.users on delete cascade, booking_time timestamptz not null,
 confirmed boolean not null default false, created_at timestamptz not null default now(), unique(provider_id,booking_time)
);
create table public.check_ins (user_id uuid references auth.users on delete cascade, day date not null, mood text not null check(mood in ('Great','Good','Okay','Low','Overwhelmed')), primary key(user_id,day));
create table public.notifications (id bigint generated always as identity primary key, user_id uuid not null references auth.users on delete cascade, message text not null, href text not null, read boolean not null default false, created_at timestamptz not null default now());
create table public.contact_requests (id bigint generated always as identity primary key, user_id uuid not null references auth.users on delete cascade, subject text not null check(char_length(subject) between 2 and 150), message text not null check(char_length(message) between 10 and 3000), created_at timestamptz not null default now());

create index posts_feed on posts(group_id,parent_id,created_at desc);
create index members_user on group_members(user_id);
create index sessions_date on sessions(date_time);
create index session_members_user on session_members(user_id);
create index tasks_session on tasks(session_id);
create index notifications_user on notifications(user_id,created_at desc);
create index bookings_user on provider_bookings(user_id);

-- Explicit grants + RLS, including otherwise inaccessible author identities.
do $$ declare t text; begin
 foreach t in array array['profiles','admins','groups','group_members','posts','post_likes','reports','sessions','session_members','tasks','providers','provider_bookings','check_ins','notifications','contact_requests'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on public.%I from anon, authenticated',t);
 end loop;
end $$;
grant select,insert,update on profiles to authenticated;
create policy profile_read on profiles for select to authenticated using(id=auth.uid() or is_admin());
create policy profile_insert on profiles for insert to authenticated with check(id=auth.uid());
create policy profile_update on profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
grant select on groups,group_members,sessions,session_members to authenticated;
create policy groups_read on groups for select to authenticated using(true);
create policy group_members_read on group_members for select to authenticated using(true);
create policy sessions_read on sessions for select to authenticated using(true);
create policy session_members_read on session_members for select to authenticated using(true);
grant select on tasks to authenticated;
create policy tasks_read on tasks for select to authenticated using(creator=auth.uid() or assigned_to=auth.uid() or is_admin() or exists(select 1 from session_members m where m.session_id=tasks.session_id and m.user_id=auth.uid()));
grant select on providers to authenticated;
create policy providers_read on providers for select to authenticated using(status='approved' or applicant=auth.uid() or is_admin());
grant select on provider_bookings to authenticated;
create policy bookings_read on provider_bookings for select to authenticated using(user_id=auth.uid() or is_admin() or exists(select 1 from providers p where p.id=provider_id and p.applicant=auth.uid()));
grant select,insert,update on check_ins to authenticated;
create policy checkins_own on check_ins for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
grant select on notifications to authenticated;
grant update(read) on notifications to authenticated;
create policy notifications_own on notifications for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
grant select on reports to authenticated;
create policy reports_admin on reports for select to authenticated using(is_admin());
grant insert,select on contact_requests to authenticated;
grant usage on sequence contact_requests_id_seq to authenticated;
create policy contact_insert on contact_requests for insert to authenticated with check(user_id=auth.uid());
create policy contact_read on contact_requests for select to authenticated using(user_id=auth.uid() or is_admin());

create function public.require_user() returns uuid language plpgsql stable security definer set search_path=public as $$
begin if auth.uid() is null then raise exception 'Please sign in'; end if; return auth.uid(); end $$;
create function public.create_group(p_name text,p_description text) returns bigint language plpgsql security definer set search_path=public as $$
declare u uuid:=require_user(); gid bigint; begin
 if (select count(*) from groups where creator=u and created_at>now()-interval '1 day')>=5 then raise exception 'You can create up to 5 groups per day'; end if;
 insert into groups(slug,name,description,creator) values(trim(both '-' from regexp_replace(lower(p_name),'[^a-z0-9]+','-','g'))||'-'||substr(gen_random_uuid()::text,1,8),trim(p_name),trim(p_description),u) returning id into gid;
 insert into group_members values(gid,u,now()); return gid;
end $$;
create function public.toggle_group(p_group bigint,p_join boolean) returns void language plpgsql security definer set search_path=public as $$
declare u uuid:=require_user(); begin
 if p_join then insert into group_members(group_id,user_id) values(p_group,u) on conflict do nothing;
 else delete from group_members where group_id=p_group and user_id=u; end if;
end $$;
create function public.publish_post(p_body text,p_group bigint default null,p_parent bigint default null,p_anonymous boolean default false) returns bigint language plpgsql security definer set search_path=public as $$
declare u uuid:=require_user(); pid bigint; parent posts; begin
 perform pg_advisory_xact_lock(hashtextextended(u::text,0));
 if (select count(*) from posts where author_id=u and created_at>now()-interval '1 minute')>=5 then raise exception 'Take a moment before posting again'; end if;
 if p_group is not null and not exists(select 1 from group_members where group_id=p_group and user_id=u) then raise exception 'Join this group before posting'; end if;
 if p_parent is not null then
 select * into parent from posts where id=p_parent and not hidden and parent_id is null;
 if not found or parent.group_id is distinct from p_group then raise exception 'Conversation unavailable'; end if;
 end if;
 insert into posts(body,group_id,parent_id,author_id,anonymous) values(trim(p_body),p_group,p_parent,u,p_anonymous) returning id into pid;
 if p_parent is not null and parent.author_id<>u then insert into notifications(user_id,message,href) values(parent.author_id,'Someone replied to your conversation.',case when p_group is null then '/discuss' else '/groups/'||(select slug from groups where id=p_group) end); end if;
 return pid;
end $$;
create function public.get_feed(p_group bigint default null,p_before bigint default null,p_limit integer default 20) returns jsonb language plpgsql stable security definer set search_path=public as $$
declare u uuid:=require_user(); begin
 return coalesce((select jsonb_agg(row_data order by id desc) from (
 select p.id,jsonb_build_object('id',p.id,'body',p.body,'created_at',p.created_at,'anonymous',p.anonymous,'mine',p.author_id=u,
 'alias',case when p.anonymous then 'Quiet '||substr(md5(pr.alias_seed::text||coalesce(p.group_id::text,'lounge')),1,6) else coalesce(nullif(pr.name,''),'Community member') end,
 'likes',(select count(*) from post_likes where post_id=p.id),'liked',exists(select 1 from post_likes where post_id=p.id and user_id=u),
 'replies',coalesce((select jsonb_agg(jsonb_build_object('id',r.id,'body',r.body,'created_at',r.created_at,'mine',r.author_id=u,'alias',case when r.anonymous then 'Quiet '||substr(md5(rp.alias_seed::text||coalesce(r.group_id::text,'lounge')),1,6) else coalesce(nullif(rp.name,''),'Community member') end) order by r.id) from posts r left join profiles rp on rp.id=r.author_id where r.parent_id=p.id and not r.hidden),'[]'::jsonb)) row_data
 from posts p left join profiles pr on pr.id=p.author_id where p.group_id is not distinct from p_group and p.parent_id is null and not p.hidden and (p_before is null or p.id<p_before) order by p.id desc limit least(greatest(p_limit,1),50)
 ) q),'[]'::jsonb);
end $$;
create function public.react_post(p_post bigint,p_like boolean) returns void language plpgsql security definer set search_path=public as $$
declare u uuid:=require_user(); begin
 if not exists(select 1 from posts where id=p_post and not hidden) then raise exception 'Conversation unavailable'; end if;
 if p_like then insert into post_likes values(p_post,u) on conflict do nothing; else delete from post_likes where post_id=p_post and user_id=u; end if;
end $$;
create function public.delete_post(p_post bigint) returns void language plpgsql security definer set search_path=public as $$
begin perform require_user(); delete from posts where id=p_post and (author_id=auth.uid() or is_admin()); if not found then raise exception 'Not allowed'; end if; end $$;
create function public.report_post(p_post bigint,p_reason text) returns void language plpgsql security definer set search_path=public as $$
begin insert into reports(post_id,reporter,reason) values(p_post,require_user(),trim(p_reason)) on conflict(post_id,reporter) do update set reason=excluded.reason,resolved=false; end $$;
create function public.moderate_post(p_report bigint,p_hide boolean) returns void language plpgsql security definer set search_path=public as $$
begin if not is_admin() then raise exception 'Admin access required'; end if;
 if p_hide then update posts set hidden=true where id=(select post_id from reports where id=p_report); end if;
 update reports set resolved=true where id=p_report;
end $$;

create function public.create_session(p_title text,p_description text,p_type text,p_date timestamptz,p_capacity integer,p_space text default null,p_location text default null) returns bigint language plpgsql security definer set search_path=public as $$
declare sid bigint; u uuid:=require_user(); begin
 if p_date<=now() then raise exception 'Choose a future date'; end if;
 insert into sessions(creator,title,description,program_type,date_time,max_participants,space_name,location) values(u,trim(p_title),p_description,p_type,p_date,p_capacity,p_space,p_location) returning id into sid;
 insert into session_members values(sid,u); return sid;
end $$;
create function public.join_session(p_session bigint,p_join boolean) returns void language plpgsql security definer set search_path=public as $$
declare s sessions; u uuid:=require_user(); begin
 select * into s from sessions where id=p_session for update;
 if not found then raise exception 'Session unavailable'; end if;
 if p_join then
 if exists(select 1 from session_members where session_id=p_session and user_id=u) then return; end if;
 if s.date_time<=now() then raise exception 'This session has already started'; end if;
 if (select count(*) from session_members where session_id=p_session)>=s.max_participants then raise exception 'This session is full'; end if;
 insert into session_members values(p_session,u);
 else delete from session_members where session_id=p_session and user_id=u; end if;
end $$;
create function public.delete_session(p_session bigint) returns void language plpgsql security definer set search_path=public as $$
begin perform require_user();
 if not exists(select 1 from sessions where id=p_session and (creator=auth.uid() or is_admin())) then raise exception 'Only the organizer can cancel this session'; end if;
 insert into notifications(user_id,message,href) select m.user_id,'Session cancelled: '||s.title,'/my-sessions' from session_members m join sessions s on s.id=m.session_id where s.id=p_session;
 delete from sessions where id=p_session;
end $$;
create function public.create_task(p_session bigint,p_title text,p_description text,p_assigned uuid default null) returns bigint language plpgsql security definer set search_path=public as $$
declare tid bigint; u uuid:=require_user(); begin
 if not exists(select 1 from sessions where id=p_session and creator=u) and not exists(select 1 from session_members where session_id=p_session and user_id=u) then raise exception 'Join this session first'; end if;
 if p_assigned is not null and not exists(select 1 from session_members where session_id=p_session and user_id=p_assigned) then raise exception 'Assign tasks to a participant of this session'; end if;
 insert into tasks(session_id,creator,title,description,assigned_to) values(p_session,u,trim(p_title),p_description,p_assigned) returning id into tid; return tid;
end $$;
create function public.complete_task(p_task bigint) returns void language plpgsql security definer set search_path=public as $$
begin perform require_user(); update tasks set completed=true where id=p_task and (creator=auth.uid() or assigned_to=auth.uid() or is_admin()); if not found then raise exception 'Only the task owner or assignee can complete it'; end if; end $$;
create function public.apply_provider(p_type text,p_name text,p_description text) returns bigint language plpgsql security definer set search_path=public as $$
declare pid bigint; begin insert into providers(applicant,name,description,provider_type) values(require_user(),p_name,p_description,p_type) returning id into pid; return pid; end $$;
create function public.review_provider(p_provider bigint,p_approve boolean) returns void language plpgsql security definer set search_path=public as $$
begin if not is_admin() then raise exception 'Admin access required'; end if; update providers set status=case when p_approve then 'approved' else 'rejected' end where id=p_provider; end $$;
-- Appointments are requests; administrators/providers confirm them separately.
create function public.book_provider(p_provider bigint,p_time timestamptz) returns bigint language plpgsql security definer set search_path=public as $$
declare bid bigint; begin
 perform require_user();
 if p_time<=now() or p_time>now()+interval '180 days' then raise exception 'Choose a time within the next 180 days'; end if;
 if not exists(select 1 from providers where id=p_provider and status='approved') then raise exception 'Provider unavailable'; end if;
 perform pg_advisory_xact_lock(p_provider);
 if exists(select 1 from provider_bookings where provider_id=p_provider and abs(extract(epoch from booking_time-p_time))<3600) then raise exception 'This time overlaps another appointment'; end if;
 insert into provider_bookings(provider_id,user_id,booking_time) values(p_provider,auth.uid(),p_time) returning id into bid; return bid;
end $$;
create function public.cancel_booking(p_booking bigint) returns void language plpgsql security definer set search_path=public as $$
begin perform require_user(); delete from provider_bookings where id=p_booking and (user_id=auth.uid() or is_admin()); if not found then raise exception 'Not allowed'; end if; end $$;
create function public.confirm_booking(p_booking bigint) returns void language plpgsql security definer set search_path=public as $$
begin perform require_user(); update provider_bookings b set confirmed=true where b.id=p_booking and (is_admin() or exists(select 1 from providers p where p.id=b.provider_id and p.applicant=auth.uid())); if not found then raise exception 'Not allowed'; end if; end $$;

-- Default PUBLIC execution would otherwise expose security-definer operations.
revoke execute on all functions in schema public from public,anon;
grant execute on function public.is_admin(),public.create_group(text,text),public.toggle_group(bigint,boolean),public.publish_post(text,bigint,bigint,boolean),public.get_feed(bigint,bigint,integer),public.react_post(bigint,boolean),public.delete_post(bigint),public.report_post(bigint,text),public.moderate_post(bigint,boolean),public.create_session(text,text,text,timestamptz,integer,text,text),public.join_session(bigint,boolean),public.delete_session(bigint),public.create_task(bigint,text,text,uuid),public.complete_task(bigint),public.apply_provider(text,text,text),public.review_provider(bigint,boolean),public.book_provider(bigint,timestamptz),public.cancel_booking(bigint),public.confirm_booking(bigint) to authenticated;

insert into groups(slug,name,description) values
 ('cricket','Cricket','Find a team. Plan your next match.'),('badminton','Badminton','Find a doubles partner or an after-work game.'),
 ('music','Music','Share playlists and discover new sounds.'),('health-wellness','Health & wellness','Build better habits together.'),
 ('food-dining','Food & dining','Recipes, coffee breaks and good company.'),('career-growth','Career growth','Learn something new and support each other.'),
 ('movies','Movies','Your next great watch starts here.'),('travel','Travel','Weekend escapes and stories from the road.'),
 ('technology','Technology','Curiosity, tools and ideas worth sharing.'),('sports','Sports','Find your next game.'),
 ('books','Books','Good books. Better conversations.'),('creativity','Creativity','Make something just for the joy of it.');
commit;



-- Migration: 202609270002_operations.sql
-- Additions to the core migration: read-only audit history and moderation content.
begin;
create table public.activity_logs (
 id bigint generated always as identity primary key,
 user_id uuid not null references auth.users on delete cascade,
 activity_type text not null, related_id bigint not null,
 created_at timestamptz not null default now()
);
alter table public.activity_logs enable row level security;
revoke all on public.activity_logs from anon,authenticated;
grant select on public.activity_logs to authenticated;
create policy activity_logs_read on public.activity_logs for select to authenticated using(user_id=auth.uid() or public.is_admin());
create index activity_logs_user on public.activity_logs(user_id,created_at desc);
create function public.audit_wellness() returns trigger language plpgsql security definer set search_path=public as $$
declare actor uuid:=auth.uid(); kind text; related bigint; begin
 if actor is null then return coalesce(new,old); end if;
 if tg_table_name='sessions' then kind:='sessionCreated';related:=new.id;
 elsif tg_table_name='session_members' then
  kind:=case when tg_op='DELETE' then 'sessionLeft' else 'sessionJoined' end;related:=coalesce(new.session_id,old.session_id);
 elsif tg_table_name='tasks' then
  if tg_op='UPDATE' and (not new.completed or old.completed) then return new; end if;
  kind:=case when tg_op='INSERT' then 'taskCreated' else 'taskCompleted' end;related:=new.id;
 else kind:='providerBooked';related:=new.id;
 end if;
 insert into activity_logs(user_id,activity_type,related_id) values(actor,kind,related);
 return coalesce(new,old);
end $$;
create trigger audit_sessions after insert on public.sessions for each row execute function public.audit_wellness();
create trigger audit_members after insert or delete on public.session_members for each row execute function public.audit_wellness();
create trigger audit_tasks after insert or update on public.tasks for each row execute function public.audit_wellness();
create trigger audit_bookings after insert on public.provider_bookings for each row execute function public.audit_wellness();
create function public.get_reports() returns jsonb language plpgsql stable security definer set search_path=public as $$
begin
 if not is_admin() then raise exception 'Admin access required'; end if;
 return coalesce((select jsonb_agg(x) from (select r.id,r.reason,p.body,p.author_id,r.created_at from reports r join posts p on p.id=r.post_id where not r.resolved order by r.created_at limit 100) x),'[]'::jsonb);
end $$;
revoke execute on function public.audit_wellness(),public.get_reports() from public,anon;
grant execute on function public.get_reports() to authenticated;
commit;


-- Migration: 202609270003_session_updates.sql
begin;
create function public.update_session(p_session bigint,p_title text default null,p_description text default null,p_date timestamptz default null,p_capacity integer default null,p_space text default null,p_location text default null) returns void language plpgsql security definer set search_path=public as $$
declare s sessions; begin
 perform require_user();
 select * into s from sessions where id=p_session for update;
 if not found or (s.creator<>auth.uid() and not is_admin()) then raise exception 'Only the organizer can edit this session'; end if;
 if coalesce(p_date,s.date_time)<=now() then raise exception 'Choose a future date'; end if;
 if p_capacity is not null and p_capacity<(select count(*) from session_members where session_id=p_session) then raise exception 'Capacity cannot be lower than the current participant count'; end if;
 update sessions set title=coalesce(p_title,title),description=coalesce(p_description,description),date_time=coalesce(p_date,date_time),max_participants=coalesce(p_capacity,max_participants),space_name=coalesce(p_space,space_name),location=coalesce(p_location,location) where id=p_session;
 insert into notifications(user_id,message,href) select user_id,'Session updated: '||coalesce(p_title,s.title),'/sessions/'||p_session from session_members where session_id=p_session and user_id<>auth.uid();
end $$;
revoke execute on function public.update_session(bigint,text,text,timestamptz,integer,text,text) from public,anon;
grant execute on function public.update_session(bigint,text,text,timestamptz,integer,text,text) to authenticated;
commit;


-- Migration: 202609300001_connections.sql
begin;
-- Expose only intentional public profile fields through the directory function.
-- Existing profile policies continue protecting preferences and alias seeds.
create table public.connections (
 id bigint generated always as identity primary key,
 requester uuid not null references auth.users on delete cascade,
 recipient uuid not null references auth.users on delete cascade,
 status text not null default 'pending' check(status in ('pending','accepted','declined')),
 created_at timestamptz not null default now(),
 check(requester<>recipient)
);
create unique index connections_pair on public.connections(least(requester,recipient),greatest(requester,recipient));
create index connections_recipient on public.connections(recipient);
create table public.direct_messages (
 id bigint generated always as identity primary key,
 connection_id bigint not null references public.connections on delete cascade,
 sender uuid not null references auth.users on delete cascade,
 body text not null check(char_length(trim(body)) between 1 and 3000),
 created_at timestamptz not null default now()
);
create index direct_messages_thread on public.direct_messages(connection_id,id desc);
alter table public.connections enable row level security;
alter table public.direct_messages enable row level security;
revoke all on public.connections,public.direct_messages from anon,authenticated;
grant select on public.connections,public.direct_messages to authenticated;
create policy connections_participants on public.connections for select to authenticated
 using(auth.uid() in (requester,recipient));
create policy messages_participants on public.direct_messages for select to authenticated
 using(exists(select 1 from public.connections c where c.id=connection_id and auth.uid() in (c.requester,c.recipient)));

create function public.find_members(p_search text default '',p_offset integer default 0)
returns table(id uuid,name text,avatar integer,bio text,interests text[]) language plpgsql stable security definer set search_path=public as $$
begin
 perform require_user();
 return query select p.id,p.name,p.avatar,p.bio,p.interests from profiles p
 where p.id<>auth.uid() and char_length(trim(p.name))>=2
 and (coalesce(p_search,'')='' or position(lower(left(p_search,100)) in lower(p.name))>0)
 order by p.name,p.id limit 30 offset greatest(coalesce(p_offset,0),0);
end $$;

create function public.request_connection(p_member uuid) returns bigint language plpgsql security definer set search_path=public as $$
declare u uuid:=require_user(); cid bigint;
begin
 if p_member=u or not exists(select 1 from profiles where id=p_member and char_length(trim(name))>=2)
 then raise exception 'Choose an available member'; end if;
 if not exists(select 1 from profiles where id=u and char_length(trim(name))>=2)
 then raise exception 'Complete your profile first'; end if;
 insert into connections(requester,recipient) values(u,p_member) on conflict do nothing returning id into cid;
 if cid is null then
   select id into cid from connections where least(requester,recipient)=least(u,p_member) and greatest(requester,recipient)=greatest(u,p_member);
 else
   insert into notifications(user_id,message,href) values(p_member,'You have a new connection request.','/people');
 end if;
 return cid;
end $$;

create function public.respond_connection(p_connection bigint,p_accept boolean) returns void language plpgsql security definer set search_path=public as $$
declare u uuid:=require_user(); c connections;
begin
 select * into c from connections where id=p_connection for update;
 if not found or c.recipient<>u or c.status<>'pending' then raise exception 'This request is unavailable'; end if;
 update connections set status=case when p_accept then 'accepted' else 'declined' end where id=c.id;
 if p_accept then insert into notifications(user_id,message,href) values(c.requester,'Your connection request was accepted. You can now chat.','/people'); end if;
end $$;

create function public.list_connections() returns table(id bigint,requester uuid,recipient uuid,status text,member_id uuid,name text,avatar integer)
language plpgsql stable security definer set search_path=public as $$
begin
 perform require_user();
 return query select c.id,c.requester,c.recipient,c.status,p.id,p.name,p.avatar from connections c
 join profiles p on p.id=case when c.requester=auth.uid() then c.recipient else c.requester end
 where auth.uid() in(c.requester,c.recipient) order by c.created_at desc;
end $$;

create function public.send_direct_message(p_connection bigint,p_body text) returns bigint language plpgsql security definer set search_path=public as $$
declare u uuid:=require_user(); c connections; mid bigint;
begin
 select * into c from connections where id=p_connection for update;
 if not found or c.status<>'accepted' or u not in(c.requester,c.recipient) then raise exception 'An accepted connection is required'; end if;
 insert into direct_messages(connection_id,sender,body) values(c.id,u,trim(p_body)) returning id into mid;
 return mid;
end $$;

revoke all on function public.find_members(text,integer),public.request_connection(uuid),public.respond_connection(bigint,boolean),public.list_connections(),public.send_direct_message(bigint,text) from public,anon;
grant execute on function public.find_members(text,integer),public.request_connection(uuid),public.respond_connection(bigint,boolean),public.list_connections(),public.send_direct_message(bigint,text) to authenticated;
commit;


-- Migration: 202610010001_group_categories.sql
begin;
alter table public.groups add column category text not null default 'social'
  check(category in ('sports','wellbeing','arts','learning','social','outdoors'));
update public.groups set category=case
 when slug in ('cricket','badminton','sports') then 'sports'
 when slug='health-wellness' then 'wellbeing'
 when slug in ('music','movies','creativity') then 'arts'
 when slug in ('career-growth','technology','books') then 'learning'
 when slug='travel' then 'outdoors' else 'social' end;
create index groups_category on public.groups(category);
insert into public.groups(slug,name,description,category) values
 ('football','Football','Find a five-a-side team or plan a weekend kickabout.','sports'),
 ('basketball','Basketball','Find your court, your team and your next pickup game.','sports'),
 ('volleyball','Volleyball','Build a team for a friendly game at the net.','sports'),
 ('pickleball','Pickleball','New to the game or ready for doubles? Find a partner.','sports'),
 ('tennis','Tennis','Rally with someone new and arrange your next match.','sports'),
 ('table-tennis','Table tennis','Turn a short break into a friendly match.','sports'),
 ('yoga','Yoga','Stretch, breathe and build a practice together.','wellbeing'),
 ('mindfulness','Mindfulness','Share simple ways to slow down and reset.','wellbeing'),
 ('fitness','Fitness','Find workout partners and encourage consistent habits.','wellbeing'),
 ('photography','Photography','Share your perspective and plan a photo walk.','arts'),
 ('dance','Dance','Discover new styles and people who love to move.','arts'),
 ('study-circles','Study circles','Find study partners, share resources and learn together.','learning'),
 ('languages','Languages','Practice a new language through friendly conversation.','learning'),
 ('coffee-chats','Coffee chats','Make time for a coffee and a new connection.','social'),
 ('board-games','Board games','Bring your favourite game and find your next table.','social'),
 ('cooking','Cooking','Swap recipes and explore something delicious.','social'),
 ('hiking','Hiking','Discover local trails and plan a walk with good company.','outdoors'),
 ('cycling','Cycling','Find riding partners and explore new routes.','outdoors')
on conflict(slug) do nothing;
drop function public.create_group(text,text);
create function public.create_group(p_name text,p_description text,p_category text default 'social')
returns bigint language plpgsql security definer set search_path=public as $$
declare u uuid:=require_user(); gid bigint; begin
 perform pg_advisory_xact_lock(hashtextextended(u::text,1));
 if (select count(*) from groups where creator=u and created_at>now()-interval '1 day')>=5 then raise exception 'You can create up to 5 groups per day'; end if;
 insert into groups(slug,name,description,creator,category)
 values(trim(both '-' from regexp_replace(lower(p_name),'[^a-z0-9]+','-','g'))||'-'||substr(gen_random_uuid()::text,1,8),trim(p_name),trim(p_description),u,p_category) returning id into gid;
 insert into group_members values(gid,u,now()); return gid;
end $$;
revoke all on function public.create_group(text,text,text) from public,anon;
grant execute on function public.create_group(text,text,text) to authenticated;
commit;


-- Migration: 202610250001_verification.sql
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

-- BEGIN GENERATED CONTENT MASKING
-- Generated by node scripts/build-moderation-sql.mjs from the shared dictionary.
-- Masks new writes even when callers bypass the website. Existing rows are
-- masked on reads by the shared REST client; no destructive backfill is run.
begin;
create or replace function public.mask_offensive_text(value text) returns text
language plpgsql immutable strict set search_path=public as $fn$
declare remaining text:=value; output text:=''; token text[]; position integer;
begin
 loop
  token:=regexp_match(remaining,$pattern$(?<![[:alnum:]ऀ-ॿ])(?:m{1,3}[[:space:]._*\-]?[o0]{1,3}[[:space:]._*\-]?[t7]{1,3}[[:space:]._*\-]?h{1,3}[[:space:]._*\-]?[e3]{1,3}[[:space:]._*\-]?r{1,3}[[:space:]._*\-]?f{1,3}[[:space:]._*\-]?u{1,3}[[:space:]._*\-]?c{1,3}[[:space:]._*\-]?k{1,3}[[:space:]._*\-]?[e3]{1,3}[[:space:]._*\-]?r{1,3}[[:space:]._*\-]?[s$5]{1,3}|m{1,3}[[:space:]._*\-]?[o0]{1,3}[[:space:]._*\-]?[t7]{1,3}[[:space:]._*\-]?h{1,3}[[:space:]._*\-]?[e3]{1,3}[[:space:]._*\-]?r{1,3}[[:space:]._*\-]?f{1,3}[[:space:]._*\-]?u{1,3}[[:space:]._*\-]?c{1,3}[[:space:]._*\-]?k{1,3}[[:space:]._*\-]?[i!1]{1,3}[[:space:]._*\-]?n{1,3}[[:space:]._*\-]?[g69]{1,3}|m{1,3}[[:space:]._*\-]?[o0]{1,3}[[:space:]._*\-]?[t7]{1,3}[[:space:]._*\-]?h{1,3}[[:space:]._*\-]?[e3]{1,3}[[:space:]._*\-]?r{1,3}[[:space:]._*\-]?f{1,3}[[:space:]._*\-]?u{1,3}[[:space:]._*\-]?c{1,3}[[:space:]._*\-]?k{1,3}[[:space:]._*\-]?[e3]{1,3}[[:space:]._*\-]?r{1,3}|[b8]{1,3}[[:space:]._*\-]?h{1,3}[[:space:]._*\-]?[o0]{1,3}[[:space:]._*\-]?[s$5]{1,3}[[:space:]._*\-]?d{1,3}[[:space:]._*\-]?[i!1]{1,3}[[:space:]._*\-]?w{1,3}[[:space:]._*\-]?[a@4]{1,3}[[:space:]._*\-]?l{1,3}[[:space:]._*\-]?[e3]{1,3}|[a@4]{1,3}[[:space:]._*\-]?r{1,3}[[:space:]._*\-]?[s$5]{1,3}[[:space:]._*\-]?[e3]{1,3}[[:space:]._*\-]?h{1,3}[[:space:]._*\-]?[o0]{1,3}[[:space:]._*\-]?l{1,3}[[:space:]._*\-]?[e3]{1,3}[[:space:]._*\-]?[s$5]{1,3}|d{1,3}[[:space:]._*\-]?[i!1]{1,3}[[:space:]._*\-]?c{1,3}[[:space:]._*\-]?k{1,3}[[:space:]._*\-]?h{1,3}[[:space:]._*\-]?[e3]{1,3}[[:space:]._*\-]?[a@4]{1,3}[[:space:]._*\-]?d{1,3}[[:space:]._*\-]?[s$5]{1,3}|d{1,3}[[:space:]._*\-]?u{1,3}[[:space:]._*\-]?m{1,3}[[:space:]._*\-]?[b8]{1,3}[[:space:]._*\-]?[a@4]{1,3}[[:space:]._*\-]?[s$5]{1,3}[[:space:]._*\-]?[s$5]{1,3}[[:space:]._*\-]?[e3]{1,3}[[:space:]._*\-]?[s$5]{1,3}|c{1,3}[[:space:]._*\-]?h{1,3}[[:space:]._*\-]?u{1,3}[[:space:]._*\-]?[t7]{1,3}[[:space:]._*\-]?[i!1]{1,3}[[:space:]._*\-]?y{1,3}[[:space:]._*\-]?[a@4]{1,3}[[:space:]._*\-]?p{1,3}[[:space:]._*\-]?[a@4]{1,3}|m{1,3}[[:space:]._*\-]?[a@4]{1,3}[[:space:]._*\-]?d{1,3}[[:space:]._*\-]?[a@4]{1,3}[[:space:]._*\-]?r{1,3}[[:space:]._*\-]?c{1,3}[[:space:]._*\-]?h{1,3}[[:space:]._*\-]?[o0]{1,3}[[:space:]._*\-]?d{1,3}|m{1,3}[[:space:]._*\-]?[a@4]{1,3}[[:space:]._*\-]?d{1,3}[[:space:]._*\-]?[e3]{1,3}[[:space:]._*\-]?r{1,3}[[:space:]._*\-]?c{1,3}[[:space:]._*\-]?h{1,3}[[:space:]._*\-]?[o0]{1,3}[[:space:]._*\-]?d{1,3}|[b8]{1,3}[[:space:]._*\-]?[e3]{1,3}[[:space:]._*\-]?h{1,3}[[:space:]._*\-]?[e3]{1,3}[[:space:]._*\-]?n{1,3}[[:space:]._*\-]?c{1,3}[[:space:]._*\-]?h{1,3}[[:space:]._*\-]?[o0]{1,3}[[:space:]._*\-]?d{1,3}|[b8]{1,3}[[:space:]._*\-]?u{1,3}[[:space:]._*\-]?l{1,3}[[:space:]._*\-]?l{1,3}[[:space:]._*\-]?[s$5]{1,3}[[:space:]._*\-]?h{1,3}[[:space:]._*\-]?[i!1]{1,3}[[:space:]._*\-]?[t7]{1,3}|[b8]{1,3}[[:space:]._*\-]?[i!1]{1,3}[[:space:]._*\-]?[t7]{1,3}[[:space:]._*\-]?c{1,3}[[:space:]._*\-]?h{1,3}[[:space:]._*\-]?[i!1]{1,3}[[:space:]._*\-]?n{1,3}[[:space:]._*\-]?[g69]{1,3}|[b8]{1,3}[[:space:]._*\-]?[a@4]{1,3}[[:space:]._*\-]?[s$5]{1,3}[[:space:]._*\-]?[t7]{1,3}[[:space:]._*\-]?[a@4]{1,3}[[:space:]._*\-]?r{1,3}[[:space:]._*\-]?d{1,3}[[:space:]._*\-]?[s$5]{1,3}|[a@4]{1,3}[[:space:]._*\-]?[s$5]{1,3}[[:space:]._*\-]?[s$5]{1,3}[[:space:]._*\-]?h{1,3}[[:space:]._*\-]?[o0]{1,3}[[:space:]._*\-]?l{1,3}[[:space:]._*\-]?[e3]{1,3}[[:space:]._*\-]?[s$5]{1,3}|[a@4]{1,3}[[:space:]._*\-]?r{1,3}[[:space:]._*\-]?[s$5]{1,3}[[:space:]._*\-]?[e3]{1,3}[[:space:]._*\-]?h{1,3}[[:space:]._*\-]?[o0]{1,3}[[:space:]._*\-]?l{1,3}[[:space:]._*\-]?[e3]{1,3}|d{1,3}[[:space:]._*\-]?[i!1]{1,3}[[:space:]._*\-]?c{1,3}[[:space:]._*\-]?k{1,3}[[:space:]._*\-]?h{1,3}[[:space:]._*\-]?[e3]{1,3}[[:space:]._*\-]?[a@4]{1,3}[[:space:]._*\-]?d{1,3}|r{1,3}[[:space:]._*\-]?[e3]{1,3}[[:space:]._*\-]?[t7]{1,3}[[:space:]._*\-]?[a@4]{1,3}[[:space:]._*\-]?r{1,3}[[:space:]._*\-]?d{1,3}[[:space:]._*\-]?[e3]{1,3}[[:space:]._*\-]?d{1,3}|[b8]{1,3}[[:space:]._*\-]?h{1,3}[[:space:]._*\-]?[e3]{1,3}[[:space:]._*\-]?n{1,3}[[:space:]._*\-]?c{1,3}[[:space:]._*\-]?h{1,3}[[:space:]._*\-]?[o0]{1,3}[[:space:]._*\-]?d{1,3}|[b8]{1,3}[[:space:]._*\-]?h{1,3}[[:space:]._*\-]?[o0]{1,3}[[:space:]._*\-]?[s$5]{1,3}[[:space:]._*\-]?d{1,3}[[:space:]._*\-]?[i!1]{1,3}[[:space:]._*\-]?k{1,3}[[:space:]._*\-]?[e3]{1,3}|भ{1,3}[[:space:]._*\-]?ो{1,3}[[:space:]._*\-]?स{1,3}[[:space:]._*\-]?ड{1,3}[[:space:]._*\-]?़{1,3}[[:space:]._*\-]?ी{1,3}[[:space:]._*\-]?क{1,3}[[:space:]._*\-]?े{1,3}|f{1,3}[[:space:]._*\-]?u{1,3}[[:space:]._*\-]?c{1,3}[[:space:]._*\-]?k{1,3}[[:space:]._*\-]?[e3]{1,3}[[:space:]._*\-]?r{1,3}[[:space:]._*\-]?[s$5]{1,3}|f{1,3}[[:space:]._*\-]?u{1,3}[[:space:]._*\-]?c{1,3}[[:space:]._*\-]?k{1,3}[[:space:]._*\-]?[i!1]{1,3}[[:space:]._*\-]?n{1,3}[[:space:]._*\-]?[g69]{1,3}|[b8]{1,3}[[:space:]._*\-]?[i!1]{1,3}[[:space:]._*\-]?[t7]{1,3}[[:space:]._*\-]?c{1,3}[[:space:]._*\-]?h{1,3}[[:space:]._*\-]?[e3]{1,3}[[:space:]._*\-]?[s$5]{1,3}|[b8]{1,3}[[:space:]._*\-]?[a@4]{1,3}[[:space:]._*\-]?[s$5]{1,3}[[:space:]._*\-]?[t7]{1,3}[[:space:]._*\-]?[a@4]{1,3}[[:space:]._*\-]?r{1,3}[[:space:]._*\-]?d{1,3}|[a@4]{1,3}[[:space:]._*\-]?[s$5]{1,3}[[:space:]._*\-]?[s$5]{1,3}[[:space:]._*\-]?h{1,3}[[:space:]._*\-]?[o0]{1,3}[[:space:]._*\-]?l{1,3}[[:space:]._*\-]?[e3]{1,3}|p{1,3}[[:space:]._*\-]?u{1,3}[[:space:]._*\-]?[s$5]{1,3}[[:space:]._*\-]?[s$5]{1,3}[[:space:]._*\-]?[i!1]{1,3}[[:space:]._*\-]?[e3]{1,3}[[:space:]._*\-]?[s$5]{1,3}|w{1,3}[[:space:]._*\-]?[a@4]{1,3}[[:space:]._*\-]?n{1,3}[[:space:]._*\-]?k{1,3}[[:space:]._*\-]?[e3]{1,3}[[:space:]._*\-]?r{1,3}[[:space:]._*\-]?[s$5]{1,3}|n{1,3}[[:space:]._*\-]?[i!1]{1,3}[[:space:]._*\-]?[g69]{1,3}[[:space:]._*\-]?[g69]{1,3}[[:space:]._*\-]?[e3]{1,3}[[:space:]._*\-]?r{1,3}[[:space:]._*\-]?[s$5]{1,3}|f{1,3}[[:space:]._*\-]?[a@4]{1,3}[[:space:]._*\-]?[g69]{1,3}[[:space:]._*\-]?[g69]{1,3}[[:space:]._*\-]?[o0]{1,3}[[:space:]._*\-]?[t7]{1,3}[[:space:]._*\-]?[s$5]{1,3}|r{1,3}[[:space:]._*\-]?[e3]{1,3}[[:space:]._*\-]?[t7]{1,3}[[:space:]._*\-]?[a@4]{1,3}[[:space:]._*\-]?r{1,3}[[:space:]._*\-]?d{1,3}[[:space:]._*\-]?[s$5]{1,3}|d{1,3}[[:space:]._*\-]?u{1,3}[[:space:]._*\-]?m{1,3}[[:space:]._*\-]?[b8]{1,3}[[:space:]._*\-]?[a@4]{1,3}[[:space:]._*\-]?[s$5]{1,3}[[:space:]._*\-]?[s$5]{1,3}|c{1,3}[[:space:]._*\-]?h{1,3}[[:space:]._*\-]?u{1,3}[[:space:]._*\-]?[t7]{1,3}[[:space:]._*\-]?[i!1]{1,3}[[:space:]._*\-]?y{1,3}[[:space:]._*\-]?[a@4]{1,3}|c{1,3}[[:space:]._*\-]?h{1,3}[[:space:]._*\-]?u{1,3}[[:space:]._*\-]?[t7]{1,3}[[:space:]._*\-]?[i!1]{1,3}[[:space:]._*\-]?y{1,3}[[:space:]._*\-]?[e3]{1,3}|म{1,3}[[:space:]._*\-]?ा{1,3}[[:space:]._*\-]?द{1,3}[[:space:]._*\-]?र{1,3}[[:space:]._*\-]?च{1,3}[[:space:]._*\-]?ो{1,3}[[:space:]._*\-]?द{1,3}|f{1,3}[[:space:]._*\-]?u{1,3}[[:space:]._*\-]?c{1,3}[[:space:]._*\-]?k{1,3}[[:space:]._*\-]?[e3]{1,3}[[:space:]._*\-]?d{1,3}|f{1,3}[[:space:]._*\-]?u{1,3}[[:space:]._*\-]?c{1,3}[[:space:]._*\-]?k{1,3}[[:space:]._*\-]?[e3]{1,3}[[:space:]._*\-]?r{1,3}|[s$5]{1,3}[[:space:]._*\-]?h{1,3}[[:space:]._*\-]?[i!1]{1,3}[[:space:]._*\-]?[t7]{1,3}[[:space:]._*\-]?[t7]{1,3}[[:space:]._*\-]?y{1,3}|w{1,3}[[:space:]._*\-]?[a@4]{1,3}[[:space:]._*\-]?n{1,3}[[:space:]._*\-]?k{1,3}[[:space:]._*\-]?[e3]{1,3}[[:space:]._*\-]?r{1,3}|w{1,3}[[:space:]._*\-]?h{1,3}[[:space:]._*\-]?[o0]{1,3}[[:space:]._*\-]?r{1,3}[[:space:]._*\-]?[e3]{1,3}[[:space:]._*\-]?[s$5]{1,3}|n{1,3}[[:space:]._*\-]?[i!1]{1,3}[[:space:]._*\-]?[g69]{1,3}[[:space:]._*\-]?[g69]{1,3}[[:space:]._*\-]?[e3]{1,3}[[:space:]._*\-]?r{1,3}|n{1,3}[[:space:]._*\-]?[i!1]{1,3}[[:space:]._*\-]?[g69]{1,3}[[:space:]._*\-]?[g69]{1,3}[[:space:]._*\-]?[a@4]{1,3}[[:space:]._*\-]?[s$5]{1,3}|f{1,3}[[:space:]._*\-]?[a@4]{1,3}[[:space:]._*\-]?[g69]{1,3}[[:space:]._*\-]?[g69]{1,3}[[:space:]._*\-]?[o0]{1,3}[[:space:]._*\-]?[t7]{1,3}|r{1,3}[[:space:]._*\-]?[e3]{1,3}[[:space:]._*\-]?[t7]{1,3}[[:space:]._*\-]?[a@4]{1,3}[[:space:]._*\-]?r{1,3}[[:space:]._*\-]?d{1,3}|[i!1]{1,3}[[:space:]._*\-]?d{1,3}[[:space:]._*\-]?[i!1]{1,3}[[:space:]._*\-]?[o0]{1,3}[[:space:]._*\-]?[t7]{1,3}[[:space:]._*\-]?[s$5]{1,3}|m{1,3}[[:space:]._*\-]?[o0]{1,3}[[:space:]._*\-]?r{1,3}[[:space:]._*\-]?[o0]{1,3}[[:space:]._*\-]?n{1,3}[[:space:]._*\-]?[s$5]{1,3}|h{1,3}[[:space:]._*\-]?[a@4]{1,3}[[:space:]._*\-]?r{1,3}[[:space:]._*\-]?[a@4]{1,3}[[:space:]._*\-]?m{1,3}[[:space:]._*\-]?[i!1]{1,3}|च{1,3}[[:space:]._*\-]?ू{1,3}[[:space:]._*\-]?त{1,3}[[:space:]._*\-]?ि{1,3}[[:space:]._*\-]?य{1,3}[[:space:]._*\-]?ा{1,3}|च{1,3}[[:space:]._*\-]?ू{1,3}[[:space:]._*\-]?त{1,3}[[:space:]._*\-]?ि{1,3}[[:space:]._*\-]?य{1,3}[[:space:]._*\-]?े{1,3}|ब{1,3}[[:space:]._*\-]?ह{1,3}[[:space:]._*\-]?न{1,3}[[:space:]._*\-]?च{1,3}[[:space:]._*\-]?ो{1,3}[[:space:]._*\-]?द{1,3}|f{1,3}[[:space:]._*\-]?u{1,3}[[:space:]._*\-]?c{1,3}[[:space:]._*\-]?k{1,3}[[:space:]._*\-]?[s$5]{1,3}|[s$5]{1,3}[[:space:]._*\-]?h{1,3}[[:space:]._*\-]?[i!1]{1,3}[[:space:]._*\-]?[t7]{1,3}[[:space:]._*\-]?[s$5]{1,3}|[b8]{1,3}[[:space:]._*\-]?[i!1]{1,3}[[:space:]._*\-]?[t7]{1,3}[[:space:]._*\-]?c{1,3}[[:space:]._*\-]?h{1,3}|c{1,3}[[:space:]._*\-]?u{1,3}[[:space:]._*\-]?n{1,3}[[:space:]._*\-]?[t7]{1,3}[[:space:]._*\-]?[s$5]{1,3}|d{1,3}[[:space:]._*\-]?[i!1]{1,3}[[:space:]._*\-]?c{1,3}[[:space:]._*\-]?k{1,3}[[:space:]._*\-]?[s$5]{1,3}|c{1,3}[[:space:]._*\-]?[o0]{1,3}[[:space:]._*\-]?c{1,3}[[:space:]._*\-]?k{1,3}[[:space:]._*\-]?[s$5]{1,3}|p{1,3}[[:space:]._*\-]?u{1,3}[[:space:]._*\-]?[s$5]{1,3}[[:space:]._*\-]?[s$5]{1,3}[[:space:]._*\-]?y{1,3}|[s$5]{1,3}[[:space:]._*\-]?l{1,3}[[:space:]._*\-]?u{1,3}[[:space:]._*\-]?[t7]{1,3}[[:space:]._*\-]?[s$5]{1,3}|w{1,3}[[:space:]._*\-]?h{1,3}[[:space:]._*\-]?[o0]{1,3}[[:space:]._*\-]?r{1,3}[[:space:]._*\-]?[e3]{1,3}|n{1,3}[[:space:]._*\-]?[i!1]{1,3}[[:space:]._*\-]?[g69]{1,3}[[:space:]._*\-]?[g69]{1,3}[[:space:]._*\-]?[a@4]{1,3}|[i!1]{1,3}[[:space:]._*\-]?d{1,3}[[:space:]._*\-]?[i!1]{1,3}[[:space:]._*\-]?[o0]{1,3}[[:space:]._*\-]?[t7]{1,3}|m{1,3}[[:space:]._*\-]?[o0]{1,3}[[:space:]._*\-]?r{1,3}[[:space:]._*\-]?[o0]{1,3}[[:space:]._*\-]?n{1,3}|[g69]{1,3}[[:space:]._*\-]?[a@4]{1,3}[[:space:]._*\-]?[a@4]{1,3}[[:space:]._*\-]?n{1,3}[[:space:]._*\-]?d{1,3}|[g69]{1,3}[[:space:]._*\-]?[a@4]{1,3}[[:space:]._*\-]?n{1,3}[[:space:]._*\-]?d{1,3}[[:space:]._*\-]?u{1,3}|r{1,3}[[:space:]._*\-]?[a@4]{1,3}[[:space:]._*\-]?n{1,3}[[:space:]._*\-]?d{1,3}[[:space:]._*\-]?[i!1]{1,3}|ग{1,3}[[:space:]._*\-]?ा{1,3}[[:space:]._*\-]?ं{1,3}[[:space:]._*\-]?ड{1,3}[[:space:]._*\-]?ू{1,3}|ह{1,3}[[:space:]._*\-]?र{1,3}[[:space:]._*\-]?ा{1,3}[[:space:]._*\-]?म{1,3}[[:space:]._*\-]?ी{1,3}|f{1,3}[[:space:]._*\-]?u{1,3}[[:space:]._*\-]?c{1,3}[[:space:]._*\-]?k{1,3}|[s$5]{1,3}[[:space:]._*\-]?h{1,3}[[:space:]._*\-]?[i!1]{1,3}[[:space:]._*\-]?[t7]{1,3}|c{1,3}[[:space:]._*\-]?u{1,3}[[:space:]._*\-]?n{1,3}[[:space:]._*\-]?[t7]{1,3}|d{1,3}[[:space:]._*\-]?[i!1]{1,3}[[:space:]._*\-]?c{1,3}[[:space:]._*\-]?k{1,3}|c{1,3}[[:space:]._*\-]?[o0]{1,3}[[:space:]._*\-]?c{1,3}[[:space:]._*\-]?k{1,3}|[s$5]{1,3}[[:space:]._*\-]?l{1,3}[[:space:]._*\-]?u{1,3}[[:space:]._*\-]?[t7]{1,3})(?![[:alnum:]ऀ-ॿ])$pattern$,'i');
  exit when token is null;
  position:=strpos(remaining,token[1]);
  output:=output || substr(remaining,1,position-1) || repeat('*',char_length(token[1]));
  remaining:=substr(remaining,position+char_length(token[1]));
 end loop;
 return output || remaining;
end $fn$;
create or replace function public.mask_content_jsonb(value jsonb, field text default '') returns jsonb
language plpgsql immutable set search_path=public as $fn$
declare output jsonb; item record;
begin
 if jsonb_typeof(value)='string' and field=any(array['name','p_name','body','p_body','bio','p_bio','title','p_title','description','p_description','message','p_message','subject','p_subject','alias','p_alias','reason','p_reason','interests','p_interests','availability','p_availability','goal','p_goal','space_name','p_space_name','spaceName','p_spaceName','location','p_location']) then
  return to_jsonb(public.mask_offensive_text(value #>> '{}'));
 elsif jsonb_typeof(value)='object' then
  output:='{}'::jsonb;
  for item in select key,val from jsonb_each(value) as entries(key,val) loop
   output:=output || jsonb_build_object(item.key,public.mask_content_jsonb(item.val,item.key));
  end loop;
  return output;
 elsif jsonb_typeof(value)='array' then
  select coalesce(jsonb_agg(public.mask_content_jsonb(element,field) order by ord),'[]'::jsonb) into output from jsonb_array_elements(value) with ordinality as elements(element,ord);
  return output;
 end if;
 return value;
end $fn$;
create or replace function public.mask_member_content() returns trigger
language plpgsql set search_path=public as $fn$
begin
 new:=jsonb_populate_record(new,public.mask_content_jsonb(to_jsonb(new)));
 return new;
end $fn$;
do $fn$
declare target text;
begin
 foreach target in array array['profiles','groups','posts','sessions','tasks','providers','direct_messages','notifications','contact_requests','reports','verification_requests'] loop
  execute format('drop trigger if exists mask_member_content on public.%I',target);
  execute format('create trigger mask_member_content before insert or update on public.%I for each row execute function public.mask_member_content()',target);
 end loop;
end $fn$;
commit;
-- END GENERATED CONTENT MASKING

-- Member access, provider notifications and guest appointment gateway
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

-- Public group catalogue without private membership or conversation access
begin;
-- Only group descriptions and aggregate counts are public. Member IDs, posts,
-- profiles and all join/write operations retain their existing access rules.
create function public.list_public_groups() returns jsonb
language sql stable security definer set search_path=public as $$
 select coalesce(jsonb_agg(g order by name),'[]'::jsonb) from (
  select id,slug,name,description,category,
    (select count(*) from group_members m where m.group_id=groups.id) as member_count
  from groups
 ) g;
$$;
revoke all on function public.list_public_groups() from public;
grant execute on function public.list_public_groups() to anon,authenticated;
commit;
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
