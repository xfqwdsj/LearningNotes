import { test, expect } from "@playwright/test";

for (const prefix of ["", "/private"]) {
  test(`demo lab browses a paginated catalog and switches previews on ${prefix || "public"}`, async ({
    page,
  }) => {
    const catalogs: string[] = [];
    const records: string[] = [];
    page.on("request", (request) => {
      const pathname = new URL(request.url()).pathname;
      if (/\/demos\/catalogs\/[a-f0-9]{16}\.json$/.test(pathname))
        catalogs.push(pathname);
      if (
        /\/demos\/(?!catalogs\/|ids\/)[^/]+\/[a-f0-9]{16}\.json$/.test(pathname)
      )
        records.push(pathname);
    });

    await page.goto(`${prefix}/demos/`);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "交互演示",
      }),
    ).toBeVisible();
    await expect(page.locator(".lab-demo-option")).toHaveCount(18);
    await expect(
      page.locator(".lab-demo-option").first().locator(".katex").first(),
    ).toBeVisible();
    await expect(
      page.locator("[data-lab-demo] .interactive-demo"),
    ).toBeVisible();
    expect(catalogs).toHaveLength(1);
    expect(catalogs[0]).toMatch(
      new RegExp(`^${prefix}/demos/catalogs/[a-f0-9]{16}\\.json$`),
    );
    expect(records).toHaveLength(1);

    const options = page.locator(".lab-demo-option");
    const firstId = await options.first().getAttribute("data-demo-id");
    const second = options.nth(1);
    const secondId = await second.getAttribute("data-demo-id");
    await second.click();
    await expect(page.locator("[data-lab-demo]")).toHaveAttribute(
      "data-lab-demo",
      secondId!,
    );
    await expect(page).toHaveURL(new RegExp(`demo=${secondId}`));
    expect(records).toHaveLength(2);

    await page.goBack();
    await expect(page.locator("[data-lab-demo]")).toHaveAttribute(
      "data-lab-demo",
      firstId!,
    );

    const list = page.locator(".lab-index-list");
    await list.evaluate((element) => {
      element.scrollTop = element.scrollHeight;
    });
    await expect(options).not.toHaveCount(18);

    await page
      .getByPlaceholder("搜索标题、描述或标签")
      .fill("极限存在，函数就连续吗");
    await expect(page.locator(".lab-demo-option")).toHaveCount(1);
    await page.locator(".lab-demo-option").click();
    await expect(page.locator("[data-lab-demo]")).toHaveAttribute(
      "data-lab-demo",
      "continuity",
    );
    const locations = page.locator(".lab-locations .demo-references a");
    await expect(locations.first()).toHaveAttribute(
      "href",
      /\/knowledge\/maths\/limits\/continuity\/#exploration$/,
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
  });
}

test("demo lab deep links select the preview and home links to the full catalog", async ({
  page,
}) => {
  await page.goto("/demos/?demo=continuity");
  await expect(page.locator("[data-lab-demo]")).toHaveAttribute(
    "data-lab-demo",
    "continuity",
  );
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: "浏览全部交互演示" }),
  ).toHaveAttribute("href", "/demos/");
  await page.locator("#learning-path").scrollIntoViewIfNeeded();
  await expect(
    page.getByRole("link", { name: "全部演示", exact: true }),
  ).toHaveAttribute("href", "/demos/");
});

for (const prefix of ["", "/private"]) {
  test(`localized subjects and Markdown tags are supplied by the catalog on ${prefix || "public"}`, async ({
    page,
  }) => {
    let taxonomyRequested = false;
    await page.route("**/taxonomy.json", async (route) => {
      taxonomyRequested = true;
      await route.abort();
    });
    await page.goto(`${prefix}/demos/?demo=f-ratio`);
    await expect(
      page.locator('[data-lab-demo="f-ratio"] .interactive-demo'),
    ).toBeVisible();
    await expect(
      page.locator(".lab-subject-filter button").filter({ hasText: "数学" }),
    ).toBeVisible();
    await expect(page.locator(".lab-preview-meta")).toContainText("数学");
    await expect(page.locator(".lab-preview-meta .katex")).toBeVisible();
    await expect(page.locator(".lab-preview-meta")).not.toContainText("maths");
    expect(taxonomyRequested).toBe(false);
    await page.getByPlaceholder("搜索标题、描述或标签").fill("交换自由度");
    const row = page.locator('[data-demo-id="f-ratio"] .demo-metadata');
    const detail = page.locator(".lab-preview-meta.demo-metadata");
    await expect(row).toBeVisible();
    await expect(page.locator('[data-demo-id="f-ratio"]')).toHaveCSS(
      "cursor",
      "pointer",
    );
    expect(await row.locator(".demo-metadata-subject").innerHTML()).toBe(
      await detail.locator(".demo-metadata-subject").innerHTML(),
    );
    expect(await row.locator(".demo-metadata-tag").allInnerTexts()).toEqual(
      await detail.locator(".demo-metadata-tag").allInnerTexts(),
    );
    expect(
      await row.evaluate((element) => getComputedStyle(element).fontSize),
    ).toBe(
      await detail.evaluate((element) => getComputedStyle(element).fontSize),
    );

    await page.getByPlaceholder("搜索标题、描述或标签").fill("概率论");
    await expect(page.locator(".lab-demo-option").first()).toBeVisible();
  });
}

test("mathematical article titles render symbols in headings and the catalog", async ({
  page,
}) => {
  for (const route of [
    "integrals/gamma-function",
    "statistics/f-distribution",
    "statistics/t-distribution",
    "statistics/p-value",
  ]) {
    await page.goto(`/knowledge/maths/${route}/`);
    await expect(page.locator(".article-header h1 .katex")).toBeVisible();
    await expect(page.locator(".article-header h1")).not.toContainText("$");
  }
});

test("article summaries render mathematical symbols", async ({ page }) => {
  for (const [parent, name] of [
    ["statistics", "f-distribution"],
    ["statistics", "t-distribution"],
    ["statistics", "p-value"],
    ["statistics", "variance-ratio-confidence-interval"],
    ["integrals", "gamma-function"],
  ]) {
    await page.goto(`/knowledge/maths/${parent}/`);
    const row = page.locator(".document-row").filter({
      has: page.locator(
        `a.document-title-link[href="/knowledge/maths/${parent}/${name}/"]`,
      ),
    });
    await expect(row.locator(".summary-preview .katex").first()).toBeVisible();
    await expect(row.locator(".summary-preview .katex-error")).toHaveCount(0);
  }
});
