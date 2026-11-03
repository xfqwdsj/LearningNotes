import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("https://fixture.invalid/**", (route) =>
    route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800"/>',
    }),
  );
});

test("one dev origin serves both zones and private assets", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: "私有内容", exact: true }).click();
  await expect(page).toHaveURL(/\/private\/$/);
  await expect(page.locator(".private-label")).toHaveText("私有");
  await page.goto(
    "/private/tasks/maths/higher-mathematics/exercise/fixture-image/",
  );
  await expect(page.locator("h1")).toHaveText("夹具图片练习");
  const markdown = await page.request.get(
    "/private/tasks/maths/higher-mathematics/exercise/fixture-image.md",
  );
  expect(markdown.ok()).toBe(true);
  expect(await markdown.text()).not.toContain("<!DOCTYPE html>");
  for (const asset of [
    "/private/search.json",
    "/private/index/root.json",
    "/private/llms.txt",
  ]) {
    expect((await page.request.get(asset)).ok()).toBe(true);
  }
  await page
    .locator(".article-header")
    .getByRole("button", { name: "讨论", exact: true })
    .click();
  await expect(
    page.getByRole("menuitemradio", { name: "原文", exact: true }),
  ).toHaveAttribute("aria-checked", "true");
  for (const product of [
    "ChatGPT",
    "Claude",
    "Grok",
    "Codex",
    "Claude Code",
    "Cursor",
  ]) {
    await expect(
      page.getByRole("menuitem", { name: `在${product}中讨论`, exact: true }),
    ).toBeVisible();
  }
  await expect(page.getByRole("menu")).not.toContainText("预填");
});

test("private search uses its own catalog", async ({ page }) => {
  await page.goto("/private/tasks/");
  await page.getByRole("button", { name: /搜索知识/ }).click();
  await page.getByPlaceholder("搜索知识点，或输入任务ID…").fill("夹具图片练习");
  const result = page
    .getByRole("dialog")
    .getByRole("link", { name: /夹具图片练习/ })
    .first();
  await expect(result).toContainText("夹具图片练习");
  await expect(result.locator("xpath=ancestor::article")).toContainText("练习");
});

test("machine hostname supports private hydration and HMR through the gateway", async ({
  baseURL,
}) => {
  const { hostname } = await import("node:os");
  const { chromium } = await import("@playwright/test");
  const host = hostname().toLowerCase();
  const browser = await chromium.launch({
    args: [`--host-resolver-rules=MAP ${host} 127.0.0.1`],
  });
  try {
    const page = await browser.newPage();
    let connected = false;
    page.on("websocket", (socket) =>
      socket.on("framereceived", (frame) => {
        if (String(frame.payload).includes('"type":"turbopack-connected"'))
          connected = true;
      }),
    );
    await page.goto(`http://${host}:${new URL(baseURL!).port}/private/tasks/`);
    await page.getByRole("button", { name: /搜索知识/ }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect.poll(() => connected).toBe(true);
  } finally {
    await browser.close();
  }
});

for (const zone of ["", "/private"]) {
  test(`search scope includes the private catalog on ${zone || "public"} dev pages`, async ({
    page,
  }) => {
    await page.goto(`${zone}/`);
    await page.getByRole("button", { name: /搜索知识/ }).click();
    await expect(
      page.getByText("已包含可访问的私有内容", { exact: true }),
    ).toBeVisible();
    const response = await page.request.get("/private/search.json");
    const index = (await response.json()) as {
      href: string;
      private: boolean;
    }[];
    expect(index.length).toBeGreaterThan(0);
    expect(
      index.every(
        (entry) => entry.private && entry.href.startsWith("/private/"),
      ),
    ).toBe(true);
  });
}
