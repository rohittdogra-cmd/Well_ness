-- Generated fresh-install bundle. Run only in a dedicated project without these tables.
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

-- Scalability pass: index the real query shapes, move filtering/aggregation into
-- Postgres, and stop shipping whole tables to the browser.
begin;

-- ── Indexes matching the actual access patterns ────────────────────────────
-- Feed: keyset pagination orders top-level posts by id inside one group.
create index if not exists posts_feed_keyset on public.posts(group_id,parent_id,id desc);
-- Reply aggregates per post.
create index if not exists posts_replies on public.posts(parent_id,id);
-- Group directory: category browse + alphabetical ordering.
create index if not exists groups_category_name on public.groups(category,name);
create index if not exists groups_created on public.groups(created_at desc);
-- Activity listing: type browse, chronological order, upcoming filter.
create index if not exists sessions_type_date on public.sessions(program_type,date_time);
create index if not exists sessions_date_desc on public.sessions(date_time desc);
create index if not exists sessions_creator on public.sessions(creator,date_time desc);
create index if not exists session_members_member on public.session_members(user_id,session_id);
-- Task boards.
create index if not exists tasks_session_id on public.tasks(session_id,id);
create index if not exists tasks_assigned on public.tasks(assigned_to) where assigned_to is not null;
-- Provider directory and the admin review queue.
create index if not exists providers_status_type on public.providers(status,provider_type,name);
create index if not exists providers_applicant on public.providers(applicant,created_at desc);
-- Appointments: per-user history, per-provider calendar, overlap detection.
create index if not exists bookings_provider_time on public.provider_bookings(provider_id,booking_time);
create index if not exists bookings_user_time on public.provider_bookings(user_id,booking_time desc);
create index if not exists bookings_unconfirmed on public.provider_bookings(booking_time) where confirmed=false;
-- Member directory ordering (find_members pages by name then id).
create index if not exists profiles_name on public.profiles(name,id);
-- Moderation queue and the administrator activity feed.
create index if not exists reports_open on public.reports(resolved,created_at);
create index if not exists activity_logs_created on public.activity_logs(created_at desc);
-- Connections inbox.
create index if not exists connections_recipient_status on public.connections(recipient,status,created_at desc);
-- Contact inbox.
create index if not exists contact_requests_created on public.contact_requests(created_at desc);
create index if not exists contact_requests_user on public.contact_requests(user_id,created_at desc);

-- ── Summary views: counts computed in Postgres, not in the browser ────────
-- These replace "select every row plus every member uuid, then count in JS".
-- security_invoker keeps the caller's row-level security in force, so the
-- views stay exactly as protected as the tables underneath them.
create view public.group_summaries with (security_invoker = on) as
select g.id, g.slug, g.name, g.description, g.category, g.created_at,
 (select count(*) from public.group_members m where m.group_id=g.id)::int as member_count,
 exists(select 1 from public.group_members m where m.group_id=g.id and m.user_id=auth.uid()) as joined
from public.groups g;

create view public.session_summaries with (security_invoker = on) as
select s.id, s.creator, s.title, s.description, s.program_type, s.date_time, s.max_participants,
 s.space_name, s.location, s.created_at,
 (select count(*) from public.session_members m where m.session_id=s.id)::int as participant_count,
 exists(select 1 from public.session_members m where m.session_id=s.id and m.user_id=auth.uid()) as joined
from public.sessions s;

revoke all on public.group_summaries, public.session_summaries from anon;
grant select on public.group_summaries, public.session_summaries to authenticated;

-- ── Bounded reply fan-out in the feed ─────────────────────────────────────
-- get_feed embedded every reply of every post with no limit, so one popular
-- thread could grow the response payload without bound. Cap the replies that
-- ship alongside each post; the rest remain stored and countable.
create or replace function public.get_feed(p_group bigint default null,p_before bigint default null,p_limit integer default 20)
returns jsonb language plpgsql stable security definer set search_path=public as $$
declare u uuid:=require_user(); begin
  return coalesce((select jsonb_agg(row_data order by id desc) from (
  select p.id,jsonb_build_object('id',p.id,'body',p.body,'created_at',p.created_at,'anonymous',p.anonymous,'mine',p.author_id=u,
  'alias',case when p.anonymous then 'Quiet '||substr(md5(pr.alias_seed::text||coalesce(p.group_id::text,'lounge')),1,6) else coalesce(nullif(pr.name,''),'Community member') end,
  'likes',(select count(*) from post_likes where post_id=p.id),'liked',exists(select 1 from post_likes where post_id=p.id and user_id=u),
  'replies',coalesce((select jsonb_agg(jsonb_build_object('id',r.id,'body',r.body,'created_at',r.created_at,'mine',r.author_id=u,'alias',case when r.anonymous then 'Quiet '||substr(md5(rp.alias_seed::text||coalesce(r.group_id::text,'lounge')),1,6) else coalesce(nullif(rp.name,''),'Community member') end) order by r.id)
    from (select id,body,created_at,author_id,anonymous,group_id from posts where parent_id=p.id and not hidden order by id desc limit 50) r
    left join profiles rp on rp.id=r.author_id),'[]'::jsonb)) row_data
  from posts p left join profiles pr on pr.id=p.author_id where p.group_id is not distinct from p_group and p.parent_id is null and not p.hidden and (p_before is null or p.id<p_before) order by p.id desc limit least(greatest(p_limit,1),50)
  ) q),'[]'::jsonb);
end $$;

