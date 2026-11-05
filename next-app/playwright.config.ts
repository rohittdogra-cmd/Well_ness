import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testMatch: "ui.spec.ts",
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  use: {
    baseURL: "http://localhost:3101",
    browserName: "chromium",
    headless: true,
    screenshot: "only-on-failure",
  },
  webServer: [
    {
      command: "node tests/fixture-server.mjs",
      env: { FIXTURE_PORT: "54330" },
      url: "http://127.0.0.1:54330",
      reuseExistingServer: false,
    },
    {
      command: "npm run dev -- --port 3101",
      url: "http://localhost:3101/signin",
      reuseExistingServer: false,
      timeout: 120000,
      env: {
        NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54330",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "ui-test-publishable-key",
        NEXT_DIST_DIR: ".next-ui-test",
        NEXT_PUBLIC_LOCAL_ACCESS: "false",
        NEXT_PUBLIC_SKIP_AUTH: "false",
        GUEST_BOOKING_SERVER_KEY: "local-fixture-only",
      },
    },
  ],
});
