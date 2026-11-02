import { test, expect } from "@playwright/test";
import { getDocumentNavigation } from "@/lib/content/navigation";
import { readFixtureCatalog } from "../fixtures/generated";

test("home exploration link opens the complete interactive catalog", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".hero-scroll-cue")).toHaveCount(0);
  await page.locator('.hero-copy a[href="/demos/"]').click();
  await expect(page).toHaveURL(/\/demos\/$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "交互演示" }),
  ).toBeVisible();
});

test("last article keeps previous navigation aligned to the left", async ({
  page,
}) => {
  const catalog = readFixtureCatalog("browser", "public");
  const last = catalog.documents.find((doc) => {
    const siblings = getDocumentNavigation(doc, catalog).siblings;
    return siblings.length > 1 && siblings.at(-1)?.key === doc.key;
  });
  expect(last).toBeTruthy();
  await page.goto(last!.href);
  await expect(page.locator(".pagination-next")).toHaveCount(0);
  await expect(page.locator(".pagination-previous")).toHaveCSS(
    "text-align",
    "left",
  );
  await expect(page.locator(".pagination-previous")).toHaveCSS(
    "grid-column-start",
    "1",
  );
});

test("Markdown pagination titles keep inline formula layout", async ({
  page,
}) => {
  await page.goto("/knowledge/maths/statistics/f-distribution/");
  const next = page.locator(".pagination-next");
  const label = next.locator(".pagination-label");
  const title = next.locator(":scope > span").nth(1);
  const formula = title.locator(".katex");
  await expect(label).toHaveText("下一篇");
  await expect(title).toBeVisible();
  await expect(formula).toBeVisible();
  await expect(formula).toHaveCSS("display", "inline");
  await expect(formula).toHaveCSS("margin-bottom", "0px");
  await expect(title).toHaveCSS("display", "block");
  const colors = await Promise.all(
    [next, label, title, formula].map((locator) =>
      locator.evaluate((element) => getComputedStyle(element).color),
    ),
  );
  expect(colors[2]).toBe(colors[0]);
  expect(colors[3]).toBe(colors[2]);
  expect(colors[1]).not.toBe(colors[2]);
});

test("static 404 exposes a disabled fallback when the counterpart is unresolved", async ({
  page,
}) => {
  await page.route("**/private/missing-learning-page/", (route) =>
    route.request().method() === "HEAD"
      ? route.fulfill({ status: 403, body: "locked" })
      : route.fallback(),
  );
  await page.goto("/missing-learning-page/");
  const fallback = page
    .locator(".not-found-page")
    .getByRole("button", { name: "尝试在私有站查找" });
  await expect(fallback).toBeDisabled();
  await expect(page.locator("main a[data-other-site]")).toHaveCount(0);
});

test("static 404 does not expose an unresolved cross-site anchor", async ({
  page,
}) => {
  await page.goto("/missing-static-page/");
  await expect(
    page
      .locator(".not-found-page")
      .getByRole("button", { name: "尝试在私有站查找" }),
  ).toBeDisabled();
  await expect(page.locator("main a[data-other-site]")).toHaveCount(0);
});

test("empty public tasks find accessible private tasks", async ({ page }) => {
  await page.goto("/tasks/");
  await expect(page.locator("main [data-other-site]")).toHaveText(
    /在私有站继续阅读/,
    { timeout: 15_000 },
  );
  await expect(page.locator("main [data-other-site]")).toHaveAttribute(
    "href",
    "/private/tasks/",
  );
});

test("private search also finds public knowledge", async ({ page }) => {
  await page.goto("/private/");
  await page.getByRole("button", { name: /搜索知识/ }).click();
  await page.getByPlaceholder("搜索知识点，或输入任务ID…").fill("夹具检索词");
  await expect(
    page
      .getByRole("dialog")
      .locator('a[href="/knowledge/maths/limits/continuity/"]'),
  ).toBeVisible();
});

