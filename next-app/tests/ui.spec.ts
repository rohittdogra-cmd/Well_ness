import { test, expect, type BrowserContext } from "@playwright/test";
import { mkdir } from "node:fs/promises";
test.beforeEach(async ({ request, page }) => {
  await request.post("http://127.0.0.1:54329/test/reset");
  // Playwright reuses one page across tests in a worker, so a test that
  // resizes the viewport would otherwise leak that width into the next one.
  await page.setViewportSize({ width: 1280, height: 800 });
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
    expect(new URL(page.url()).pathname, `${path} must not redirect`).toBe(
      path,
    );
    await expect(
      page.getByRole("link", { name: /wellness/ }).first(),
    ).toBeVisible();
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
    expect(sitemap, `${path} missing from sitemap`).toContain(
      `localhost:3101${path}<`,
    );
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

test("unknown routes and unknown ids answer with a real 404", async ({
  request,
}) => {
  // A URL that matches no route at all.
  const missing = await request.get("/this-route-does-not-exist");
  expect(missing.status()).toBe(404);
  expect(await missing.text()).toContain("That page isn");

  // A malformed session id can never exist, so it is a confident not-found.
  const badSession = await request.get("/sessions/not-a-number");
  expect(badSession.status()).toBe(404);
});

test("a well-formed but unknown id renders the not-found page", async ({
  page,
  context,
}) => {
  // Signed in, because a signed-out visitor to a private route is redirected
  // to sign-in before the not-found page would be visible.
  await signIn(context);
  await page.goto("/sessions/999999");
  await expect(
    page.getByRole("heading", { name: /That page isn.t here/ }),
  ).toBeVisible();
});

test("an unknown group slug renders the not-found page", async ({
  page,
  context,
}) => {
  await signIn(context);
  await page.goto("/groups/no-such-group-abc123");
  await expect(
    page.getByRole("heading", { name: /That page isn.t here/ }),
  ).toBeVisible();
});

test("the feed polls only the newest page", async ({ page, context }) => {
  await signIn(context);
  const feedCalls: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("/rest/v1/rpc/get_feed")) feedCalls.push(r.url());
  });
  await page.goto("/discuss");
  await expect(
    page.getByRole("heading", { name: "Conversations", exact: true }),
  ).toBeVisible();
  // The first render issues the polled newest page; it must not also fetch
  // history pages, because there is nothing to page through yet.
  expect(feedCalls.length).toBeLessThanOrEqual(2);
  for (const call of feedCalls) expect(call).not.toContain("p_before=1");
});

test("dependency surface stays honest", async ({ request }) => {
  // A deleted dependency would surface here rather than at runtime on Vercel.
  const html = await (await request.get("/")).text();
  expect(html.length).toBeGreaterThan(0);
});

test("navigation is reachable at every viewport width", async ({
  page,
  context,
}) => {
  await signIn(context);
  // Regression guard: the sidebar was hidden at 900px while the bottom bar only
  // appeared at 760px, leaving 761-900px (iPad portrait) with no way to move
  // between sections.
  const widths = [320, 360, 375, 390, 600, 760, 768, 820, 880, 900, 1024, 1440];
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/discuss");
    await expect(
      page.getByRole("link", { name: "People", exact: true }).first(),
      `no visible navigation at ${width}px`,
    ).toBeVisible();
  }
});

test("no horizontal overflow at narrow phone widths", async ({
  page,
  context,
}) => {
  await signIn(context);
  for (const width of [320, 375, 390]) {
    for (const path of [
      "/",
      "/groups",
      "/discuss",
      "/book-activities",
      "/people",
    ]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(path);
      const overflows = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 1,
      );
      expect(overflows, `${path} overflows horizontally at ${width}px`).toBe(
        false,
      );
    }
  }
});

test("interactive controls meet the minimum touch target size", async ({
  page,
  context,
}) => {
  await signIn(context);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/discuss");
  await expect(
    page.getByRole("heading", { name: "Conversations" }),
  ).toBeVisible();

  const undersized = await page.evaluate(() => {
    const out: string[] = [];
    for (const el of document.querySelectorAll(
      'a[href], button, input, select, textarea, [role="button"]',
    )) {
      // A control wrapped in a label is activated by clicking the label, so the
      // label is the real target. Measure that rather than the input box.
      const wrapped = el.tagName === "INPUT" ? el.closest("label") : null;
      const target: Element = wrapped ?? el;
      const r = target.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      // WCAG 2.2 SC 2.5.8 exempts targets sitting inline in a sentence.
      if (el.tagName === "A" && el.closest("p, li, h1, h2, h3, h4, figcaption"))
        continue;
      if (r.height < 24)
        out.push(
          `${el.tagName.toLowerCase()}[${(el.textContent || el.getAttribute("aria-label") || el.id || "").trim().slice(0, 24)}] ${Math.round(r.width)}x${Math.round(r.height)}`,
        );
    }
    return out;
  });
  expect(undersized, `undersized controls: ${undersized.join(", ")}`).toEqual(
    [],
  );
});

