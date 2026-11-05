import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import { once } from "node:events";
import { createClient } from "@supabase/supabase-js";

test(
  "local auth renews expired sessions and rejects invalid tokens",
  { timeout: 15000 },
  async (t) => {
    const server = spawn(
      process.execPath,
      [new URL("fixture-server.mjs", import.meta.url).pathname],
      {
        env: { ...process.env, FIXTURE_PORT: "0", LOCAL_DEMO: "true" },
        stdio: ["ignore", "pipe", "inherit"],
      },
    );
    t.after(async () => {
      if (server.exitCode === null) {
        const exited = once(server, "exit");
        server.kill("SIGTERM");
        await exited;
      }
    });
    let port;
    const lines = createInterface({ input: server.stdout });
    for await (const line of lines) {
      const match = line.match(/UI fixture server ready on (\d+)/);
      if (match) {
        port = match[1];
        break;
      }
    }
    assert.ok(port, "demo API started on an isolated port");
    const url = `http://127.0.0.1:${port}`;
    const client = createClient(url, "local-demo-publishable-key", {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
    const login = await client.auth.signInWithPassword({
      email: "alex@example.test",
      password: "Correct-password1",
    });
    assert.equal(login.error, null);
    const original = login.data.session;
    assert.ok(original);
    const refreshed = await client.auth.refreshSession();
    assert.equal(refreshed.error, null);
    assert.equal(refreshed.data.user.id, login.data.user.id);
    assert.ok(refreshed.data.session.expires_at > Date.now() / 1000);

    // Reproduce restoring the expired session saved in the user's browser.
    const parts = original.access_token.split(".");
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
    payload.exp = Math.floor(Date.now() / 1000) - 60;
    parts[1] = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const restored = await client.auth.setSession({
      access_token: parts.join("."),
      refresh_token: original.refresh_token,
    });
    assert.equal(restored.error, null);
    assert.ok(restored.data.session.expires_at > Date.now() / 1000);
    assert.equal(restored.data.user.email, "alex@example.test");

    const invalidRefresh = await client.auth.refreshSession({
      refresh_token: "wrong-token",
    });
    assert.equal(invalidRefresh.error.message, "Invalid refresh token");
    assert.equal(invalidRefresh.error.status, 400);
    const invalidLogin = await client.auth.signInWithPassword({
      email: "alex@example.test",
      password: "wrong-password",
    });
    assert.match(invalidLogin.error.message, /Invalid login credentials/);
    assert.equal(invalidLogin.error.status, 400);
    const invalidVerifier = await fetch(
      `${url}/auth/v1/token?grant_type=pkce`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auth_code: "invalid",
          code_verifier: "invalid",
        }),
      },
    );
    assert.equal(invalidVerifier.status, 400);
    assert.equal((await invalidVerifier.json()).code, "bad_code_verifier");
  },
);
