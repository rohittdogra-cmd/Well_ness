import { PGlite } from "@electric-sql/pglite";
import { readFile, readdir } from "node:fs/promises";
import assert from "node:assert/strict";
const db = new PGlite();
const alice = "11111111-1111-4111-8111-111111111111",
  bob = "22222222-2222-4222-8222-222222222222",
  admin = "33333333-3333-4333-8333-333333333333";
await db.exec(
  `create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;grant usage on schema public,auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;`,
);
for (const file of (
  await readdir(new URL("../supabase/migrations/", import.meta.url))
).sort())
  await db.exec(
    await readFile(
      new URL("../supabase/migrations/" + file, import.meta.url),
      "utf8",
    ),
  );
await db.query("insert into auth.users values ($1),($2),($3)", [
  alice,
  bob,
  admin,
]);
await db.query("insert into public.admins values ($1)", [admin]);
async function as(id) {
  await db.exec("reset role");
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", [
    id ?? "",
  ]);
  await db.exec(`set role ${id ? "authenticated" : "anon"}`);
}
async function scalar(sql, args = []) {
  return (await db.query(sql, args)).rows[0]?.value;
}
let checks = 0;
async function denied(sql, args = []) {
  await assert.rejects(db.query(sql, args));
  checks++;
}
await as(alice);
await db.query("update profiles set name='Alice' where id=$1", [alice]);
assert.equal((await db.query("select * from profiles")).rows.length, 1);
checks++;
await db.query("update profiles set name='Hacked' where id=$1", [bob]);
await denied("insert into admins values ($1)", [alice]);
await denied("select public.review_provider(1,true)");
await denied("select * from posts");
await denied("select public.get_reports()");
const gid = await scalar(
  "select create_group('Walking club','Lunch break walks') as value",
);
assert.equal(
  (await db.query("select * from group_members where group_id=$1", [gid])).rows
    .length,
  1,
);
checks++;
const post = await scalar(
  "select publish_post('A small win today',$1,null,true) as value",
  [gid],
);
await as(bob);
assert.equal(
  await scalar("select name as value from profiles where id=$1", [bob]),
  "",
);
checks++;
await denied("select publish_post('Not a member',$1,null,false)", [gid]);
await db.query("select toggle_group($1,true)", [gid]);
await db.query("select toggle_group($1,true)", [gid]);
assert.equal(
  (await db.query("select * from group_members where group_id=$1", [gid])).rows
    .length,
  2,
);
checks++;
const feed = await scalar("select get_feed($1) as value", [gid]);
assert.equal(feed[0].mine, false);
assert.ok(feed[0].alias.startsWith("Quiet "));
assert.ok(!JSON.stringify(feed).includes(alice));
checks++;
await denied("select delete_post($1)", [post]);
await db.query("select publish_post('Good for you!',$1,$2,true)", [gid, post]);
await db.query("select react_post($1,true)", [post]);
await db.query("select react_post($1,true)", [post]);
assert.equal((await scalar("select get_feed($1) as value", [gid]))[0].likes, 1);
checks++;
await db.query("select report_post($1,'Needs moderator review')", [post]);
await as(alice);
assert.equal((await db.query("select * from notifications")).rows.length, 1);
checks++;
await db.query("insert into check_ins values ($1,current_date,'Good')", [
  alice,
]);
await as(bob);
assert.equal((await db.query("select * from check_ins")).rows.length, 0);
checks++;
await denied("insert into check_ins values ($1,current_date,'Low')", [alice]);
await as(alice);
const sid = await scalar(
  "select create_session('Lunch walk','Walk together','meetup',now()+interval '1 day',1,null,'Garden') as value",
);
await db.query("select join_session($1,true)", [sid]);
assert.equal(
  (await db.query("select * from session_members where session_id=$1", [sid]))
    .rows.length,
  1,
);
checks++;
await as(bob);
await denied("select update_session($1,$2)", [sid, "Not mine"]);
await denied("select join_session($1,true)", [sid]);
await denied("select delete_session($1)", [sid]);
await denied("select create_task($1,'Bring water','',null)", [sid]);
await as(alice);
await db.query("select update_session($1,$2)", [sid, "Updated walk"]);
assert.equal(
  await scalar("select title as value from sessions where id=$1", [sid]),
  "Updated walk",
);
checks++;
await db.query("select join_session($1,false)", [sid]);
await as(bob);
await db.query("select join_session($1,true)", [sid]);
const tid = await scalar(
  "select create_task($1,'Bring water','',null) as value",
  [sid],
);
await as(alice);
await denied("select complete_task($1)", [tid]);
await as(bob);
await db.query("select complete_task($1)", [tid]);
assert.equal(
  await scalar("select completed as value from tasks where id=$1", [tid]),
  true,
);
checks++;
const pid = await scalar(
  "select apply_provider('psychologist','Provider example','Application description for verification') as value",
);
await denied("select review_provider($1,true)", [pid]);
await as(admin);
await db.query("select review_provider($1,true)", [pid]);
const reports = await scalar("select get_reports() as value");
assert.equal(reports[0].author_id, alice);
checks++;
await db.query("select moderate_post($1,true)", [reports[0].id]);
await as(alice);
assert.equal((await scalar("select get_feed($1) as value", [gid])).length, 0);
checks++;
const bid = await scalar(
  "select book_provider($1,now()+interval '2 days') as value",
  [pid],
);
await as(bob);
await denied("select book_provider($1,now()+interval '2 days 30 minutes')", [
  pid,
]);
await denied("select cancel_booking($1)", [bid]);
await db.query("select confirm_booking($1)", [bid]);
await as(alice);
assert.equal(
  await scalar("select confirmed as value from provider_bookings where id=$1", [
    bid,
  ]),
  true,
);
checks++;
await db.query("select cancel_booking($1)", [bid]);
await denied(
  "select create_session('Past event','','meetup',now()-interval '1 day',4,null,null)",
);
await as(null);
await denied("select get_feed()");
await denied("select * from profiles");
await denied("select create_group($1,$2)", ["Bad", "Anonymous"]);
await as(alice);
assert.ok((await db.query("select * from activity_logs")).rows.length > 0);
checks++;
await denied(
  "insert into activity_logs(user_id,activity_type,related_id) values($1,'fake',1)",
  [alice],
);
// Connection consent, privacy, and two-account message persistence.
await as(bob);
await db.query("update profiles set name='Bob' where id=$1", [bob]);
await as(alice);
const directory = (await db.query("select * from find_members('Bob')")).rows;
assert.equal(directory[0].name, "Bob");
assert.equal(directory[0].alias_seed, undefined);
assert.equal(directory[0].email, undefined);
checks++;
await denied("select request_connection($1)", [alice]);
const cid = await scalar("select request_connection($1) as value", [bob]);
assert.equal(
  await scalar("select request_connection($1) as value", [bob]),
  cid,
);
checks++;
await denied("select send_direct_message($1,'Before consent')", [cid]);
await denied("select respond_connection($1,true)", [cid]);
await denied(
  "insert into direct_messages(connection_id,sender,body) values($1,$2,'Bypass')",
  [cid, alice],
);
await as(admin);
assert.equal((await db.query("select * from connections")).rows.length, 0);
await denied("select respond_connection($1,true)", [cid]);
await denied("select send_direct_message($1,'Intrusion')", [cid]);
checks++;
await as(bob);
assert.equal(
  await scalar("select request_connection($1) as value", [alice]),
  cid,
);
await db.query("select respond_connection($1,true)", [cid]);
await denied("select respond_connection($1,false)", [cid]);
await db.query("select send_direct_message($1,'Hello Alice')", [cid]);
await as(alice);
assert.equal(
  (
    await db.query("select body from direct_messages where connection_id=$1", [
      cid,
    ])
  ).rows[0].body,
  "Hello Alice",
);
await db.query("select send_direct_message($1,'Hello Bob')", [cid]);
await denied("select send_direct_message($1,'   ')", [cid]);
await as(bob);
assert.equal(
  (
    await db.query("select * from direct_messages where connection_id=$1", [
      cid,
    ])
  ).rows.length,
  2,
);
checks++;
await as(admin);
assert.equal((await db.query("select * from direct_messages")).rows.length, 0);
checks++;
await db.query("update profiles set name='Admin' where id=$1", [admin]);
const declined = await scalar("select request_connection($1) as value", [
  alice,
]);
await as(alice);
await db.query("select respond_connection($1,false)", [declined]);
await denied("select send_direct_message($1,'After decline')", [declined]);
await as(null);
await denied("select * from find_members()");
await denied("select * from list_connections()");
await denied("select * from direct_messages");
await denied("select create_group('No access','Unauthorized','sports')");
await as(alice);
assert.equal(
  await scalar(
    "select count(*)::int as value from groups where category='sports' and slug in ('football','cricket','basketball','badminton','volleyball','pickleball')",
  ),
  6,
);
checks++;
const subgroup = await scalar(
  "select create_group('Weekend crew','A friendly team','sports') as value",
);
assert.equal(
  await scalar("select category as value from groups where id=$1", [subgroup]),
  "sports",
);
checks++;
assert.equal(
  await scalar(
    "select count(*)::int as value from group_members where group_id=$1 and user_id=$2",
    [subgroup, alice],
  ),
  1,
);
checks++;
await denied(
  "select create_group('Bad category','Invalid category','invalid')",
);
await denied("update groups set category='arts' where id=$1", [subgroup]);