test("summary images zoom continuously, close on scroll and restore focus", async ({
  page,
}) => {
  await page.route("https://fixture.invalid/**", (route) =>
    route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1600"><rect width="1200" height="1600" fill="#ddd"/></svg>',
    }),
  );
  await page.goto("/private/tasks/maths/higher-mathematics/assignment/");
  const row = page.locator(".document-row").filter({
    has: page.getByRole("link", {
      name: "任务摘要示例",
      exact: true,
    }),
  });
  await row.getByRole("button", { name: "展开摘要" }).click();
  await expect(row.locator(".summary-preview-viewport")).toHaveAttribute(
    "data-folded",
    "false",
  );
  const image = row.locator('[data-rmiz-content="found"] img').first();
  const zoomButton = row.locator("[data-rmiz-btn-zoom]").first();
  const openDialog = page.locator("dialog[data-rmiz-modal][open]");
  await expect(image).toBeVisible();
  await expect(image).toHaveJSProperty("complete", true);
  await expect(zoomButton).toHaveCount(1);
  await image.scrollIntoViewIfNeeded({ timeout: 5_000 });
  await image.click({ position: { x: 24, y: 24 }, timeout: 5_000 });
  await expect(openDialog).toBeVisible();
  const zoomedImage = openDialog.locator("[data-rmiz-modal-img]");
  await expect(zoomedImage).toBeVisible();
  await expect(zoomedImage).toHaveCSS("transition-property", /transform/);
  await page.waitForTimeout(350);
  await page.mouse.wheel(0, 150);
  await expect(openDialog).toHaveCount(0);
  await expect(zoomButton).toBeFocused();
});

test("inner pages share one navigation position across layouts and zones", async ({
  page,
}) => {
  let origin: { x: number; y: number } | undefined;
  for (const path of [
    "/courses/",
    "/courses/maths/higher-mathematics/",
    "/courses/maths/higher-mathematics/11.1/",
    "/knowledge/maths/limits/continuity/",
    "/private/tasks/",
    "/missing-nav-page/",
  ]) {
    await page.goto(path);
    const navigation = page.locator(".page-navigation");
    await expect(navigation).toHaveCount(1);
    await expect(page.getByRole("navigation", { name: "面包屑" })).toHaveCount(
      1,
    );
    await expect(
      page.locator(".reading-main .breadcrumbs, .collection-back"),
    ).toHaveCount(0);
    const rect = await navigation
      .locator(".page-navigation-inner")
      .boundingBox();
    expect(rect).not.toBeNull();
    if (!origin) origin = rect!;
    expect(Math.abs(rect!.x - origin.x)).toBeLessThanOrEqual(16);
    const position = await navigation.boundingBox();
    const header = await page.locator(".site-header").boundingBox();
    expect(position!.y).toBeCloseTo(header!.y + header!.height, 0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});

test("included content omits its heading and keeps the article text alignment", async ({
  page,
}) => {
  await page.goto("/articles/connected-learning/");
  const block = page.locator(".reading-main .content-inclusion");
  await expect(block).toHaveCount(1);
  await expect(
    block.getByRole("heading", { name: "定义", exact: true }),
  ).toHaveCount(0);
  await expect(
    block.getByRole("heading", { name: "区间上的连续性", exact: true }),
  ).toBeVisible();
  await expect(
    block.locator('a[href="/knowledge/maths/limits/continuity/#definition"]'),
  ).toBeVisible();
  const main = await page.locator(".reading-main").boundingBox();
  const paragraph = await block.locator(".prose p").first().boundingBox();
  expect(paragraph!.x).toBeCloseTo(main!.x, 0);
  expect(paragraph!.width).toBeCloseTo(main!.width, 0);
  const decoration = await block.evaluate((element) => {
    const css = getComputedStyle(element, "::before");
    return {
      background: css.backgroundColor,
      border: css.borderStyle,
      borderColor: css.borderColor,
      radius: css.borderRadius,
      events: css.pointerEvents,
    };
  });
  expect(decoration.background).toBe("rgba(0, 0, 0, 0)");
  expect(decoration.border).toBe("dashed");
  expect(decoration.borderColor).not.toBe("rgba(0, 0, 0, 0)");
  expect(decoration.radius).not.toBe("0px");
  expect(decoration.events).toBe("none");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
