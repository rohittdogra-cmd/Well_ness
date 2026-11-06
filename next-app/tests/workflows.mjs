import test from "node:test";
import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { readFile, readdir } from "node:fs/promises";
import { safeReturnPath } from "../src/lib/returnPath.mjs";
test("return destinations retain deep links and reject external/auth redirects", () => {
  assert.equal(
    safeReturnPath("/groups/music?view=latest"),
    "/groups/music?view=latest",
  );
  for (const value of [
    "https://evil.test",
    "//evil.test",
    "/\\evil.test",
    "/signin",
    "/auth/callback?token_hash=secret",
    null,
  ])
    assert.equal(safeReturnPath(value), "/");
});
test("corporate/student eligibility, provider approval, private guest receipts and notifications", async () => {
  const db = new PGlite();
  try {
    await db.exec(
      `create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz);create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;grant usage on schema public,auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;`,
    );
    for (const name of (
      await readdir(new URL("../supabase/migrations/", import.meta.url))
    ).sort())
      await db.exec(
        await readFile(
          new URL("../supabase/migrations/" + name, import.meta.url),
          "utf8",
        ),
      );
    await db.exec(
      "insert into booking_gateway_config(secret_hash) values(encode(sha256(convert_to('test-gateway-only','UTF8')),'hex'))",
    );
    const member = "11111111-1111-4111-8111-111111111111",
      doctor = "22222222-2222-4222-8222-222222222222",
      admin = "33333333-3333-4333-8333-333333333333",
      stranger = "44444444-4444-4444-8444-444444444444";
    await db.query(
      "insert into auth.users values($1,'member@gmail.com',now()),($2,'doctor@gmail.com',now()),($3,'admin@work.example',now()),($4,'person@random-custom.example',now())",
      [member, doctor, admin, stranger],
    );
    await db.query("insert into admins values($1)", [admin]);
    const as = async (id) => {
      await db.exec("reset role");
      await db.query("select set_config('request.jwt.claim.sub',$1,false)", [
        id || "",
      ]);
      await db.exec("set role " + (id ? "authenticated" : "anon"));
    };
    const value = async (sql, args = []) =>
      (await db.query(sql, args)).rows[0]?.value;
    await as(member);
    assert.equal(
      (await value("select verification_status() as value")).verified,
      false,
    );
    await assert.rejects(
      db.query("select publish_post('not eligible',null,null,false)"),
    );
    await assert.rejects(
      db.query("select set_organisation_domain('gmail.com','corporate')"),
    );
    await as(stranger);
    assert.equal(
      (await value("select verification_status() as value")).verified,
      false,
    );
    await as(admin);
    await db.query(
      "select set_organisation_domain('college.example','student')",
    );
    await db.exec("reset role");
    await db.query(
      "update auth.users set email='member@college.example' where id=$1",
      [member],
    );
    await as(member);
    assert.equal(
      (await value("select verification_status() as value")).verified,
      true,
    );
    await as(doctor);
    const provider = await value(
      "select apply_provider('psychologist','Dr. Example','Qualified practitioner application with a detailed registration history.') as value",
    );
    assert.ok(
      (
        await db.query(
          "select * from notifications where user_id=$1 and href='/provider'",
          [doctor],
        )
      ).rows.length,
    );
    await as(null);
    const catalog = await value("select list_public_groups() as value");
    assert.ok(catalog.length > 0);
    assert.equal(JSON.stringify(catalog).includes("group_members"), false);
    assert.equal(JSON.stringify(catalog).includes(member), false);
    await assert.rejects(db.query("select * from group_members"));
    await assert.rejects(db.query("select * from posts"));
    await assert.rejects(db.query("select toggle_group(1,true)"));
    assert.equal((await db.query("select id from providers")).rows.length, 0);
    await assert.rejects(
      db.query(
        "select request_guest_appointment($1,now()+interval '1 day','guest@example.com','test-gateway-only',repeat('a',64))",
        [provider],
      ),
    );
    await as(admin);
    assert.ok(
      (
        await db.query(
          "select * from notifications where user_id=$1 and href='/dashboard'",
          [admin],
        )
      ).rows.length,
    );
    await db.query("select review_provider($1,true)", [provider]);
    await as(null);
    assert.equal((await db.query("select id from providers")).rows.length, 1);
    await assert.rejects(
      db.query(
        "select request_guest_appointment($1,now()+interval '2 days','direct@example.com',null,repeat('a',64))",
        [provider],
      ),
    );
    const receipt = await value(
      "select request_guest_appointment($1,now()+interval '2 days','guest@example.com','test-gateway-only',repeat('a',64)) as value",
      [provider],
    );
    assert.equal(receipt.receipt.length, 72);
    await assert.rejects(db.query("select * from guest_appointments"));
    await assert.rejects(db.query("select * from provider_bookings"));
    assert.equal(
      (
        await value("select guest_appointment_status($1) as value", [
          receipt.receipt,
        ])
      ).status,
      "pending",
    );
    await assert.rejects(
      db.query("select guest_appointment_status($1)", ["x".repeat(72)]),
    );
    await assert.rejects(
      db.query("select confirm_guest_appointment($1)", [receipt.id]),
    );
    await as(stranger);
    assert.deepEqual(
      await value("select provider_appointments() as value"),
      [],
    );
    await assert.rejects(
      db.query("select confirm_guest_appointment($1)", [receipt.id]),
    );
    await as(member);
    await assert.rejects(
      db.query("select book_provider($1,now()+interval '2 days 30 minutes')", [
        provider,
      ]),
    );
    await as(doctor);
    const requests = await value("select provider_appointments() as value");
    assert.equal(requests[0].email, "guest@example.com");
    assert.equal(JSON.stringify(requests).includes(receipt.receipt), false);
    await db.query("select confirm_guest_appointment($1)", [receipt.id]);
    await as(null);
    assert.equal(
      (
        await value("select guest_appointment_status($1) as value", [
          receipt.receipt,
        ])
      ).status,
      "confirmed",
    );
    await db.query("select cancel_guest_appointment($1)", [receipt.receipt]);
    assert.equal(
      (
        await value("select guest_appointment_status($1) as value", [
          receipt.receipt,
        ])
      ).status,
      "cancelled",
    );
    await as(member);
    const booking = await value(
      "select book_provider($1,now()+interval '3 days') as value",
      [provider],
    );
    assert.ok(
      (
        await db.query(
          "select * from notifications where user_id=$1 and message like '%awaiting confirmation%'",
          [member],
        )
      ).rows.length,
    );
    await as(null);
    await assert.rejects(
      db.query(
        "select request_guest_appointment($1,now()+interval '3 days 30 minutes','other@example.com','test-gateway-only',repeat('b',64))",
        [provider],
      ),
    );
    await as(doctor);
    await db.query("select confirm_booking($1)", [booking]);
    await as(member);
    assert.ok(
      (
        await db.query(
          "select * from notifications where user_id=$1 and message like '%is confirmed%'",
          [member],
        )
      ).rows.length,
    );
    await db.query("select cancel_booking($1)", [booking]);
    assert.ok(
      (
        await db.query(
          "select * from notifications where user_id=$1 and message like '%was cancelled%'",
          [member],
        )
      ).rows.length,
    );
    await as(null);
    for (let day = 4; day <= 5; day++)
      await db.query(
        "select request_guest_appointment($1,now()+($2||' days')::interval,'guest@example.com','test-gateway-only',repeat('a',64))",
        [provider, day],
      );
    await assert.rejects(
      db.query(
        "select request_guest_appointment($1,now()+interval '6 days','guest@example.com','test-gateway-only',repeat('a',64))",
        [provider],
      ),
    );
    await as(member);
    assert.deepEqual(
      (await db.query("select * from notifications where user_id=$1", [doctor]))
        .rows,
      [],
    );
  } finally {
    await db.close();
  }
});
