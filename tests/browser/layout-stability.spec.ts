import { test, expect, type Page } from "@playwright/test";

async function prepare(
  page: Page,
  path: string,
  gutter: number,
  classic: boolean,
) {
  await page.goto(path);
  // Keep gutter width deterministic across host scrollbar preferences.
  await page.addStyleTag({
    content: `html::-webkit-scrollbar { width: ${gutter}px; }`,
  });
  if (classic)
    await page.evaluate(() => {
      // Headless macOS reports overlay clientWidth even with a reserved gutter.
      // Mirror classic viewport metrics to exercise react-remove-scroll-bar's gap calculation.
      Object.defineProperty(document.documentElement, "clientWidth", {
        configurable: true,
        get() {
          return Math.round(this.getBoundingClientRect().width);
        },
      });
    });
  await page.evaluate(() => document.fonts.ready);
}
function positions(page: Page) {
  return page.evaluate(() =>
    [
      ".header-inner",
      ".brand",
      ".header-actions",
      ".page-navigation-inner",
      ".site-footer",
    ].map((selector) => {
      const rect = document.querySelector(selector)!.getBoundingClientRect();
      return [rect.x, rect.width];
    }),
  );
}
async function expectPositions(page: Page, expected: number[][]) {
  const actual = await positions(page);
  actual.forEach((rect, index) =>
    rect.forEach((value, edge) =>
      expect(value).toBeCloseTo(expected[index]![edge]!, 1),
    ),
  );
}
for (const mode of [
  { name: "overlay", gutter: 0, classic: false },
  { name: "reserved gutter", gutter: 16, classic: false },
  { name: "classic gap compensation", gutter: 16, classic: true },
]) {
  test(`long and short pages and overlay locks retain layout: ${mode.name}`, async ({
    page,
    isMobile,
  }) => {
    await page.setViewportSize({ width: isMobile ? 390 : 1440, height: 1200 });
    const long = "/courses/maths/higher-mathematics/1.8/";
    await prepare(page, long, mode.gutter, mode.classic);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollHeight > innerHeight,
      ),
    ).toBe(true);
    const before = await positions(page);
    await expect(page.locator("html")).toHaveCSS("scrollbar-gutter", "stable");
    for (const trigger of [
      "搜索知识、课程与任务",
      "切换主题",
      ...(isMobile ? ["打开导航"] : []),
    ]) {
      await page.getByRole("button", { name: trigger, exact: true }).click();
      await expect(page.locator("body")).toHaveAttribute(
        "data-scroll-locked",
        /\d+/,
      );
      await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
      await expect(page.locator("body")).toHaveCSS("margin-right", "0px");
      if (mode.classic && !isMobile)
        expect(
          await page.evaluate(() =>
            [...document.querySelectorAll("style")].some((style) =>
              /margin-right:\s*16px\s*!important/.test(style.textContent ?? ""),
            ),
          ),
        ).toBe(true);
      await expectPositions(page, before);
      await page.keyboard.press("Escape");
      await expect(page.locator("body")).not.toHaveAttribute(
        "data-scroll-locked",
      );
      await expectPositions(page, before);
    }
    // Real public/private empty collections exercise the non-overflowing state.
    for (const short of ["/tasks/", "/private/knowledge/"]) {
      await prepare(page, short, mode.gutter, mode.classic);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollHeight <= innerHeight,
        ),
      ).toBe(true);
      // The private label changes brand width, but not its left edge or the surrounding layout.
      const current = await positions(page);
      for (const index of [0, 2, 3, 4])
        expect(current[index]![0]).toBe(before[index]![0]);
      expect(current[1]![0]).toBe(before[1]![0]);
    }
    await prepare(page, long, mode.gutter, mode.classic);
    await expectPositions(page, before);
  });
}
