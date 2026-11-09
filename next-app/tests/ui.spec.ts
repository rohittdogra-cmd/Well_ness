import { test, expect, type BrowserContext } from "@playwright/test";
import { mkdir } from "node:fs/promises";
test.beforeEach(async ({ request, context }) => {
  await context.clearCookies();
  await request.post("http://127.0.0.1:54330/test/reset");
});
async function signIn(context: BrowserContext, expired = false) {
  const id = "11111111-1111-4111-8111-111111111111";
  const exp = Math.floor(Date.now() / 1000) + (expired ? -60 : 3600);
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
      iss: "http://127.0.0.1:54330/auth/v1",
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
    .getByRole("button", { name: "Sign in with an email link" })
    .click();
  await page.getByRole("button", { name: "Email me a sign-in link" }).click();
  await expect(
    page.getByRole("heading", { name: "Check your inbox." }),
  ).toBeVisible();
  await noOverflow(page);
});
test("signed-out visitors cannot enter private member pages", async ({
  page,
}) => {
  await page.goto("/profile");
  await expect(page).toHaveURL(/signin/);
});
test("account without a profile can complete onboarding and reload", async ({
  page,
  context,
  request,
}) => {
  await request.post("http://127.0.0.1:54330/test/missing-profile");
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
    page.getByRole("link", { name: /New member My profile/ }),
  ).toBeVisible();
});
test("email code signs in without the browser that requested the email", async ({
  page,
}) => {
  await page.goto("/signin");
  await page.getByLabel("Email address").fill("alex@example.test");
  await page
    .getByRole("button", { name: "Sign in with an email link" })
    .click();
  await page.getByRole("button", { name: "Email me a sign-in link" }).click();
  await page.getByLabel("Email verification code").fill("123456");
  await page.getByRole("button", { name: "Verify code and continue" }).click();
  await expect(page).toHaveURL("http://localhost:3101/");
  await expect(
    page.getByRole("heading", { name: /Your people.*Your pause/ }),
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
    page.getByRole("heading", { name: /Your people.*Your pause/ }),
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
      .filter({ hasText: "sign-in link could not be confirmed" }),
  ).toBeVisible();
});
test("member request and private conversation on mobile", async ({
  page,
  context,
  request,
}) => {
  await request.post("http://127.0.0.1:54330/test/reset");
  await signIn(context);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/people");
  await expect(
    page.getByRole("heading", { name: "Find your people." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Connect", exact: true }).click();
  await expect(page.getByText("Request sent", { exact: true })).toBeVisible();
  await request.post("http://127.0.0.1:54330/test/accept-connection");
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
    page.getByRole("heading", { name: /Your people.*Your pause/ }),
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
    page.getByRole("heading", { name: /Your people.*Your pause/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Account menu", exact: true }).click();
  await page.getByRole("menuitem", { name: "Sign out", exact: true }).click();
  await expect(
    page.getByRole("link", { name: "Sign in", exact: true }),
  ).toBeVisible();
  await page.goto("/profile");
  await expect(page).toHaveURL(/signin/);
});
test("student signup requires verification with corporate and student id options", async ({
  page,
}) => {
  await page.goto("/signin");

  await expect(page.getByRole("button", { name: /LinkedIn/i })).toHaveCount(0);
  await page
    .getByRole("button", { name: "Create an account", exact: true })
    .click();
  await page.getByRole("button", { name: "Student", exact: true }).click();
  await expect(page.getByPlaceholder("you@college.edu")).toBeVisible();
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
    page.getByRole("heading", { name: /Your people.*Your pause/ }),
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
    page.getByRole("heading", { name: /Your people.*Your pause/ }),
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
  await expect(page.getByRole("button", { name: /LinkedIn/i })).toHaveCount(0);
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

test("photo-led home hero and profile navigation work", async ({
  page,
  context,
}) => {
  await signIn(context);
  await page.goto("/");
  // Home page loads directly
  await expect(page).toHaveURL("http://localhost:3101/");
  // Greeting welcomes Smash Scorer, not Alex
  await expect(
    page.getByRole("link", { name: /Smash Scorer My profile/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /Your people.*Your pause/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Find your people", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".hero-photo-main img")).toHaveAttribute(
    "src",
    "/images/walk-together.webp",
  );

  // Profile navigation and page functionality
  await page.goto("/profile");
  await expect(
    page.getByRole("heading", { name: /Welcome, Smash Scorer/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Edit profile & interests" }).click();
  await expect(page.getByLabel("Display Name")).toHaveValue("Smash Scorer");
  await page.getByText("Avatar & persona options", { exact: true }).click();
  await expect(
    page.getByText("Assigned Persona", { exact: true }),
  ).toBeVisible();
});

test("interactive 60-second breathing reset and ambient soundscapes on home page", async ({
  page,
  context,
}) => {
  await signIn(context);
  await page.goto("/");
  await page.getByRole("button", { name: /Breathe 60 seconds/ }).click();
  await expect(
    page.getByRole("heading", { name: "Your 60-second reset" }),
  ).toBeVisible();

  // Test ambient sounds tab
  await page.getByRole("button", { name: /Ambient Sounds/ }).click();
  await expect(page.getByText("Gentle Rain")).toBeVisible();
  await expect(page.getByText("Ocean Waves")).toBeVisible();
  await expect(page.getByText("Zen Singing Bowl")).toBeVisible();

  // Switch back to breathing and start breathwork
  await page.getByRole("button", { name: /Guided Breathing/ }).click();
  await expect(page.getByText("Box Breathing")).toBeVisible();
  await page.getByRole("button", { name: /Begin 60s Breathwork/ }).click();
  await expect(
    page.getByRole("button", { name: /Pause & Reset/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Pause & Reset/ }).click();
  await expect(
    page.getByRole("button", { name: /Begin 60s Breathwork/ }),
  ).toBeVisible();
});

test("interactive 2-minute ergonomic desk stretch and micro-break station on home page", async ({
  page,
  context,
}) => {
  await signIn(context);
  await page.goto("/");
  await page.getByRole("button", { name: /Desk stretch 2 minutes/ }).click();
  await expect(
    page.getByRole("heading", {
      name: "Relieve Desk Stiffness & Screen Fatigue",
    }),
  ).toBeVisible();

  // Test preset switching
  await page.getByRole("button", { name: /Quick Posture \(60s\)/ }).click();
  await expect(page.getByText("STEP 1 OF 2")).toBeVisible();
  await page.getByRole("button", { name: /Screen Fatigue \(45s\)/ }).click();
  await expect(page.getByText("STEP 1 OF 2")).toBeVisible();
  await page.getByRole("button", { name: /Full 2-Min Reset/ }).click();
  await expect(page.getByText("STEP 1 OF 5")).toBeVisible();

  // Test stretch start and pause
  await page.getByRole("button", { name: "Start Stretch" }).click();
  await expect(
    page.getByRole("button", { name: "Pause Stretch" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Pause Stretch" }).click();
  await expect(
    page.getByRole("button", { name: "Resume Stretch" }),
  ).toBeVisible();

  // Test next step button
  await page.getByRole("button", { name: "Next stretch" }).click();
  await expect(page.getByText("STEP 2 OF 5")).toBeVisible();

  // Test sound toggle
  await page.getByRole("button", { name: /Sound On/ }).click();
  await expect(page.getByRole("button", { name: /Muted/ })).toBeVisible();

  // Mobile overflow verification
  await page.setViewportSize({ width: 390, height: 844 });
  await noOverflow(page);
});

test("legacy local demo state never authenticates a live session", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "wellness_mock_session",
      JSON.stringify({
        id: "11111111-1111-4111-8111-111111111111",
        email: "forged@example.test",
      }),
    ),
  );
  await page.goto("/profile");
  await expect(page).toHaveURL(/signin/);
  await expect(
    page.getByRole("heading", { name: "Welcome to your hub." }),
  ).toBeVisible();
});
test("wrong six-digit code is rejected without demo fallback", async ({
  page,
}) => {
  await page.goto("/signin");
  await page.getByLabel("Email address").fill("alex@example.test");
  await page
    .getByRole("button", { name: "Sign in with an email link" })
    .click();
  await page.getByRole("button", { name: "Email me a sign-in link" }).click();
  await page.getByLabel("Email verification code").fill("654321");
  await page.getByRole("button", { name: "Verify code and continue" }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page).toHaveURL(/signin/);
});
test("authentication failures do not create offline sessions", async ({
  page,
}) => {
  await page.route("**/auth/v1/token**", (route) =>
    route.fulfill({
      status: 400,
      contentType: "application/json",
      body: JSON.stringify({
        code: "invalid_credentials",
        msg: "Invalid login credentials",
      }),
    }),
  );
  await page.goto("/signin");
  await page.getByLabel("Email address").fill("alex@example.test");
  await page
    .getByLabel("Password", { exact: true })
    .fill("arbitrary-password123");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Invalid login credentials" }),
  ).toBeVisible();
  await expect(page).toHaveURL(/signin/);
});

test("password recovery uses the account destination", async ({ page }) => {
  await page.goto("/signin");
  await page.getByLabel("Email address").fill("alex@example.test");
  await page.getByRole("button", { name: "Forgot password?" }).click();
  const request = page.waitForRequest(
    (r) => r.url().includes("/auth/v1/recover") && r.method() === "POST",
  );
  await page.getByRole("button", { name: "Send reset link" }).click();
  expect((await request).url()).toContain(
    encodeURIComponent("/auth/callback?next=/account"),
  );
  await expect(
    page.getByRole("heading", { name: "Check your inbox." }),
  ).toBeVisible();
  await expect(page.getByLabel("Email verification code")).toHaveCount(0);
});
test("recovery reaches account settings before profile onboarding", async ({
  page,
  request,
}) => {
  await request.post("http://127.0.0.1:54330/test/missing-profile");
  await page.goto(
    "/auth/confirm?token_hash=valid-test-hash&type=recovery&next=/account",
  );
  await page.getByRole("button", { name: "Confirm and continue" }).click();
  await expect(page).toHaveURL(/\/account$/);
  await expect(
    page.getByRole("heading", { name: "Make signing in simpler." }),
  ).toBeVisible();
});

test("responsive header, accessible mobile drawer and member return shortcuts", async ({
  page,
  context,
}) => {
  await signIn(context);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await expect(
    page
      .getByRole("navigation", { name: "Main navigation", exact: true })
      .getByRole("link", { name: "Home", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await expect(
    page.getByRole("heading", { name: "Good to have you back, Smash." }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /YOUR CIRCLES Cricket/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Account menu", exact: true }).click();
  await expect(
    page.getByRole("menuitem", { name: "Provider workspace" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    await noOverflow(page);
    await page
      .getByRole("button", { name: "Open navigation", exact: true })
      .click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  }
  await page
    .getByRole("button", { name: "Open navigation", exact: true })
    .click();
  await page
    .getByRole("navigation", { name: "Expanded navigation" })
    .getByRole("link", { name: "Care", exact: true })
    .click();
  await expect(page).toHaveURL(/psychologists/);
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("returning member reaches the original protected deep link after sign in", async ({
  page,
}) => {
  await page.goto("/groups/music");
  await page
    .getByRole("button", { name: "Join this group", exact: true })
    .click();
  await expect(page).toHaveURL(/signin\?next=/);
  await page.getByLabel("Email address").fill("alex@example.test");
  await page.getByLabel("Password", { exact: true }).fill("Correct-password1");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL("http://localhost:3101/groups/music");
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Music", exact: true }),
  ).toBeVisible();
});

test("personal-email account can request care while community participation still requires approval", async ({
  page,
  context,
  request,
}) => {
  await request.post("http://127.0.0.1:54330/test/verification", {
    data: { verified: false, status: "unverified" },
  });
  await signIn(context);
  await page.goto("/psychologists");
  await page
    .getByRole("button", { name: "Request a time", exact: true })
    .click();
  await expect(page.getByLabel("Your name", { exact: true })).toBeVisible();
  await page
    .getByLabel("Preferred date and time")
    .fill(new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 16));
  await page.getByRole("checkbox", { name: /Share my name/ }).check();
  await page
    .getByRole("button", { name: "Request appointment", exact: true })
    .click();
  await expect(page.getByText("Request sent.", { exact: true })).toBeVisible();
  await page.goto("/discuss");
  await expect(
    page.getByRole("link", { name: "Verify to start a conversation" }),
  ).toBeVisible();
});

test("member bookings appear with provider names on profile and update after confirmation", async ({
  page,
  context,
  request,
}) => {
  await signIn(context);
  await page.goto("/psychologists");
  await page
    .getByRole("button", { name: "Request a time", exact: true })
    .click();
  await page.getByRole("checkbox", { name: /Share my name/ }).check();
  const date = new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 16);
  await page.getByLabel("Preferred date and time").fill(date);
  await page
    .getByRole("button", { name: "Request appointment", exact: true })
    .click();
  await expect(
    page.getByText(
      "Appointment requested. Track confirmation in your calendar.",
    ),
  ).toBeVisible();
  await page.goto("/profile?view=bookings");
  await expect(page.getByRole("link", { name: /Dr. Asha Sen/ })).toBeVisible();
  await expect(page.getByText(/Awaiting confirmation/)).toBeVisible();
  await page.goto("/provider");
  await page
    .getByRole("button", { name: "Confirm appointment", exact: true })
    .click();
  await expect(page.getByText("No pending requests.")).toBeVisible();
  await page.goto("/my-sessions");
  await expect(
    page.getByRole("heading", { name: "My appointments" }),
  ).toBeVisible();
  await expect(page.getByText(/Confirmed/, { exact: false })).toBeVisible();
  await page.getByRole("button", { name: /Notifications,/ }).click();
  await expect(
    page
      .getByRole("region", { name: "Notifications" })
      .getByText("Your appointment is confirmed."),
  ).toBeVisible();
});

test("visitors explore care but sign in before requesting an appointment", async ({
  page,
  request,
}) => {
  await page.goto("/psychologists");
  await expect(
    page.getByRole("heading", { name: "Dr. Asha Sen" }),
  ).toBeVisible();
  await expect(page.getByLabel("Preferred date and time")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Request a time", exact: true })
    .click();
  await expect(page).toHaveURL(/signin\?next=%2Fpsychologists/);
  const response = await request.post(
    "http://localhost:3101/api/guest-appointments",
    {
      data: {
        provider: 1,
        email: "guest@example.test",
        time: new Date(Date.now() + 86400000).toISOString(),
      },
    },
  );
  expect(response.status()).toBe(401);
});

test("provider applications persist as pending and failed writes never report success", async ({
  page,
  context,
}) => {
  await signIn(context);
  await page.goto("/apply-provider");
  await page.getByLabel("Full Name", { exact: true }).fill("Dr. New Provider");
  await page
    .getByLabel("About Your Practice")
    .fill(
      "A detailed practice description and qualifications for administrator review.",
    );
  await page
    .getByRole("button", { name: "Submit Application", exact: true })
    .click();
  await expect(
    page.getByText("Application submitted successfully!"),
  ).toBeVisible();
  await page.goto("/provider");
  await expect(
    page.getByRole("heading", { name: "Dr. New Provider" }),
  ).toBeVisible();
  await expect(page.getByText(/Awaiting administrator review/)).toBeVisible();
  await page.route("**/rest/v1/rpc/apply_provider", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ message: "Service unavailable" }),
    }),
  );
  await page.goto("/apply-provider");
  await page
    .getByLabel("Full Name", { exact: true })
    .fill("Dr. Failed Request");
  await page
    .getByLabel("About Your Practice")
    .fill(
      "Another detailed practice description with registration and experience.",
    );
  await page
    .getByRole("button", { name: "Submit Application", exact: true })
    .click();
  await expect(
    page.getByText("Failed to submit application. Please try again."),
  ).toBeVisible();
});

test("expired returning session renews and stays on the requested page", async ({
  page,
  context,
}) => {
  await signIn(context, true);
  await page.goto("/groups/music");
  await expect(
    page.getByRole("heading", { name: "Music", exact: true }),
  ).toBeVisible();
  await expect(page).toHaveURL("http://localhost:3101/groups/music");
  const stored = (await context.cookies()).find(
    (c) => c.name === "sb-127-auth-token",
  );
  expect(stored).toBeDefined();
  const session = JSON.parse(
    Buffer.from(
      decodeURIComponent(stored!.value).replace(/^base64-/, ""),
      "base64url",
    ).toString(),
  );
  expect(session.expires_at).toBeGreaterThan(Date.now() / 1000);
  await page.reload();
  await expect(page).toHaveURL("http://localhost:3101/groups/music");
});

test("administrator approves a provider and the listing becomes bookable", async ({
  page,
  context,
  request,
}) => {
  await signIn(context);
  await page.goto("/apply-provider");
  await page
    .getByLabel("Full Name", { exact: true })
    .fill("Dr. Reviewed Provider");
  await page
    .getByLabel("About Your Practice")
    .fill(
      "Registration, qualifications and practice details for the community administrator.",
    );
  await page
    .getByRole("button", { name: "Submit Application", exact: true })
    .click();
  await expect(
    page.getByText("Application submitted successfully!"),
  ).toBeVisible();
  await page.goto("/psychologists");
  await expect(
    page.getByRole("heading", { name: "Dr. Reviewed Provider" }),
  ).toHaveCount(0);
  await request.post("http://127.0.0.1:54330/test/admin", {
    data: { enabled: true },
  });
  await page.goto("/dashboard");
  await page.getByRole("tab", { name: "Provider Review", exact: true }).click();
  await page
    .getByRole("button", {
      name: "Approve provider Dr. Reviewed Provider",
      exact: true,
    })
    .click();
  await expect(
    page.getByText("Provider approved!", { exact: true }),
  ).toBeVisible();
  await page.goto("/psychologists");
  await expect(
    page.getByRole("heading", { name: "Dr. Reviewed Provider" }),
  ).toBeVisible();
});

test("first visit opens the home page; sign-in is offered in the header", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page).toHaveURL("http://localhost:3101/");
  await expect(
    page.getByRole("heading", { name: /Your people.*Your pause/ }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("banner")
      .getByRole("link", { name: "Sign in", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Welcome to your hub." }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: /Good to have you back/ }),
  ).toHaveCount(0);
  await expect(
    page.getByText("Loading your groups…", { exact: true }),
  ).toHaveCount(0);
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await noOverflow(page);
    await expect(
      page
        .getByRole("banner")
        .getByRole("link", { name: "Sign in", exact: true }),
    ).toBeVisible();
  }
});

test("visitors browse groups without seeing conversations and sign in only when joining", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("link", { name: "Find your people", exact: true })
    .click();
  await expect(page).toHaveURL("http://localhost:3101/groups");
  await page.getByRole("link", { name: /Music.*Explore group/ }).click();
  await expect(
    page.getByRole("heading", { name: "Music", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Anyone up for a lunchtime walk this week?", {
      exact: true,
    }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Join this group", exact: true })
    .click();
  await expect(page).toHaveURL(/signin\?next=%2Fgroups%2Fmusic/);
  await expect(
    page.getByRole("heading", { name: "Welcome to your hub." }),
  ).toBeVisible();
});

test("anonymous conversations are public and typing prompts sign-in", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Main navigation", exact: true })
    .getByRole("link", { name: "Chat", exact: true })
    .click();
  await expect(page).toHaveURL("http://localhost:3101/discuss");
  await expect(page.getByText(/Some days, a ten-minute walk/)).toBeVisible();
  await expect(
    page.getByText("Anyone up for a lunchtime walk this week?", {
      exact: true,
    }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: /What’s on your mind/ }).click();
  await expect(page).toHaveURL(/signin\?next=%2Fdiscuss/);
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Your people.*Your pause/ }),
  ).toBeVisible();
  await expect(page).toHaveURL("http://localhost:3101/");
});

test("visitors can see People but Connect requires sign-in", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/people");
  await expect(
    page.getByRole("heading", { name: "Maya", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Loading connections…")).toHaveCount(0);
  await noOverflow(page);
  await page.getByRole("button", { name: "Connect", exact: true }).click();
  await expect(page).toHaveURL(/signin\?next=%2Fpeople/);
});
test("visitors can browse activity details but join and create require sign-in", async ({
  page,
}) => {
  await page.goto("/book-activities");
  await expect(
    page.getByRole("heading", {
      name: "A little lunchtime reset",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Sign in to join", exact: true })
    .click();
  await expect(page).toHaveURL(/signin\?next=%2Fbook-activities/);
  await page.goto("/sessions/1");
  await expect(
    page.getByRole("heading", {
      name: "A little lunchtime reset",
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Sign in/i }).click();
  await expect(page).toHaveURL(/signin\?next=%2Fsessions%2F1/);
  await page.goto("/book-activities");
  await page
    .getByRole("button", { name: "Create Activity", exact: true })
    .first()
    .click();
  await expect(page).toHaveURL(/signin\?next=%2Fbook-activities/);
});
test("visitor navigation and care directory fit a small mobile screen", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Open navigation", exact: true })
    .click();
  const nav = page.getByRole("navigation", { name: "Expanded navigation" });
  await expect(nav.getByRole("link")).toHaveCount(6);
  await noOverflow(page);
  await nav.getByRole("link", { name: "Care", exact: true }).click();
  await expect(page).toHaveURL(/psychologists/);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await noOverflow(page);
  await page
    .getByRole("searchbox", { name: "Search care professionals" })
    .fill("nobody");
  await expect(
    page.getByRole("heading", { name: "No matches just yet." }),
  ).toBeVisible();
});

test("regional map keeps each estimate with its scope and source date", async ({
  page,
}) => {
  await page.goto("/#wellbeing-near-us");
  const section = page.getByRole("region", { name: /Behind every number/ });
  await expect(section.getByText("150", { exact: true })).toBeVisible();
  await expect(
    section.getByText("NMHS · 2015–16", { exact: true }),
  ).toBeVisible();
  await expect(section.getByText("10.6%", { exact: true })).toBeVisible();
  await expect(
    section.getByRole("link", { name: /Government of India/ }),
  ).toHaveAttribute("href", /pib\.gov\.in/);
  await section
    .getByRole("button", { name: "WHO South-East Asia", exact: true })
    .click();
  await expect(section.getByText("289", { exact: true })).toBeVisible();
  await expect(
    section.getByText("WHO statement · 24 Jul 2025", { exact: true }),
  ).toBeVisible();
  await expect(section.getByText("10.6%", { exact: true })).toHaveCount(0);
  await expect(
    section.getByRole("link", { name: /WHO · July 2025 announcement/ }),
  ).toHaveAttribute("href", /who\.int/);
  await expect(
    section.getByText(/two totals should not be directly compared or added/),
  ).toBeVisible();
  await page.setViewportSize({ width: 320, height: 740 });
  await noOverflow(page);
  await section.getByRole("button", { name: "India", exact: true }).click();
  await expect(section.getByText("150", { exact: true })).toBeVisible();
  await expect(section.getByText("12 states", { exact: true })).toBeVisible();
  await noOverflow(page);
});

test("animated interests keep mobile navigation and reduced-motion preferences", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#find-your-interest");
  const section = page.getByRole("region", {
    name: "What’s your kind of good?",
    exact: true,
  });
  const sports = section.getByRole("link", { name: /^Sports Football/ });
  await expect(section.getByRole("link")).toHaveCount(7);
  await sports.scrollIntoViewIfNeeded();
  await sports.hover();
  await expect(sports).toHaveCSS("transform", "none");
  await noOverflow(page);
  await page.setViewportSize({ width: 320, height: 740 });
  await noOverflow(page);
  await sports.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/groups\?category=sports/);
  await expect(
    page.getByRole("heading", { name: "Sports subgroups" }),
  ).toBeVisible();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/#find-your-interest");
  await sports.scrollIntoViewIfNeeded();
  await sports.hover();
  await expect
    .poll(() => sports.evaluate((e) => getComputedStyle(e).transform))
    .not.toBe("none");
  await noOverflow(page);
});

test("admin panel counts registrations and distinct participants across pages", async ({
  page,
  context,
  request,
}) => {
  await signIn(context);
  await request.post("http://127.0.0.1:54330/test/admin", {
    data: { enabled: true },
  });
  await page.goto("/admin");
  await expect(
    page.getByRole("heading", { name: "Admin panel", exact: true }),
  ).toBeVisible();
  const metric = (name: string) =>
    page
      .locator(".admin-metric")
      .filter({ hasText: name })
      .locator(":scope > strong");
  await expect(metric("Registered accounts")).toHaveText("24");
  await expect(metric("New registrations")).toHaveText("3");
  await expect(metric("Active participants")).toHaveText("2");
  await expect(metric("Scheduled activities")).toHaveText("1");
  await expect(
    page.getByText("24 registered accounts", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("cell", { name: "Member 01", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByText("Page 2 of 2")).toBeVisible();
  await expect(
    page.getByRole("cell", { name: "Member 24", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Search members by display name").fill("Member 03");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page.getByText("1 matching accounts")).toBeVisible();
  await expect(
    page.getByRole("cell", { name: "Member 03", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Member verification" }).click();
  await expect(
    page.getByRole("heading", { name: "Community operations", exact: true }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Overview", exact: true }).click();
  await expect(metric("Registered accounts")).toHaveText("24");
  await page.setViewportSize({ width: 390, height: 844 });
  await noOverflow(page);
  await page.setViewportSize({ width: 320, height: 740 });
  await noOverflow(page);
});

test("members have no dashboard link and cannot load admin data", async ({
  page,
  context,
}) => {
  await signIn(context);
  const adminRequests: string[] = [];
  page.on("request", (req) => {
    if (
      req.url().includes("/rest/v1/") &&
      (req.method() === "HEAD" ||
        req.url().includes("select=id%2Cname%2Ccreated_at"))
    )
      adminRequests.push(req.url());
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Account menu", exact: true }).click();
  await expect(
    page.getByRole("link", { name: /Dashboard|Admin panel/ }),
  ).toHaveCount(0);
  await page.keyboard.press("Escape");
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/admin$/);
  await expect(
    page.getByRole("heading", { name: "Administrator access required" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Platform overview" }),
  ).toHaveCount(0);
  expect(adminRequests).toEqual([]);
});

test("admin count errors do not appear as zero registrations", async ({
  page,
  context,
  request,
}) => {
  await signIn(context);
  await request.post("http://127.0.0.1:54330/test/admin", {
    data: { enabled: true },
  });
  await page.route("**/rest/v1/profiles?**", async (route) => {
    if (route.request().method() === "HEAD")
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ message: "Counts unavailable" }),
      });
    else await route.continue();
  });
  await page.goto("/admin");
  await expect(page.locator(".admin-error")).toContainText(
    "Couldn’t refresh platform counts.",
    { timeout: 20000 },
  );
  await expect(
    page
      .locator(".admin-metric")
      .filter({ hasText: "Registered accounts" })
      .locator(":scope > strong"),
  ).toHaveText("—");
  await page.unroute("**/rest/v1/profiles?**");
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(
    page
      .locator(".admin-metric")
      .filter({ hasText: "Registered accounts" })
      .locator(":scope > strong"),
  ).toHaveText("24");
});
