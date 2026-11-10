import { PGlite } from "@electric-sql/pglite";
import { readFile, readdir } from "node:fs/promises";
import assert from "node:assert/strict";
const db = new PGlite();
try {
  await db.exec(`create role anon; create role authenticated; create schema auth;
    create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,created_at timestamptz default now());
    create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
    grant usage on schema public,auth to anon,authenticated; grant execute on function auth.uid() to anon,authenticated;`);
  for (const file of (
    await readdir(new URL("../supabase/migrations/", import.meta.url))
  ).sort())
    await db.exec(
      await readFile(
        new URL("../supabase/migrations/" + file, import.meta.url),
        "utf8",
      ),
    );
  const admin = "11111111-1111-4111-8111-111111111111",
    member = "22222222-2222-4222-8222-222222222222",
    missing = "33333333-3333-4333-8333-333333333333";
  await db.query(
    `insert into auth.users(id,email,email_confirmed_at) values($1,'admin@example.test',now()),($2,'incomplete@example.test',null),($3,'missing@example.test',null)`,
    [admin, member, missing],
  );
  await db.query("insert into public.admins values($1)", [admin]);
  await db.query(
    "update profiles set name='Admin',interests=array['Music'],availability=array['Weekends'],goal='Connect' where id=$1",
    [admin],
  );
  await db.query("delete from profiles where id=$1", [missing]);
  async function as(id) {
    await db.exec("reset role");
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [
      id ?? "",
    ]);
    await db.exec(id ? "set role authenticated" : "set role anon");
  }
  async function contacts(params = "") {
    return (
      await db.query(
        "select public.admin_registered_members(" + params + ") as result",
      )
    ).rows[0].result;
  }
  await as(null);
  await assert.rejects(contacts(), /permission denied/);
  await as(member);
  await assert.rejects(contacts(), /Administrator access required/);
  await assert.rejects(
    contacts(`p_user=>'${admin}'`),
    /Administrator access required/,
  );
  await as(admin);
  let result = await contacts();
  assert.equal(result.total, 3);
  assert.equal(result.rows.length, 3);
  assert.equal(
    result.rows.find((r) => r.id === member).email,
    "incomplete@example.test",
  );
  assert.equal(
    result.rows.find((r) => r.id === member).email_confirmed_at,
    null,
  );
  assert.equal(
    result.rows.find((r) => r.id === missing).profile_complete,
    false,
  );
  result = await contacts("p_incomplete_only=>true");
  assert.equal(result.total, 2);
  result = await contacts("p_search=>'INCOMPLETE@EXAMPLE.TEST'");
  assert.equal(result.total, 1);
  for (const text of ["%", "_", "' OR true --", "\\"])
    assert.equal(
      (
        await db.query(
          "select public.admin_registered_members(p_search=>$1) as result",
          [text],
        )
      ).rows[0].result.total,
      0,
    );
  const first = await contacts("p_limit=>2");
  const second = await contacts("p_limit=>2,p_offset=>2");
  assert.equal(first.total, 3);
  assert.equal(second.rows.length, 1);
  assert.equal(
    new Set([...first.rows, ...second.rows].map((r) => r.id)).size,
    3,
  );
  result = await contacts("p_offset=>100");
  assert.equal(result.total, 3);
  assert.deepEqual(result.rows, []);
  await assert.rejects(contacts("p_limit=>101"), /Invalid page bounds/);
  await assert.rejects(contacts("p_offset=>-1"), /Invalid page bounds/);
  await db.exec("reset role");
  await db.query("update auth.users set email=$1 where id=$2", [
    "changed@example.test",
    member,
  ]);
  await as(admin);
  assert.equal(
    (await contacts(`p_user=>'${member}'`)).rows[0].email,
    "changed@example.test",
  );
  await db.exec("reset role");
  await db.query("delete from auth.users where id=$1", [member]);
  await as(admin);
  assert.equal((await contacts()).total, 2);
  console.log(
    "Registration contacts: admin access, incomplete/missing profiles, unconfirmed email, literal search, pagination, email changes and deletion passed.",
  );
} finally {
  await db.close();
}