// ── Summary views: counts and membership resolved by the database ──────────
await as(alice);
// alice created `subgroup`, so she is its only member so far
const summary = (
  await db.query("select * from group_summaries where id=$1", [subgroup])
).rows[0];
assert.equal(summary.member_count, 1);
assert.equal(summary.joined, true);
checks++;
// The view must not expose the full member list any more.
assert.equal(summary.group_members, undefined);
checks++;
await as(bob);
const otherView = (
  await db.query("select * from group_summaries where id=$1", [subgroup])
).rows[0];
assert.equal(otherView.joined, false);
assert.equal(otherView.member_count, 1);
checks++;
await db.query("select toggle_group($1,true)", [subgroup]);
assert.equal(
  (
    await db.query("select member_count from group_summaries where id=$1", [
      subgroup,
    ])
  ).rows[0].member_count,
  2,
);
checks++;
const sessionRow = (
  await db.query("select * from session_summaries where id=$1", [sid])
).rows[0];
assert.ok(sessionRow.participant_count >= 1);
checks++;
await as(null);
await denied("select * from group_summaries");
await denied("select * from session_summaries");

// ── Administrator aggregates are counted in SQL, and stay admin-only ──────
await as(alice);
await denied("select admin_stats()");
await denied("select admin_user_profiles()");
await as(admin);
const stats = await scalar("select admin_stats() as value");
assert.equal(stats.total_users, 3);
assert.ok(Number(stats.total_sessions) >= 1);
assert.ok(Number(stats.total_groups) >= 1);
assert.equal(typeof stats.sessions_by_type, "object");
assert.ok(Number(stats.total_providers) >= 1);
checks += 4;
const adminProfiles = await scalar("select admin_user_profiles() as value");
const aliceEntry = adminProfiles.find((p) => p.id === alice);
const bobEntry = adminProfiles.find((p) => p.id === bob);
assert.ok(aliceEntry && bobEntry);
assert.equal(aliceEntry.name, "Alice");
assert.equal(bobEntry.name, "Bob");
assert.ok(aliceEntry.sessions_created >= 1);
checks += 3;
const categoryCounts = await scalar("select group_category_counts() as value");
assert.ok(Number(categoryCounts.sports) >= 1);
assert.ok(Number(categoryCounts.social) >= 1);
checks += 2;

