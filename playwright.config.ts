import { defineConfig, devices } from "@playwright/test";
const port = process.env["TEST_BROWSER_PORT"] ?? "4180";
const baseURL = `http://127.0.0.1:${port}`;
export default defineConfig({
  testDir: "tests/browser",
  use: { baseURL, ...devices["Desktop Chrome"] },
  webServer: {
    command: `tsx scripts/test-browser-server.ts --port ${port}`,
    port: Number(port),
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    { name: "chromium" },
    {
      name: "pixel7",
      testMatch:
        /(?:scroll-stability|reading-interactions|questions|knowledge-structure)\.spec\.ts$/,
      use: { ...devices["Pixel 7"], defaultBrowserType: "chromium" },
    },
    {
      name: "mobile",
      use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" },
    },
  ],
});
