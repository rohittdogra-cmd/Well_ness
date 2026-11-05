import { PGlite } from "@electric-sql/pglite";
import { readFile, readdir } from "node:fs/promises";
import assert from "node:assert/strict";
const db = new PGlite();
const alice = "11111111-1111-4111-8111-111111111111",
  bob = "22222222-2222-4222-8222-222222222222",
  admin = "33333333-3333-4333-8333-333333333333";
await db.exec(
  `create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz);create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;grant usage on schema public,auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;`,
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
await db.query("insert into auth.users(id) values ($1),($2),($3)", [
  alice,
  bob,
  admin,
]);
await db.query("insert into public.admins values ($1)", [admin]);
await db.exec("insert into organisation_domains(domain,member_type) values ('company.example','corporate')");
await db.exec("update auth.users set email=id::text || '@company.example',email_confirmed_at=now()");
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
console.log(
  `PASS: ${checks} database checks covering migrations, RLS, anonymity, membership, reactions, moderation, capacity, ownership, notifications, appointments, audit history, connection consent and private messages.`,
);
// Verification must survive direct RPC calls and cannot be self-approved.
await db.exec("reset role");
await db.query("update auth.users set email='visitor@gmail.com', email_confirmed_at=now() where id=$1",[alice]);
await as(alice);
assert.equal((await scalar("select verification_status() as value")).verified,false); checks++;
await denied("select publish_post('Blocked',null,null,false)");
await denied("select create_session('Blocked','Browsing only','meetup',now()+interval '1 day',4,null,null)");
await denied("select send_direct_message($1,'Blocked')",[cid]);
await denied("select book_provider($1,now()+interval '10 days')",[pid]);
await denied("insert into verification_requests(user_id,method,evidence,status) values($1,'linkedin','https://www.linkedin.com/in/visitor','approved')",[alice]);
await denied("select submit_verification('linkedin','https://fake.example/person')");
await db.query("select submit_verification('linkedin','https://www.linkedin.com/in/visitor')");
assert.equal((await scalar("select verification_status() as value")).status,'pending'); checks++;
const verificationId=await scalar("select id as value from verification_requests where user_id=$1",[alice]);
await denied("select review_verification($1,true,'')",[verificationId]);
await as(admin);
await db.query("select review_verification($1,true,'')",[verificationId]);
await as(alice);
assert.equal((await scalar("select verification_status() as value")).verified,true); checks++;
await db.query("select publish_post('Approved member',null,null,false)");
assert.equal(await scalar("select evidence as value from verification_requests where user_id=$1",[alice]),'[reviewed; proof removed]'); checks++;
console.log(`PASS: verification enforcement, review permissions, proof cleanup and ${checks} total checks.`);
await db.close();
