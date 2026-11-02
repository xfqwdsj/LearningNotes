import { defineConfig, devices } from "@playwright/test";

const port = process.env["TEST_DEPLOYMENT_PORT"] ?? "4190";
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "tests/deployment",
  use: { baseURL, ...devices["Desktop Chrome"] },
  webServer: {
    command: `tsx scripts/preview.ts --port ${port}`,
    port: Number(port),
    reuseExistingServer: false,
    timeout: 30_000,
  },
  projects: [{ name: "chromium" }],
});
