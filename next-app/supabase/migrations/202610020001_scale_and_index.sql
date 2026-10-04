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