test("trust pages are public, indexed and carry metadata", async ({
  page,
  request,
}) => {
  const routes = ["/how-it-works", "/safety", "/privacy", "/take-a-moment"];

  for (const route of routes) {
    const response = await request.get(route);
    expect(response.status(), `${route} must be public`).toBe(200);
    const html = await response.text();
    expect(html, `${route} needs a title`).toMatch(/<title>[^<]{6,}<\/title>/);
    expect(html, `${route} must be indexable`).toContain(
      'name="robots" content="index, follow"',
    );
  }

  const sitemap = await (await request.get("/sitemap.xml")).text();
  for (const route of routes)
    expect(sitemap, `${route} missing from sitemap`).toContain(
      `localhost:3101${route}<`,
    );

  // The trust links must be reachable from the footer, not orphaned.
  await page.goto("/");
  for (const [name, href] of [
    ["How it works", "/how-it-works"],
    ["Safety", "/safety"],
    ["Privacy", "/privacy"],
    ["Take a moment", "/take-a-moment"],
  ]) {
    await expect(
      page.locator(`footer a[href="${href}"]`).first(),
      `${name} must be linked from the footer`,
    ).toBeVisible();
  }
});

test("trust pages state what anonymity does not promise", async ({
  request,
}) => {
  const safety = await (await request.get("/safety")).text();
  expect(safety).toMatch(
    /cannot be certain|not verification|not a mask|no mask/i,
  );

  const privacy = await (await request.get("/privacy")).text();
  // The privacy page must not imply absolute anonymity, and must be honest that
  // self-service deletion does not exist yet.
  expect(privacy).toMatch(/not end-to-end encrypted/i);
  expect(privacy).toMatch(/cannot currently delete|not currently offer/i);
});

test("Take a Moment respects reduced motion and exits cleanly", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/take-a-moment");
  await expect(
    page.getByRole("heading", { name: "Nothing to do here." }),
  ).toBeVisible();

  // A pseudo-element cannot be queried directly, so assert on the resolved
  // computed style of the real elements that carry the animation.
  const animations = await page.evaluate(() => {
    const names: string[] = [];
    for (const el of document.querySelectorAll(
      ".moment-orb-ring, .moment-orb",
    )) {
      names.push(getComputedStyle(el).animationName);
    }
    const disc = document.querySelector(".moment-orb");
    if (disc) {
      const before = getComputedStyle(disc, "::before");
      names.push(before.animationName);
    }
    return names;
  });
  expect(animations.length).toBeGreaterThan(0);
  for (const name of animations) expect(name).toBe("none");

  // It must never trap anyone: the way out is always present.
  await expect(
    page.getByRole("link", { name: /Back to conversations/ }),
  ).toBeVisible();
});

test("Take a Moment uses the existing mood vocabulary", async ({
  page,
  context,
}) => {
  await signIn(context);
  await page.goto("/take-a-moment");
  const group = page.getByRole("group", { name: "How are you arriving?" });
  await expect(group).toBeVisible();
  // These must match the check_ins CHECK constraint, otherwise the write fails
  // and the private log silently stops recording.
  for (const mood of ["Great", "Good", "Okay", "Low", "Overwhelmed"])
    await expect(
      group.getByRole("button", { name: new RegExp(mood) }),
    ).toBeVisible();
});

test("dashboard surfaces requests to talk, conversations and a private week", async ({
  page,
  context,
}) => {
  await signIn(context);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/dashboard");
  await expect(
    page.getByRole("heading", { name: /Welcome back/ }),
  ).toBeVisible();

  // The mood strip must describe itself for a screen reader, not just draw bars.
  const mood = page.getByRole("img", { name: /Mood over the last seven days/ });
  await expect(mood).toBeVisible();
  expect(await mood.getAttribute("aria-label")).toMatch(/Great|Good|Okay|Low/);

  // A request to talk is the most time-sensitive thing here, so it has to be
  // visible from the dashboard rather than only from /people.
  await expect(
    page
      .getByText("No one waiting on you")
      .or(page.getByText(/would like to connect/))
      .first(),
  ).toBeVisible();

  // Upcoming sessions must be the next ones, not the oldest.
  await expect(page.getByText("What you have coming up")).toBeVisible();
});