// ── Contact submissions are rate limited in the database ──────────────────
await as(alice);
await denied("insert into contact_requests(user_id,subject,message) values($1,'Direct','Bypassing the function')", [
  alice,
]);
const requestId = await scalar(
  "select submit_contact_request('  Hello there  ','A message that is long enough.') as value",
);
assert.ok(Number(requestId) > 0);
assert.equal(
  await scalar("select subject as value from contact_requests where id=$1", [
    requestId,
  ]),
  "Hello there",
);
checks += 3;
await denied("select submit_contact_request('x','too short')");
for (let i = 0; i < 4; i++)
  await db.query("select submit_contact_request($1,$2)", [
    `Repeat ${i}`,
    "Another long enough message body.",
  ]);
await denied(
  "select submit_contact_request('Sixth','Another long enough message body.')",
);
await as(null);
await denied("select submit_contact_request('Anon','A message that is long enough.')");

// ── Group creation validation returns readable messages ───────────────────
// search_groups takes the term as a bound parameter, so filter metacharacters
// in it are matched as text instead of being parsed as PostgREST filter syntax.
await as(alice);
assert.equal(
  (await db.query("select * from search_groups('Cricket')")).rows.length,
  1,
);
checks++;
assert.equal((await db.query("select * from search_groups('zzz')")).rows.length, 0);
checks++;
// The exact input that used to break the hand-built `or=(...)` filter.
for (const hostile of ["a,b", "a)%20or%20(1.eq.1", "%", "_", "',(select+1)"]) {
  assert.equal(
    (await db.query("select * from search_groups($1)", [hostile])).rows.length,
    0,
  );
  checks++;
}
// Joined-only filters on the caller's own membership, resolved by the view.
const joined = (
  await db.query("select slug from search_groups(null,null,true) order by slug")
).rows.map((r) => r.slug);
const aliceGroup = (
  await db.query("select slug from groups where id=$1", [gid])
).rows[0].slug;
assert.ok(joined.includes(aliceGroup), "alice created a group");
checks++;
assert.ok(!joined.includes("cricket"), "alice never joined cricket");
checks++;

