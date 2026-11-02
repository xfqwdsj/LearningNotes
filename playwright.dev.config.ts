import { defineConfig, devices } from "@playwright/test";
const port = process.env["DEV_TEST_PORT"] ?? "4300";
const baseURL = `http://127.0.0.1:${port}`;
export default defineConfig({
  testDir: "tests/dev",
  timeout: 90_000,
  use: { baseURL, ...devices["Desktop Chrome"], navigationTimeout: 90_000 },
  webServer: {
    command: `tsx scripts/test-dev.ts --hostname 127.0.0.1 --port ${port}`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
    gracefulShutdown: { signal: "SIGTERM", timeout: 10_000 },
  },
});
