import { test, expect } from "@playwright/test";

test("reading surfaces and small text use the shared theme scale", async ({
  page,
}) => {
  await page.goto("/knowledge/maths/limits/fixture-continuity/");
  const surfaces = await page
    .locator(".interactive-demo")
    .evaluateAll((elements) =>
      elements.map((element) => getComputedStyle(element).borderRadius),
    );
  expect(surfaces).toHaveLength(1);
  expect(new Set(surfaces).size).toBe(1);
  for (const selector of [
    ".article-meta",
    ".reading-sidebar nav a",
    ".reading-toc nav a",
    ".demo-intro",
    ".demo-controls label",
  ]) {
    const size = await page
      .locator(selector)
      .first()
      .evaluate((element) => parseFloat(getComputedStyle(element).fontSize));
    expect(size, selector).toBeGreaterThanOrEqual(13);
  }
  await page.goto(
    "/knowledge/cs/data-representation/fixture-number-base-conversion/",
  );
  const codeSize = await page
    .locator(".expressive-code pre code")
    .first()
    .evaluate((element) => parseFloat(getComputedStyle(element).fontSize));
  expect(codeSize).toBeGreaterThanOrEqual(14);
});

test("private header and home remain readable on narrow and intermediate screens", async ({
  page,
}) => {
  await page.goto("/private/");
  for (const width of [320, 390, 768, 1024]) {
    await page.setViewportSize({ width, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
      `viewport ${width}`,
    ).toBe(true);
    await expect(
      page.getByRole("button", { name: "切换主题" }),
    ).toBeInViewport();
    await expect(
      page.getByRole("button", { name: /搜索知识/ }),
    ).toBeInViewport();
    await expect(page.locator(".private-label")).toBeInViewport();
  }
});
