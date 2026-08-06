import { loadEnvConfig } from "@next/env";
import { defineConfig, devices } from "@playwright/test";

loadEnvConfig(process.cwd());

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";

export default defineConfig({
  expect: { timeout: 10_000 },
  forbidOnly: Boolean(process.env.CI),
  fullyParallel: true,
  outputDir: "test-results",
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  reporter: process.env.CI ? "github" : "list",
  retries: process.env.CI ? 2 : 0,
  testDir: "./tests/e2e",
  use: {
    baseURL,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: "npm run dev -- --hostname 127.0.0.1",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        url: baseURL,
      },
});
