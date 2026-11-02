import { test, expect } from "@playwright/test";

test("private directory entrances keep their base even when a category is empty", async ({
  page,
}) => {
  await page.goto("/private/");
  await expect(page.locator(".home-content-link .entry-primary")).toHaveCount(
    4,
  );
  expect(
    await page
      .locator(".home-content-link .entry-primary")
      .evaluateAll((links) => links.map((link) => link.getAttribute("href"))),
  ).toEqual([
    "/private/courses/",
    "/private/knowledge/",
    "/private/tasks/",
    "/private/articles/",
  ]);
  for (const link of await page
    .locator(".home-subject-list .entry-primary")
    .all()) {
    await expect(link).toHaveAttribute("href", /^\/private\/subjects\//);
  }
  await page.locator('.home-content-link a[href="/private/tasks/"]').click();
  await expect(page).toHaveURL(/\/private\/tasks\/$/);
  await page
    .locator('.collection-card a[href="/private/tasks/maths/"]')
    .click({ position: { x: 10, y: 10 } });
  await expect(page).toHaveURL(/\/private\/tasks\/maths\/$/);
  await page
    .locator(
      '.collection-card a[href="/private/tasks/maths/higher-mathematics/"]',
    )
    .click({ position: { x: 10, y: 10 } });
  await expect(page).toHaveURL(
    /\/private\/tasks\/maths\/higher-mathematics\/$/,
  );
});

test("empty private knowledge keeps the public counterpart while its availability is pending", async ({
  page,
}) => {
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/knowledge/", async (route) => {
    if (
      route.request().method() !== "HEAD" ||
      new URL(route.request().url()).pathname !== "/knowledge/"
    )
      return route.fallback();
    await pending;
    await route.fulfill({ status: 200, contentType: "text/html", body: "" });
  });
  try {
    const response = await page.goto("/private/knowledge/");
    expect(response?.status()).toBe(200);
    await expect(page.locator('.breadcrumbs [aria-current="page"]')).toHaveText(
      "知识点",
    );
    const link = page.locator("main [data-other-site]");
    await expect(link).toHaveAttribute("href", "/knowledge/");
    await expect(link).toContainText("尝试");
    release();
    await expect(link).toContainText("在公开站继续阅读");
    await expect(link).toHaveAttribute("href", "/knowledge/");
  } finally {
    release();
  }
});

test("all entry families share title styling, arrows and a full card hit area", async ({
  page,
}) => {
  const styles: unknown[] = [];
  for (const [path, selector] of [
    ["/", ".home-content-link"],
    ["/", ".subject-card"],
    ["/courses/", ".collection-card"],
    ["/courses/maths/higher-mathematics/", ".document-row"],
    ["/", ".search-result"],
  ]) {
    await page.goto(path!);
    if (selector === ".search-result") {
      await page.getByRole("button", { name: /搜索知识/ }).click();
      await page
        .getByPlaceholder("搜索知识点，或输入任务ID…")
        .fill("夹具检索词");
    }
    const card = page.locator(selector!).first();
    await expect(card).toBeVisible();
    await card.evaluate((element) =>
      element.scrollIntoView({ behavior: "instant", block: "center" }),
    );
    await expect(card.locator(".entry-primary .row-arrow")).toBeVisible();
    styles.push(
      await card
        .locator(".entry-primary .entry-link-label")
        .evaluate((element) => {
          const style = getComputedStyle(element);
          return [style.fontSize, style.fontWeight, style.color];
        }),
    );
    const expected = await card.locator(".entry-primary").getAttribute("href");
    expect(
      await card.evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        return document
          .elementFromPoint(bounds.right - 8, bounds.top + 8)
          ?.closest("a")
          ?.getAttribute("href");
      }),
    ).toBe(expected);
    await card.click({ position: { x: 8, y: 8 } });
    await expect
      .poll(() => new URL(page.url()).pathname.replace(/\/$/, ""))
      .toBe(expected?.replace(/\/$/, ""));
  }
  for (const style of styles) expect(style).toEqual(styles[0]);
});

test("merged public recommendations in a private homepage show their source", async ({
  page,
}) => {
  await page.goto("/private/");
  const publicRow = page
    .locator(".document-row")
    .filter({ has: page.locator('a.entry-primary[href^="/knowledge/"]') })
    .first();
  await expect(publicRow).toContainText("公开站");
  await expect(publicRow.locator(".entry-primary")).not.toHaveAttribute(
    "href",
    /^\/private\//,
  );
});