// Paging is a real cursor, not a fixed ceiling.
await as(alice);
const page = (await db.query("select * from session_summaries_page(null,true)")).rows;
assert.ok(page.length >= 1);
checks++;
const cursor = page[page.length - 1];
const nextPage = (
  await db.query("select * from session_summaries_page(null,true,$1,$2,10)", [
    cursor.date_time,
    cursor.id,
  ])
).rows;
assert.equal(nextPage.length, 0);
checks++;
// my_sessions is one call now, not a members read plus a giant `in.(...)`.
assert.ok((await db.query("select * from my_sessions()")).rows.length >= 1);
checks++;
assert.equal((await db.query("select * from session_roster($1,10)", [sid])).rows.length >= 1, true);
checks++;

// ── Moderation is reversible ──────────────────────────────────────────────
// `moderate_post` hid the post above, which also resolved its report and so
// removed it from `get_reports`. It used to have no way back at all.
await as(bob);
await denied("select restore_post($1)", [post]);
await denied("select get_hidden_posts()");
await as(admin);
const hidden = await scalar("select get_hidden_posts() as value");
assert.equal(hidden.length, 1);
assert.equal(hidden[0].id, post);
checks += 2;
await db.query("select restore_post($1)", [post]);
// `posts` has no direct grant to authenticated, so visibility is read back the
// same way a member would see it: through the feed.
assert.equal((await scalar("select get_hidden_posts() as value")).length, 0);
checks++;
const restored = await scalar("select get_feed($1) as value", [gid]);
assert.equal(restored.length, 1);
assert.equal(restored[0].id, post);
checks += 2;

// ── Write paths without a ceiling now have one ─────────────────────────────
await as(admin);
for (let i = 0; i < 20; i++)
  await db.query(
    "select create_session($1,$2,'meetup',now()+interval '3 days',4,null,null)",
    [`Spam session ${i}`, "Rate limit probe"],
  );
await denied(
  "select create_session('Another','Over the daily ceiling','meetup',now()+interval '4 days',4,null,null)",
);
checks += 2;
await as(bob);
// Direct messages are the one unbounded write that had no ceiling at all:
// unlimited rows per accepted connection, and no notification, so harassment
// was silent. Sends until the database refuses rather than hard-coding a count.
let sent = 0;
for (; sent < 200; sent++) {
  try {
    await db.query("select send_direct_message($1,$2)", [cid, `Message ${sent}`]);
  } catch {
    break;
  }
}
assert.ok(sent > 0 && sent < 200, `direct messages were capped at ${sent}`);
checks++;
await denied("select send_direct_message($1,$2)", [cid, "Over the rate"]);
await as(alice);
for (let i = 0; i < 5; i++)
  await db.query(
    "select apply_provider('psychologist',$1,$2)",
    [`Provider ${i}`, "Application description long enough to pass"],
  );
await denied(
  "select apply_provider('psychologist','One too many','Application description long enough to pass')",
);
checks++;

// ── Group creation validation returns readable messages ───────────────────
await as(bob);
await denied("select create_group(' ','Missing name','sports')");
await denied(
  "select create_group('','Missing name entirely','arts')",
);
await as(null);
await denied("select create_group('Anon group','No access','sports')");

console.log(
  `PASS: ${checks} database checks covering migrations, RLS, anonymity, membership, reactions, reversible moderation, capacity, ownership, notifications, appointments, audit history, connection consent, private messages, summary views, bounded paging, admin aggregates and rate limiting.`,
);
await db.close();
