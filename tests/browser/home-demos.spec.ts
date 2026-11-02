import { test, expect } from "@playwright/test";
for (const prefix of ["", "/private"]) {
  test(`home lazily selects one demo and animates its intrinsic height on ${prefix || "public"}`, async ({
    page,
  }) => {
    const details: string[] = [];
    const lists: string[] = [];
    page.on("request", (request) => {
      if (
        /\/demos\/ids\/[a-f0-9]{16}\.json$/.test(
          new URL(request.url()).pathname,
        )
      )
        lists.push(request.url());
      if (
        /\/demos\/(?!ids\/)[^/]+\/[a-f0-9]{16}\.json$/.test(
          new URL(request.url()).pathname,
        )
      )
        details.push(new URL(request.url()).pathname);
    });
    await page.goto(`${prefix}/`);
    await page.locator("#learning-path").scrollIntoViewIfNeeded();
    const stage = page.locator("[data-home-demo]");
    await expect(stage.locator(".interactive-demo")).toBeVisible();
    const first = await stage.getAttribute("data-home-demo");
    expect(lists).toHaveLength(1);
    expect(details).toHaveLength(1);
    expect(details[0]).toMatch(new RegExp(`^${prefix}/demos/`));
    const refresh = page.getByRole("button", {
      name: "换一个演示",
      exact: true,
    });
    await refresh.scrollIntoViewIfNeeded();
    await page.waitForTimeout(550);
    const y = await page.evaluate(() => scrollY);
    const button = (await refresh.boundingBox())!;
    await page.mouse.click(
      button.x + button.width / 2,
      button.y + button.height / 2,
    );
    await expect(stage).not.toHaveAttribute("data-home-demo", first!);
    await expect(stage.locator(".interactive-demo")).toBeVisible();
    expect(details).toHaveLength(2);
    expect(lists).toHaveLength(prefix ? 2 : 1);
    // Height is allowed to change; it converges to the measured content instead of an old minimum.
    await expect
      .poll(() =>
        page
          .locator(".home-demo-stage")
          .evaluate((element) =>
            Math.abs(
              element.getBoundingClientRect().height -
                element
                  .querySelector(".animated-height-content")!
                  .getBoundingClientRect().height,
            ),
          ),
      )
      .toBeLessThan(1);
    expect(Math.abs((await page.evaluate(() => scrollY)) - y)).toBeLessThan(2);
    const href = await page
      .locator(".home-demo-links a")
      .first()
      .getAttribute("href");
    expect(href).toMatch(/^\/(?:knowledge|courses)\//);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}
test("private home merges public documents and keeps their public navigation targets", async ({
  page,
}) => {
  await page.goto("/private/");
  await expect(page.locator(".private-label")).toBeVisible();
  const publicRow = page
    .locator(".document-row")
    .filter({
      has: page.locator('.document-title-link[href^="/knowledge/"]'),
    })
    .first();
  const publicLink = publicRow.locator(
    '.document-title-link[href^="/knowledge/"]',
  );
  await expect(publicLink).toBeVisible();
  const publicHref = await publicLink.getAttribute("href");
  await expect(
    page.locator('.home-content-link a[href="/private/knowledge/"]'),
  ).toHaveCount(1);
  await expect(publicRow).toContainText("公开站");
  await publicLink.click();
  await expect
    .poll(() => new URL(page.url()).pathname)
    .toBe(`${publicHref!.replace(/\/$/, "")}/`);
  await expect(page.locator(".private-label")).toHaveCount(0);
});
test("demo data failures are recoverable and article demos use their embedded localized record", async ({
  page,
}) => {
  let fail = true;
  await page.route(/\/demos\/(?!ids\/)[^/]+\/[a-f0-9]{16}\.json$/, (route) =>
    fail
      ? route.fulfill({ status: 503, body: "unavailable" })
      : route.continue(),
  );
  await page.goto("/");
  await page.locator("#learning-path").scrollIntoViewIfNeeded();
  await expect(
    page.locator(".home-demo-stage").getByRole("alert"),
  ).toContainText("演示暂时无法加载");
  fail = false;
  await page.getByRole("button", { name: "重试", exact: true }).click();
  await expect(
    page.locator("[data-home-demo] .interactive-demo"),
  ).toBeVisible();
  const details: string[] = [];
  page.on("request", (request) => {
    if (/\/demos\/(?!ids\/)[^/]+\/[a-f0-9]{16}\.json$/.test(request.url()))
      details.push(request.url());
  });
  await page.goto("/knowledge/maths/limits/fixture-continuity/");
  await expect(page.locator(".interactive-demo")).toBeVisible();
  expect(details).toHaveLength(0);
});

test("secant and tangent slope values render as KaTeX", async ({ page }) => {
  await page.goto("/knowledge/maths/derivatives/fixture-derivative/");
  const demo = page.locator(".interactive-demo");
  await expect(demo).toBeVisible();
  await demo.getByRole("slider").focus();
  await page.keyboard.press("ArrowLeft");
  const conclusion = demo.locator(".demo-conclusion");
  await expect(conclusion.locator(".katex .katex-html").nth(0)).toHaveText(
    "2.98",
  );
  await expect(conclusion.locator(".katex .katex-html").nth(1)).toHaveText("2");
});

test("placeholder and demo share the same measured height container", async ({
  page,
}) => {
  let release!: () => void;
  const delayed = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(
    /\/demos\/(?!ids\/)[^/]+\/[a-f0-9]{16}\.json$/,
    async (route) => {
      await delayed;
      await route.continue();
    },
  );
  await page.goto("/");
  await page.locator("#learning-path").scrollIntoViewIfNeeded();
  await expect(
    page.locator(".home-demo-stage .demo-placeholder"),
  ).toBeVisible();
  const matches = () =>
    page.locator(".home-demo-stage").evaluate((element) => ({
      delta: Math.abs(
        element.getBoundingClientRect().height -
          element
            .querySelector(".animated-height-content")!
            .getBoundingClientRect().height,
      ),
      min: getComputedStyle(element).minHeight,
    }));
  await expect.poll(async () => (await matches()).delta).toBeLessThan(1);
  expect((await matches()).min).toBe("0px");
  release();
  await expect(
    page.locator("[data-home-demo] .interactive-demo"),
  ).toBeVisible();
  await expect.poll(async () => (await matches()).delta).toBeLessThan(1);
});

test("public stable demo records are reused after switching away and back", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const details: string[] = [],
    lists: string[] = [];
  page.on("request", (request) => {
    const pathname = new URL(request.url()).pathname;
    if (/\/demos\/ids\/[a-f0-9]{16}\.json$/.test(pathname))
      lists.push(pathname);
    else if (/\/demos\/[^/]+\/[a-f0-9]{16}\.json$/.test(pathname))
      details.push(pathname);
  });
  const listResponse = page.waitForResponse(
    /\/demos\/ids\/[a-f0-9]{16}\.json$/,
  );
  await page.goto("/");
  await expect(async () => {
    await page.locator("#learning-path").scrollIntoViewIfNeeded();
    await expect(
      page.locator("[data-home-demo] .interactive-demo"),
    ).toBeVisible();
  }).toPass({ timeout: 15_000 });
  const { entries } = (await (await listResponse).json()) as {
    entries: { id: string }[];
  };
  const first = (await page
    .locator("[data-home-demo]")
    .getAttribute("data-home-demo"))!;
  const firstIndex = entries.findIndex((entry) => entry.id === first);
  const secondIndex = firstIndex === 0 ? 1 : 0;
  // Control only the post-hydration selection; framework initialization keeps its real randomness.
  await page.evaluate(() => {
    Math.random = () => 0;
  });
  const refresh = page.getByRole("button", { name: "换一个演示", exact: true });
  await refresh.click();
  await expect(page.locator("[data-home-demo]")).toHaveAttribute(
    "data-home-demo",
    entries[secondIndex]!.id,
  );
  const returnValue =
    (firstIndex - (firstIndex > secondIndex ? 1 : 0) + 0.25) /
    (entries.length - 1);
  await page.evaluate((value) => {
    Math.random = () => value;
  }, returnValue);
  await refresh.click();
  await expect(page.locator("[data-home-demo]")).toHaveAttribute(
    "data-home-demo",
    first,
  );
  expect(lists).toHaveLength(1);
  expect(details).toHaveLength(2);
});
test("demo ID list failures can be retried", async ({ page }) => {
  let fail = true;
  await page.route(/\/demos\/ids\/[a-f0-9]{16}\.json$/, (route) =>
    fail
      ? route.fulfill({ status: 503, body: "unavailable" })
      : route.continue(),
  );
  await page.goto("/");
  await page.locator("#learning-path").scrollIntoViewIfNeeded();
  await expect(
    page.locator(".home-demo-stage").getByRole("alert"),
  ).toContainText("演示暂时无法加载");
  fail = false;
  await page.getByRole("button", { name: "重试", exact: true }).click();
  await expect(
    page.locator("[data-home-demo] .interactive-demo"),
  ).toBeVisible();
});
