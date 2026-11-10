import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import {
  OFFENSIVE_WORDS,
  maskOffensiveText,
  maskContent,
  createModeratedFetch,
} from "../src/lib/moderation.mjs";

test("mask whole words, variants and Hindi without censoring innocent substrings", () => {
  for (const word of OFFENSIVE_WORDS)
    assert.equal(
      maskOffensiveText(word),
      "*".repeat(Array.from(word).length),
      word,
    );
  assert.equal(
    maskOffensiveText("This is FUCKING shit!"),
    "This is ******* ****!",
  );
  assert.equal(maskOffensiveText("f.u.c.k and sh1t"), "******* and ****");
  assert.equal(maskOffensiveText("f u c k and fuuuck"), "******* and ******");
  assert.equal(maskOffensiveText("chutiya और चूतिया"), "******* और ******");
  const clean =
    "A classic assignment in Scunthorpe. Assistant, badminton, coffee and music.";
  assert.equal(maskOffensiveText(clean), clean);
  assert.equal(
    maskOffensiveText("Already **** and *****"),
    "Already **** and *****",
  );
});

test("mask nested member content while preserving links, IDs and credentials", () => {
  const original = {
    id: "shit-id",
    password: "fucking-Password1",
    email: "shit@example.test",
    href: "/groups/shit",
    evidence: "https://example.test/shit",
    name: "Shit",
    interests: ["badminton", "shit"],
    replies: [{ body: "fuck this", alias: "bitch" }],
    p_body: "shit",
    status: "approved",
    count: 2,
    other: null,
  };
  const masked = maskContent(original);
  assert.equal(masked.name, "****");
  assert.deepEqual(masked.interests, ["badminton", "****"]);
  assert.deepEqual(masked.replies, [{ body: "**** this", alias: "*****" }]);
  assert.equal(masked.p_body, "****");
  for (const key of [
    "id",
    "password",
    "email",
    "href",
    "evidence",
    "status",
    "count",
    "other",
  ])
    assert.equal(masked[key], original[key]);
  assert.equal(original.name, "Shit", "the source object is not mutated");
});

test("REST transport filters new submissions and historical results", async () => {
  let request;
  const transport = createModeratedFetch(async (value) => {
    request = value;
    return new Response(
      JSON.stringify([{ body: "shit", name: "bitch", href: "/shit" }]),
      {
        headers: {
          "content-type": "application/json",
          "content-range": "0-0/1",
          etag: "old",
        },
      },
    );
  });
  const response = await transport(
    "http://localhost/rest/v1/rpc/send_direct_message",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: "Bearer unchanged",
      },
      body: JSON.stringify({
        p_connection: 9,
        p_body: "fuck",
        password: "shit",
      }),
    },
  );
  assert.deepEqual(await request.json(), {
    p_connection: 9,
    p_body: "****",
    password: "shit",
  });
  assert.equal(request.headers.get("authorization"), "Bearer unchanged");
  assert.deepEqual(await response.json(), [
    { body: "****", name: "*****", href: "/shit" },
  ]);
  assert.equal(response.headers.get("content-range"), "0-0/1");
  assert.equal(response.headers.get("etag"), null);
});

test("authentication and non-JSON requests are untouched", async () => {
  const originalResponse = new Response(
    JSON.stringify({ name: "shit", access_token: "fuck" }),
    { headers: { "content-type": "application/json" } },
  );
  const transport = createModeratedFetch(async (request) => {
    assert.equal((await request.json()).password, "shit");
    return originalResponse;
  });
  assert.equal(
    await transport("http://localhost/auth/v1/token?grant_type=password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password: "shit" }),
    }),
    originalResponse,
  );
  const empty = new Response(null, { status: 204 });
  assert.equal(
    await createModeratedFetch(async () => empty)(
      "http://localhost/rest/v1/posts",
      { method: "HEAD" },
    ),
    empty,
  );
});

test(
  "database enforces the same dictionary on direct writes and keeps consent rules",
  { timeout: 60000 },
  async (t) => {
    const db = new PGlite();
    t.after(() => db.close());
    await db.exec(
      `create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,created_at timestamptz default now());create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;grant usage on schema public,auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;`,
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
    for (const value of [
      ...OFFENSIVE_WORDS,
      "f.u.c.k and sh1t",
      "f u c k and fuuuck",
      "chutiya और चूतिया",
      "Classic assignment Scunthorpe",
    ]) {
      const result = (
        await db.query("select mask_offensive_text($1) as value", [value])
      ).rows[0].value;
      assert.equal(result, maskOffensiveText(value), value);
    }
    const alice = "11111111-1111-4111-8111-111111111111",
      bob = "22222222-2222-4222-8222-222222222222";
    await db.exec("insert into organisation_domains(domain,member_type) values ('company.example','corporate')");
    await db.query(
      "insert into auth.users values($1,'alice@company.example',now()),($2,'bob@company.example',now())",
      [alice, bob],
    );
    await db.exec("update profiles set name='Member',interests=array['Sports'],availability=array['Weekends'],goal='Meet people'");
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [
      alice,
    ]);
    await db.query(
      "update profiles set name='shit',bio='fucking rude',interests=array['badminton','shit'] where id=$1",
      [alice],
    );
    const profile = (
      await db.query("select name,bio,interests from profiles where id=$1", [
        alice,
      ])
    ).rows[0];
    assert.deepEqual(profile, {
      name: "****",
      bio: "******* rude",
      interests: ["badminton", "****"],
    });
    const cid = (
      await db.query(
        "insert into connections(requester,recipient,status) values($1,$2,'accepted') returning id",
        [alice, bob],
      )
    ).rows[0].id;
    const message = (
      await db.query(
        "insert into direct_messages(connection_id,sender,body) values($1,$2,'This is sh1t') returning id,body",
        [cid, alice],
      )
    ).rows[0];
    assert.equal(message.body, "This is ****");
    await db.query("update direct_messages set body='f.u.c.k' where id=$1", [
      message.id,
    ]);
    assert.equal(
      (
        await db.query("select body from direct_messages where id=$1", [
          message.id,
        ])
      ).rows[0].body,
      "*******",
    );
    await db.exec("set role authenticated");
    const postId = (
      await db.query("select publish_post('shit',null,null,false) as id")
    ).rows[0].id;
    await db.exec("reset role");
    assert.equal(
      (await db.query("select body from posts where id=$1", [postId])).rows[0]
        .body,
      "****",
    );
    await db.query("update connections set status='pending' where id=$1", [
      cid,
    ]);
    await db.exec("set role authenticated");
    await assert.rejects(
      db.query("select send_direct_message($1,'A clean message')", [cid]),
    );
  },
);