-- ── Administrator aggregates: one round trip, counted in the database ─────
create or replace function public.admin_stats() returns jsonb language plpgsql stable security definer set search_path=public as $$
begin
 if not is_admin() then raise exception 'Admin access required'; end if;
 return jsonb_build_object(
  'total_users',(select count(*) from profiles),
  'total_sessions',(select count(*) from sessions),
  'total_tasks',(select count(*) from tasks),
  'completed_tasks',(select count(*) from tasks where completed),
  'total_providers',(select count(*) from providers),
  'approved_providers',(select count(*) from providers where status='approved'),
  'rejected_providers',(select count(*) from providers where status='rejected'),
  'pending_providers',(select count(*) from providers where status='pending'),
  'total_bookings',(select count(*) from provider_bookings),
  'confirmed_bookings',(select count(*) from provider_bookings where confirmed),
  'total_groups',(select count(*) from groups),
  'total_posts',(select count(*) from posts),
  'sessions_by_type',coalesce((select jsonb_object_agg(t.program_type,t.c) from (select program_type,count(*)::bigint c from sessions group by 1) t),'{}'::jsonb),
  'bookings_by_provider',coalesce((select jsonb_object_agg(b.provider_id::text,b.c) from (select provider_id,count(*)::bigint c from provider_bookings group by 1) b),'{}'::jsonb)
 );
end $$;

-- Per-member activity counts, aggregated in SQL instead of scanning every
-- session for every profile in the browser.
create or replace function public.admin_user_profiles() returns jsonb language plpgsql stable security definer set search_path=public as $$
begin
 if not is_admin() then raise exception 'Admin access required'; end if;
 return coalesce((
  select jsonb_agg(jsonb_build_object('id',p.id,'name',p.name,
    'sessions_created',(select count(*) from sessions s where s.creator=p.id),
    'sessions_joined',(select count(*) from sessions s join session_members m on m.session_id=s.id where m.user_id=p.id))
   order by lower(p.name))
  from profiles p where char_length(trim(p.name))>0),'[]'::jsonb);
end $$;

-- Category tile counters for the group directory.
create or replace function public.group_category_counts() returns jsonb language sql stable security definer set search_path=public as $$
 select coalesce(jsonb_object_agg(t.category,t.c),'{}'::jsonb) from (select category,count(*)::int c from groups group by 1) t $$;

-- ── Hardened group creation ───────────────────────────────────────────────
-- Same signature as 202610010001 so existing clients keep working, but inputs
-- are normalised and an invalid category returns a readable message.
create or replace function public.create_group(p_name text,p_description text,p_category text default 'social')
returns bigint language plpgsql security definer set search_path=public as $$
declare u uuid:=require_user(); gid bigint; slug text; cat text:=coalesce(nullif(trim(p_category),''),'social');
begin
 perform pg_advisory_xact_lock(hashtextextended(u::text,1));
 if char_length(trim(coalesce(p_name,''))) not between 2 and 60 then raise exception 'Give your subgroup a name between 2 and 60 characters'; end if;
 if char_length(coalesce(p_description,''))>500 then raise exception 'Keep the description under 500 characters'; end if;
 if cat not in ('sports','wellbeing','arts','learning','social','outdoors') then raise exception 'Choose one of the available categories'; end if;
 if (select count(*) from groups where creator=u and created_at>now()-interval '1 day')>=5 then raise exception 'You can create up to 5 groups per day'; end if;
 slug:=trim(both '-' from regexp_replace(lower(p_name),'[^a-z0-9]+','-','g'))||'-'||substr(gen_random_uuid()::text,1,8);
 insert into groups(slug,name,description,creator,category) values(slug,trim(p_name),trim(p_description),u,cat) returning id into gid;
 insert into group_members values(gid,u,now()); return gid;
end $$;

-- ── Bounded connection list ───────────────────────────────────────────────
-- list_connections had no limit and was polled every ten seconds.
create or replace function public.list_connections() returns table(id bigint,requester uuid,recipient uuid,status text,member_id uuid,name text,avatar integer)
language sql stable security definer set search_path=public as $$
 select c.id,c.requester,c.recipient,c.status,p.id,p.name,p.avatar from connections c
 join profiles p on p.id=case when c.requester=auth.uid() then c.recipient else c.requester end
 where require_user() is not null and auth.uid() in(c.requester,c.recipient) and c.status<>'declined'
 order by c.created_at desc limit 200 $$;

-- ── Rate-limited contact submissions ──────────────────────────────────────
-- The contact inbox accepted an insert per request with no ceiling. Route it
-- through a function so the limit is enforced in the database.
revoke insert on public.contact_requests from authenticated;
drop policy if exists contact_insert on public.contact_requests;
create or replace function public.submit_contact_request(p_subject text,p_message text) returns bigint
language plpgsql security definer set search_path=public as $$
declare u uuid:=require_user(); rid bigint;
begin
 if char_length(trim(coalesce(p_subject,''))) not between 2 and 150 then raise exception 'Add a subject between 2 and 150 characters'; end if;
 if char_length(trim(coalesce(p_message,''))) not between 10 and 3000 then raise exception 'Add a message between 10 and 3000 characters'; end if;
 if (select count(*) from contact_requests where user_id=u and created_at>now()-interval '1 day')>=5 then raise exception 'You have sent 5 messages today. Please try again tomorrow.'; end if;
 insert into contact_requests(user_id,subject,message) values(u,trim(p_subject),trim(p_message)) returning id into rid;
 return rid;
end $$;

-- ── Grants ────────────────────────────────────────────────────────────────
revoke execute on function public.admin_stats(),public.admin_user_profiles(),public.group_category_counts(),public.submit_contact_request(text,text) from public,anon;
grant execute on function public.get_feed(bigint,bigint,integer) to authenticated;
grant execute on function public.admin_stats(),public.admin_user_profiles(),public.group_category_counts(),public.submit_contact_request(text,text) to authenticated;
commit;
