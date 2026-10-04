import { test, expect, type BrowserContext } from "@playwright/test";
import { mkdir } from "node:fs/promises";
test.beforeEach(async ({ request }) => {
  await request.post("http://127.0.0.1:54329/test/reset");
});
async function signIn(context: BrowserContext) {
  const id = "11111111-1111-4111-8111-111111111111";
  const exp = Math.floor(Date.now() / 1000) + 3600;
  const enc = (v: unknown) =>
    Buffer.from(JSON.stringify(v)).toString("base64url");
  const token =
    enc({ alg: "HS256", typ: "JWT" }) +
    "." +
    enc({
      sub: id,
      exp,
      iat: Math.floor(Date.now() / 1000),
      aud: "authenticated",
      role: "authenticated",
      iss: "http://127.0.0.1:54329/auth/v1",
    }) +
    ".dGVzdA";
  const session = {
    access_token: token,
    refresh_token: "test",
    expires_in: 3600,
    expires_at: exp,
    token_type: "bearer",
    user: {
      id,
      aud: "authenticated",
      role: "authenticated",
      email: "alex@example.test",
      app_metadata: { provider: "email" },
      user_metadata: {},
    },
  };
  await context.addCookies([
    {
      name: "sb-127-auth-token",
      value: "base64-" + enc(session),
      domain: "localhost",
      path: "/",
      httpOnly: false,
      sameSite: "Lax",
    },
  ]);
}
async function noOverflow(page: import("@playwright/test").Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
  ).toBe(true);
}
test("email sign in and mobile layout", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/signin");
  await expect(
    page.getByRole("heading", { name: "Welcome to your hub." }),
  ).toBeVisible();
  await page.getByLabel("Email address").fill("alex@example.test");
  await page
    .getByRole("button", { name: "No password yet? Use email access" })
    .click();
  await page.getByRole("button", { name: "Send sign-in email" }).click();
  await expect(
    page.getByRole("heading", { name: "Check your inbox." }),
  ).toBeVisible();
  await noOverflow(page);
});
test("signed-out visitors cannot enter the hub", async ({ page }) => {
  await page.goto("/groups");
  await expect(page).toHaveURL(/signin/);
});
test("account without a profile can complete onboarding and reload", async ({
  page,
  context,
  request,
}) => {
  await request.post("http://127.0.0.1:54329/test/missing-profile");
  await signIn(context);
  await page.goto("/");
  await expect(page).toHaveURL(/onboarding/, { timeout: 20000 });
  await page.getByLabel("Your display name").fill("New member");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByRole("button", { name: "Save my profile", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "You’re right where you belong." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Explore my hub" }).click();
  await expect(page).toHaveURL("http://localhost:3101/");
  await page.reload();
  await expect(page).toHaveURL("http://localhost:3101/");
  await expect(
    page.getByRole("link", { name: /Hey, New member/ }),
  ).toBeVisible();
});
test("email code signs in without the browser that requested the email", async ({
  page,
}) => {
  await page.goto("/signin");
  await page.getByLabel("Email address").fill("alex@example.test");
  await page
    .getByRole("button", { name: "No password yet? Use email access" })
    .click();
  await page.getByRole("button", { name: "Send sign-in email" }).click();
  await page.getByLabel("Email verification code").fill("123456");
  await page.getByRole("button", { name: "Verify code and continue" }).click();
  await expect(page).toHaveURL("http://localhost:3101/");
  await expect(
    page.getByRole("heading", { name: /Good to see you/ }),
  ).toBeVisible();
});
test("cross-device link waits for confirmation and persists the session", async ({
  page,
}) => {
  let verifications = 0;
  page.on("request", (r) => {
    if (r.url().includes("/auth/v1/verify")) verifications++;
  });
  await page.goto("/auth/confirm?token_hash=valid-test-hash&type=email");
  await expect(
    page.getByRole("button", { name: "Confirm and continue" }),
  ).toBeVisible();
  expect(verifications).toBe(0);
  await page.getByRole("button", { name: "Confirm and continue" }).click();
  await expect(page).toHaveURL("http://localhost:3101/");
  await page.reload();
  await expect(
    page.getByRole("heading", { name: /Good to see you/ }),
  ).toBeVisible();
});
test("invalid email link gives a recoverable error", async ({ page }) => {
  await page.goto("/auth/confirm?token_hash=expired&type=email");
  await page.getByRole("button", { name: "Confirm and continue" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Request a new email" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Request a new sign-in email" }).click();
  await expect(page).toHaveURL(/signin/);
});
test("failed legacy callback returns to sign-in", async ({ page }) => {
  await page.goto("/auth/callback?code=invalid");
  await expect(page).toHaveURL(/signin\?error=confirmation/);
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "couldn’t complete email confirmation" }),
  ).toBeVisible();
});
test("member request and private conversation on mobile", async ({
  page,
  context,
  request,
}) => {
  await request.post("http://127.0.0.1:54329/test/reset");
  await signIn(context);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/people");
  await expect(
    page.getByRole("heading", { name: "Find your people." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Connect", exact: true }).click();
  await expect(page.getByText("Request sent", { exact: true })).toBeVisible();
  await request.post("http://127.0.0.1:54329/test/accept-connection");
  await page.reload();
  await page
    .getByRole("button", { name: "Chat with Maya", exact: true })
    .click();
  await page
    .getByLabel("Message", { exact: true })
    .fill("Hello Maya, want to study together?");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.getByRole("log")).toContainText(
    "Hello Maya, want to study together?",
  );
  await noOverflow(page);
  await page.screenshot({
    path: "artifacts/mobile-people.png",
    fullPage: true,
  });
});
test("mobile home, groups, join, conversation and calendar", async ({
  page,
  context,
}) => {
  await signIn(context);
  await page.setViewportSize({ width: 390, height: 844 });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Good to see you/ }),
  ).toBeVisible();
  await noOverflow(page);
  await mkdir("artifacts", { recursive: true });
  await page.screenshot({ path: "artifacts/mobile-home.png", fullPage: true });
  await page.goto("/groups");
  await expect(
    page.getByRole("heading", { name: "Find your next connection." }),
  ).toBeVisible();
  await page.getByRole("searchbox", { name: "Search groups" }).fill("music");
  await page.getByRole("link", { name: /Music/ }).click();
  await page.getByRole("button", { name: "Join this group" }).click();
  await expect(page.getByRole("button", { name: "Leave group" })).toBeVisible();
  await page
    .getByLabel("What’s on your mind?")
    .fill("A new shared playlist for Friday.");
  await page.getByLabel("Use an anonymous alias").check();
  await page.getByRole("button", { name: "Post", exact: true }).click();
  await expect(
    page.getByText("A new shared playlist for Friday.", { exact: true }),
  ).toBeVisible();
  await noOverflow(page);
  await page.screenshot({
    path: "artifacts/mobile-conversation.png",
    fullPage: true,
  });
  await page.goto("/my-sessions");
  await expect(
    page.getByRole("heading", { name: "My Sessions", exact: true }),
  ).toBeVisible();
  await noOverflow(page);
  expect(errors).toEqual([]);
});
test("desktop activity directory and task page", async ({ page, context }) => {
  await signIn(context);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/book-activities");
  await expect(
    page.getByRole("heading", { name: /Make time for/ }),
  ).toBeVisible();
  await expect(
    page.getByText("A little lunchtime reset", { exact: true }),
  ).toBeVisible();
  await noOverflow(page);
  await page.screenshot({
    path: "artifacts/desktop-activities.png",
    fullPage: true,
  });
  await page.goto("/sessions/1");
  await expect(
    page.getByRole("heading", { name: "A little lunchtime reset" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Add to calendar" }),
  ).toBeVisible();
});

test("password sign in, invalid credentials, and sign out", async ({
  page,
}) => {
  await page.goto("/signin");
  await page.getByLabel("Email address").fill("alex@example.test");
  await page.getByLabel("Password", { exact: true }).fill("wrong-password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Invalid login credentials" }),
  ).toBeVisible();
  await page.getByLabel("Password", { exact: true }).fill("Correct-password1");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: /Good to see you/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page).toHaveURL(/signin/);
  await page.goto("/people");
  await expect(page).toHaveURL(/signin/);
});
test("student signup requires verification and LinkedIn is unavailable honestly", async ({
  page,
}) => {
  await page.goto("/signin");
  await page.getByRole("button", { name: "Student", exact: true }).click();
  await expect(page.getByPlaceholder("you@college.edu")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Continue with LinkedIn" }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Create an account", exact: true })
    .click();
  await page.getByLabel("Email address").fill("alex@example.test");
  await page
    .getByLabel("Create a password", { exact: true })
    .fill("Correct-password1");
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Check your inbox." }),
  ).toBeVisible();
  await page.getByLabel("Email verification code").fill("123456");
  await page.getByRole("button", { name: "Verify code and continue" }).click();
  await expect(
    page.getByRole("heading", { name: /Good to see you/ }),
  ).toBeVisible();
});
test("category browsing, subgroup creation, and responsive redesigned pages", async ({
  page,
  context,
}) => {
  await signIn(context);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Good to see you/ }),
  ).toBeVisible();
  await page.screenshot({
    path: "artifacts/redesign-home-desktop.png",
    fullPage: true,
  });
  await page.getByRole("link", { name: /Sports Football/ }).click();
  await expect(
    page.getByRole("heading", { name: "Sports subgroups" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Cricket/ }).last(),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /Music/ })).toHaveCount(0);
  await page
    .getByRole("button", { name: "All categories", exact: true })
    .click();
  await page.screenshot({
    path: "artifacts/redesign-groups-desktop.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Create a subgroup" }).click();
  await page.getByLabel("Main category").selectOption("sports");
  await page.getByLabel("Subgroup name").fill("Weekend football crew");
  await page
    .getByLabel("What brings this group together?")
    .fill("Friendly weekend football games.");
  await page
    .getByRole("button", { name: "Create subgroup", exact: true })
    .click();
  await expect(
    page.getByRole("link", { name: /Weekend football crew/ }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await noOverflow(page);
  await page.screenshot({
    path: "artifacts/redesign-groups-mobile.png",
    fullPage: true,
  });
  await page.getByRole("link", { name: /Weekend football crew/ }).click();
  await expect(
    page.getByRole("heading", { name: "Weekend football crew" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Sports \/ All subgroups/ }),
  ).toBeVisible();
  await noOverflow(page);
});
test("redesigned sign-in screenshots", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/signin");
  await expect(
    page.getByRole("button", { name: "Continue with LinkedIn" }),
  ).toBeDisabled();
  await page.screenshot({
    path: "artifacts/redesign-signin-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await noOverflow(page);
  await page.screenshot({
    path: "artifacts/redesign-signin-mobile.png",
    fullPage: true,
  });
});

test("existing email-link member can set a password in account settings", async ({
  page,
  context,
}) => {
  await signIn(context);
  await page.goto("/account");
  await page
    .getByLabel("New password", { exact: true })
    .fill("New-password-123");
  await page
    .getByLabel("Confirm password", { exact: true })
    .fill("Different-password-123");
  await page.getByRole("button", { name: "Save password" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Your passwords don’t match." }),
  ).toBeVisible();
  await page
    .getByLabel("Confirm password", { exact: true })
    .fill("New-password-123");
  const update = page.waitForRequest(
    (r) => r.url().endsWith("/auth/v1/user") && r.method() === "PUT",
  );
  await page.getByRole("button", { name: "Save password" }).click();
  expect((await update).postDataJSON().password).toBe("New-password-123");
  await expect(
    page.getByRole("status").filter({ hasText: "Password saved." }),
  ).toBeVisible();
  await expect(page.getByLabel("New password", { exact: true })).toHaveValue(
    "",
  );
});

test("public marketing pages render for signed-out visitors", async ({
  page,
}) => {
  for (const path of [
    "/",
    "/about",
    "/membership",
    "/careers",
    "/contact",
    "/programs/meetup",
    "/meetup-activities",
  ]) {
    await page.goto(path);
    expect(new URL(page.url()).pathname, `${path} must not redirect`).toBe(path);
    await expect(page.getByRole("link", { name: /wellness/ }).first()).toBeVisible();
  }
});

test("private routes still redirect signed-out visitors to sign in", async ({
  page,
}) => {
  for (const path of ["/groups", "/people", "/dashboard", "/discuss"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/signin/);
  }
});

test("every page declares metadata, canonical and index directives", async ({
  request,
}) => {
  const pages = [
    "/",
    "/about",
    "/careers",
    "/membership",
    "/coming-soon",
    "/contact",
    "/landing",
    "/signin",
    "/groups",
    "/people",
    "/discuss",
    "/dashboard",
    "/book-activities",
    "/my-sessions",
    "/psychologists",
    "/onboarding",
    "/account",
    "/programs/meetup",
    "/groups/some-subgroup",
    "/sessions/1",
  ];
  for (const path of pages) {
    const html = await (await request.get(path)).text();
    const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "";
    expect(title, `${path} needs a title`).not.toBe("");
    expect(html, `${path} needs a canonical`).toContain('rel="canonical"');
    expect(html, `${path} needs a description`).toMatch(
      /name="description" content="[^"]{20,}"/,
    );
    expect(html, `${path} needs og:title`).toContain('property="og:title"');
  }
});

test("private pages are marked noindex and public pages are indexable", async ({
  request,
}) => {
  const privateHtml = await (await request.get("/dashboard")).text();
  expect(privateHtml).toContain('name="robots" content="noindex');
  const publicHtml = await (await request.get("/about")).text();
  expect(publicHtml).toContain('name="robots" content="index, follow"');
});

test("sitemap and robots list the public surface only", async ({ request }) => {
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("<urlset");
  for (const path of ["/about", "/membership", "/careers", "/contact"]) {
    expect(sitemap, `${path} missing from sitemap`).toContain(`localhost:3101${path}<`);
  }
  expect(sitemap, "program pages belong in the sitemap").toContain(
    "localhost:3101/programs/meetup<",
  );
  for (const path of ["/dashboard", "/people", "/my-sessions", "/account"]) {
    expect(sitemap, `${path} must not be in the sitemap`).not.toContain(
      `localhost:3101${path}<`,
    );
  }

  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Sitemap:");
  for (const path of ["/dashboard", "/people", "/sessions"]) {
    expect(robots, `${path} must be disallowed`).toContain(`Disallow: ${path}`);
  }
  expect(robots).toContain("Disallow: /groups");
});

test("security headers and the health endpoint are present", async ({
  request,
}) => {
  const response = await request.get("/about");
  expect(response.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response.headers()["x-frame-options"]).toBe("DENY");
  expect(response.headers()["content-security-policy"]).toContain(
    "frame-ancestors 'none'",
  );

  const health = await request.get("/api/health");
  expect(health.status()).toBe(200);
  const body = await health.json();
  expect(body.status).toBe("ok");
  expect(JSON.stringify(body)).not.toContain("publishable");
});

test("health reports the schema it expects", async ({ request }) => {
  const body = await (await request.get("/api/health")).json();
  expect(body.supabase).toBe("configured");
  // The fixture serves group_summaries, so the probe resolves it.
  expect(body.schema).toBe("current");
});