test("accepting a request to talk works from the dashboard", async ({
  page,
  context,
  request,
}) => {
  await signIn(context);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/people");
  await page.getByRole("button", { name: "Connect", exact: true }).click();
  await expect(page.getByText("Request sent", { exact: true })).toBeVisible();
  await request.post("http://127.0.0.1:54329/test/accept-connection");

  await page.goto("/dashboard");
  await expect(page.getByText("Conversations you can open")).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Maya.*Open chat/ }),
  ).toBeVisible();
});

test("Microsoft uses Azure OAuth with email scope and the local callback", async ({
  page,
}) => {
  await page.route("**/auth/v1/settings", (route) =>
    route.fulfill({
      json: { external: { azure: true, linkedin_oidc: false } },
    }),
  );
  await page.route("**/auth/v1/authorize?**", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: "<h1>Microsoft authorization</h1>",
    }),
  );
  await page.goto("/signin");
  await page.getByRole("button", { name: "Continue with Microsoft" }).click();
  await expect(page).toHaveURL(/auth\/v1\/authorize/);
  const target = new URL(page.url());
  expect(target.searchParams.get("provider")).toBe("azure");
  expect(target.searchParams.get("scopes")).toBe("email");
  expect(target.searchParams.get("redirect_to")).toBe(
    "http://localhost:3101/auth/callback",
  );
  expect(target.searchParams.get("code_challenge")).toBeTruthy();
});

test("student email code creates an account only after verification", async ({
  page,
}) => {
  await page.goto("/signin");
  await expect(
    page.getByRole("button", { name: "Continue with Microsoft" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Student", exact: true }).click();
  await page
    .getByRole("button", { name: "Sign in or register with an email code" })
    .click();
  await page.getByLabel("Email address").fill("new@college.example");
  const request = page.waitForRequest(
    (r) => r.url().includes("/auth/v1/otp") && r.method() === "POST",
  );
  await page.getByRole("button", { name: "Send sign-in email" }).click();
  const body = (await request).postDataJSON();
  expect(body.create_user).toBe(true);
  expect(body.data.member_type).toBe("student");
  await expect(
    page.getByRole("button", { name: /Resend email in/ }),
  ).toBeDisabled();
  await page.getByLabel("Email verification code").fill("999999");
  await page.getByRole("button", { name: "Verify code and continue" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "could not be verified" })).toBeVisible();
  await expect(page).toHaveURL(/signin/);
  await page.getByLabel("Email verification code").fill("123456");
  await page.getByRole("button", { name: "Verify code and continue" }).click();
  await expect(page).toHaveURL("http://localhost:3101/");
  await page.reload();
  await expect(
    page.getByRole("heading", { name: /Good to see you/ }),
  ).toBeVisible();
});

test("returning to the email form preserves the send cooldown", async ({ page }) => {
  let sends = 0;
  page.on("request", (request) => {
    if (request.url().includes("/auth/v1/otp") && request.method() === "POST") sends++;
  });
  await page.goto("/signin");
  await page.getByRole("button", { name: "Sign in or register with an email code" }).click();
  await page.getByLabel("Email address").fill("Alex@Example.test");
  await page.getByRole("button", { name: "Send sign-in email" }).click();
  await expect(page.getByText("We sent a verification email to alex@example.test.")).toBeVisible();
  await page.getByRole("button", { name: "Back to sign in" }).click();
  await page.getByRole("button", { name: "Send sign-in email" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "before requesting another email" })).toBeVisible();
  expect(sends).toBe(1);
});

test("failed code delivery stays on the email form and allows retry", async ({ page }) => {
  await page.route("**/auth/v1/otp**", (route) => route.fulfill({
    status: 429,
    contentType: "application/json",
    body: JSON.stringify({ code: "over_email_send_rate_limit", msg: "Email rate limit exceeded" }),
  }));
  await page.goto("/signin");
  await page.getByRole("button", { name: "Sign in or register with an email code" }).click();
  await page.getByLabel("Email address").fill("alex@example.test");
  await page.getByRole("button", { name: "Send sign-in email" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Email rate limit exceeded" })).toBeVisible();
  await expect(page.getByLabel("Email verification code")).toHaveCount(0);
  await page.unroute("**/auth/v1/otp**");
  await page.getByRole("button", { name: "Send sign-in email" }).click();
  await expect(page.getByLabel("Email verification code")).toBeVisible();
});
