import { defineConfig, devices } from "@playwright/test";

/**
 * E2E runs against the production build (`next build && next start`) so it mirrors
 * prod — no dev overlays, real bundling. The chat API is always mocked in tests
 * (see e2e/mock-chat.ts); we never call the real LLM (flaky + rate-limited). See
 * docs/adr/adr-006-a11y-and-e2e.md.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["html", { open: "never" }], ["list"]] : "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm build && pnpm start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
