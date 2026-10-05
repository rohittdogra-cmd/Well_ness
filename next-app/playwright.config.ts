import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testMatch: "ui.spec.ts",
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  // `next dev` compiles a route the first time it is requested, so the first
  // full run after adding a page can exceed the default assertion timeout.
  expect: { timeout: 10_000 },
  use: {
    baseURL: "http://localhost:3101",
    browserName: "chromium",
    headless: true,
    screenshot: "only-on-failure",
  },
  webServer: [
    {
      command: "node tests/fixture-server.mjs",
      url: "http://127.0.0.1:54329",
      reuseExistingServer: false,
    },
    {
      command: "npm run dev -- --port 3101",
      url: "http://localhost:3101/signin",
      reuseExistingServer: false,
      timeout: 120000,
      env: {
        NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54329",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "ui-test-publishable-key",
        // Canonical URLs, the sitemap and robots.txt must resolve to the origin
        // the test is actually driving, otherwise the SEO assertions are
        // meaningless.
        NEXT_PUBLIC_SITE_URL: "http://localhost:3101",
        NEXT_DIST_DIR: ".next-ui-test",
      },
    },
  ],
});
