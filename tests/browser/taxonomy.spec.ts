import { test, expect } from "@playwright/test";

test("dedicated subject and course entries lead to real article collections", async ({
  page,
}) => {
  await page.goto("/subjects/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("学科");
  const subject = page.locator('.collection-grid a[href="/subjects/maths/"]');
  await expect(
    page.locator(
      '.collection-card:has(a[href="/subjects/maths/"]) .taxonomy-icon svg',
    ),
  ).toBeVisible();
  await subject.click();
  await page
    .locator('.collection-grid a[href="/subjects/maths/higher-mathematics/"]')
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("高等数学");
  await expect(page.locator(".taxonomy-intro")).toContainText(
    "固定分类简介。 示例课程介绍。",
  );
  await expect(
    page.locator('link[rel="alternate"][type="text/markdown"]'),
  ).toHaveAttribute("href", /\/subjects\/maths\/higher-mathematics\.md$/);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > innerWidth + 1,
  );
  expect(overflow).toBe(false);
  await page
    .locator('.collection-grid a[href="/courses/maths/higher-mathematics/"]')
    .click();
  await page.locator(".document-list a.document-title-link").first().click();
  await expect(
    page.locator('.breadcrumbs a[href="/courses/maths/higher-mathematics/"]'),
  ).toBeVisible();
  await expect(
    page.locator('.breadcrumbs a[href="/subjects/maths/higher-mathematics/"]'),
  ).toHaveCount(0);
});

test("classification discovery and private courses stay scoped", async ({
  page,
  request,
}) => {
  const publicIndex = await (await request.get("/taxonomy.json")).json();
  const privateIndex = await (
    await request.get("/private/taxonomy.json")
  ).json();
  expect(
    publicIndex.terms.some(
      (term: { subject: string }) => term.subject === "english",
    ),
  ).toBe(true);
  expect(
    privateIndex.terms.some(
      (term: { subject: string; id: string }) =>
        term.subject === "english" && term.id === "university-english",
    ),
  ).toBe(true);
  const markdown = await request.get("/subjects/maths/higher-mathematics.md");
  expect(markdown.ok()).toBe(true);
  expect(await markdown.text()).toContain("固定分类简介。 示例课程介绍。");
  await page.goto("/private/subjects/english/university-english/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("大学英语");
  await expect(
    page.locator(
      '.collection-grid a[href="/private/tasks/english/university-english/"]',
    ),
  ).toBeVisible();
  await page.getByRole("button", { name: /搜索知识/ }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("textbox").fill("夹具分类检索");
  await expect(dialog).toContainText("数学 / 线性代数 / 作业");
});

test("content and subject browsing stay parallel without hiding direct navigation", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".desktop-nav a")).toHaveCount(5);
  expect(
    await page
      .locator(".desktop-nav a")
      .evaluateAll((links) => links.map((link) => link.getAttribute("href"))),
  ).toEqual(["/courses/", "/knowledge/", "/tasks/", "/articles/", "/demos/"]);
  const browse = page.locator("#browse");
  await expect(browse.locator(":scope > section")).toHaveCount(2);
  await expect(
    browse.getByRole("heading", { name: "按内容浏览", exact: true }),
  ).toHaveCount(1);
  await expect(
    browse.getByRole("heading", { name: "按学科浏览", exact: true }),
  ).toHaveCount(1);
  await expect(browse.locator(".home-content-link")).toHaveCount(4);
  await page.goto("/subjects/maths/");
  const contentGroup = page.locator(".collection-group").filter({
    has: page.getByRole("heading", { name: "内容入口", exact: true }),
  });
  const notes = contentGroup.locator('a[href="/courses/maths/"]');
  await expect(notes).toHaveAccessibleName("进入课程资料");
  await notes.click();
  await expect(
    page.locator('.desktop-nav a[aria-current="page"]'),
  ).toHaveAttribute("href", "/courses/");
  await expect(page.locator(".page-parent-link")).toHaveAttribute(
    "href",
    "/courses/",
  );
  await expect(page.locator('.breadcrumbs a[href="/subjects/"]')).toHaveCount(
    0,
  );
  await page
    .getByRole("navigation", { name: "其他浏览方式" })
    .getByRole("link", { name: "数学 · 学科总览" })
    .click();
  await expect(page).toHaveURL(/\/subjects\/maths\/$/);
});
test("callouts and quotations share reading geometry without generated quotation marks", async ({
  page,
}) => {
  await page.goto(
    "/knowledge/maths/multiple-integrals/fixture-double-integral-computation/",
  );
  await page
    .locator(".prose")
    .first()
    .evaluate((prose) => {
      const quote = document.createElement("blockquote");
      quote.innerHTML = "<p>引用排版示例。</p>";
      prose.append(quote);
    });
  const geometry = await page
    .locator(".prose blockquote, .mdx-alert")
    .evaluateAll((nodes) =>
      nodes.map((node) => {
        const style = getComputedStyle(node);
        return {
          font: style.fontSize,
          line: style.lineHeight,
          inset: style.paddingInlineStart,
          border: style.borderInlineStartWidth,
        };
      }),
    );
  expect(geometry.length).toBeGreaterThan(1);
  expect(new Set(geometry.map((value) => JSON.stringify(value))).size).toBe(1);
  const pseudo = await page
    .locator(".prose blockquote p")
    .evaluateAll((nodes) =>
      nodes.flatMap((node) => [
        getComputedStyle(node, "::before").content,
        getComputedStyle(node, "::after").content,
      ]),
    );
  expect(pseudo.length).toBeGreaterThan(0);
  expect(
    pseudo.every((content) => content === "none" || content === "normal"),
  ).toBe(true);
});
