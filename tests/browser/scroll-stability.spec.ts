import { test, expect, type Locator, type Page } from "@playwright/test";

// Locator.click/tap auto-scrolls sticky controls, masking the app's own behavior.
async function activate(page: Page, target: Locator) {
  await target.evaluate(async (element) => {
    const overlay = element.closest(
      '[data-slot="sheet-content"], [data-slot="dropdown-menu-content"], [data-slot="dialog-content"]',
    );
    await Promise.all(
      overlay
        ?.getAnimations()
        .map((animation) => animation.finished.catch(() => {})) ?? [],
    );
  });
  const rect = await target.boundingBox();
  expect(rect).not.toBeNull();
  expect(rect!.y).toBeGreaterThanOrEqual(0);
  const point = { x: rect!.x + rect!.width / 2, y: rect!.y + rect!.height / 2 };
  if (await page.evaluate(() => navigator.maxTouchPoints > 0))
    await page.touchscreen.tap(point.x, point.y);
  else await page.mouse.click(point.x, point.y);
}
async function swipe(page: Page, fromY: number, toY: number) {
  const session = await page.context().newCDPSession(page);
  const x = await page.evaluate(() => Math.round(innerWidth / 2));
  await session.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x, y: fromY }],
  });
  await session.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x, y: toY }],
  });
  await session.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await session.detach();
}
async function startRecording(page: Page) {
  await page.evaluate(() => {
    const state = window as typeof window & {
      overlayScrolls: number[];
      recordOverlayScroll?: () => void;
    };
    if (state.recordOverlayScroll)
      window.removeEventListener("scroll", state.recordOverlayScroll);
    state.overlayScrolls = [scrollY];
    state.recordOverlayScroll = () => state.overlayScrolls.push(scrollY);
    window.addEventListener("scroll", state.recordOverlayScroll, {
      passive: true,
    });
  });
}
async function expectStable(page: Page, position: number) {
  // Include exit animations and delayed FocusScope teardown, not only final scrollY.
  await page.waitForTimeout(700);
  const positions = await page.evaluate(
    () =>
      (window as typeof window & { overlayScrolls: number[] }).overlayScrolls,
  );
  expect(
    positions.every((value) => Math.abs(value - position) <= 1),
    JSON.stringify(positions),
  ).toBe(true);
  expect(
    Math.abs((await page.evaluate(() => scrollY)) - position),
  ).toBeLessThanOrEqual(1);
}
async function readAt(page: Page, href: string, top: number) {
  await page.goto(href);
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(".search-trigger")).toHaveAttribute(
    "aria-keyshortcuts",
    /^(Meta|Control)\+K$/,
  );
  await page.evaluate(
    (y) => window.scrollTo({ top: y, behavior: "instant" }),
    top,
  );
  await expect
    .poll(() => page.evaluate((target) => Math.abs(scrollY - target), top))
    .toBeLessThanOrEqual(1);
  await startRecording(page);
}
for (const href of [
  "/",
  "/courses/maths/higher-mathematics/",
  "/courses/maths/higher-mathematics/fixture-4.3/",
  "/private/tasks/english/university-english/assignment/fixture-scroll/",
]) {
  test(`mobile navigation preserves scroll and returns focus on ${href}`, async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "Mobile navigation is hidden on desktop");
    await readAt(page, href, 600);
    const trigger = page.getByRole("button", { name: "打开导航", exact: true });
    for (const close of ["button", "outside", "escape"] as const) {
      await activate(page, trigger);
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await expectStable(page, 600);
      if (close === "button")
        await activate(
          page,
          dialog.getByRole("button", { name: "关闭", exact: true }),
        );
      else if (close === "outside") await page.touchscreen.tap(8, 160);
      else await page.keyboard.press("Escape");
      await expect(dialog).not.toBeVisible();
      await expect(trigger).toBeFocused();
      await expectStable(page, 600);
    }
  });
}

test("search, theme and discussion closures keep the reading position", async ({
  page,
}) => {
  await readAt(page, "/courses/maths/higher-mathematics/fixture-4.3/", 1000);
  const search = page.getByRole("button", {
    name: "搜索知识、课程与任务",
    exact: true,
  });
  await activate(page, search);
  await expect(page.getByRole("textbox")).toBeFocused();
  await expectStable(page, 1000);
  await activate(
    page,
    page.getByRole("dialog").getByRole("button", { name: "关闭", exact: true }),
  );
  await expect(search).toBeFocused();
  await expectStable(page, 1000);
  await page.keyboard.press(
    (await page.locator(".search-trigger").getAttribute("aria-keyshortcuts"))!,
  );
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(search).toBeFocused();
  await expectStable(page, 1000);
  const theme = page.getByRole("button", { name: "切换主题", exact: true });
  await activate(page, theme);
  await page.keyboard.press("Escape");
  await expect(theme).toBeFocused();
  await expectStable(page, 1000);
  if (test.info().project.name === "chromium") {
    // Position a section action in view, then use its menu and shared copy controls.
    const heading = page.locator(".inline-section-heading").nth(2);
    await heading.evaluate((node) =>
      node.scrollIntoView({ behavior: "instant", block: "center" }),
    );
    const position = await page.evaluate(() => scrollY);
    await startRecording(page);
    const discussion = heading.getByRole("button", {
      name: "讨论此节",
      exact: true,
    });
    await activate(page, discussion);
    await activate(
      page,
      page.getByRole("menuitemradio", { name: "原文与链接", exact: true }),
    );
    await expect(page.getByRole("menu")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(discussion).toBeFocused();
    await expectStable(page, position);
    await activate(
      page,
      heading.getByRole("button", { name: "复制本节链接", exact: true }),
    );
    await expectStable(page, position);
  }
});

test("keyboard search restores the originating reading control rather than the header", async ({
  page,
}) => {
  test.skip(
    test.info().project.name !== "chromium",
    "The inline heading action that originates search is pointer-only.",
  );
  await readAt(page, "/courses/maths/higher-mathematics/fixture-4.3/", 1000);
  const heading = page.locator(".inline-section-heading").nth(2);
  await heading.evaluate((node) =>
    node.scrollIntoView({ behavior: "instant", block: "center" }),
  );
  const origin = heading.getByRole("button", { name: "讨论此节", exact: true });
  await origin.focus();
  const position = await page.evaluate(() => scrollY);
  await startRecording(page);
  await page.keyboard.press(
    (await page.locator(".search-trigger").getAttribute("aria-keyshortcuts"))!,
  );
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("textbox")).toBeFocused();
  await page.getByRole("dialog").evaluate(async (element) => {
    await Promise.all(
      element
        .getAnimations()
        .map((animation) => animation.finished.catch(() => {})),
    );
  });
  await page.keyboard.press("Escape");
  await expect(origin).toBeFocused();
  await expectStable(page, position);
});

test("closing navigation during a route change does not restore the outgoing page focus", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "Mobile navigation is hidden on desktop");
  await readAt(page, "/courses/maths/higher-mathematics/fixture-4.3/", 1000);
  await activate(
    page,
    page.getByRole("button", { name: "打开导航", exact: true }),
  );
  await activate(
    page,
    page.getByRole("dialog").getByRole("link", { name: "知识点", exact: true }),
  );
  await expect(page).toHaveURL(/\/knowledge\/$/);
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.waitForTimeout(700);
  await expect(
    page.getByRole("button", { name: "打开导航", exact: true }),
  ).not.toBeFocused();
  expect(await page.evaluate(() => scrollY)).toBeLessThan(120);
});

test("image viewer closes on gestures and leaves reading scroll unlocked", async ({
  page,
}) => {
  await page.route("https://fixture.invalid/**", (route) =>
    route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600"><rect width="1200" height="600" fill="#ddd"/></svg>',
    }),
  );
  await page.goto(
    "/private/tasks/maths/higher-mathematics/exercise/fixture-image/",
  );
  const image = page.locator('article [data-rmiz-content="found"] img').first();
  const zoomButton = page.locator("article [data-rmiz-btn-zoom]").first();
  const openDialog = page.locator("dialog[data-rmiz-modal][open]");
  await image.evaluate((node) =>
    node.scrollIntoView({ behavior: "instant", block: "center" }),
  );
  await expect(image).toBeVisible();
  await expect(zoomButton).toHaveCount(1);
  const initial = await page.evaluate(() => scrollY);
  await startRecording(page);
  await activate(page, image);
  await expect(openDialog).toBeVisible();
  await expectStable(page, initial);
  await page.keyboard.press("Escape");
  await expect(openDialog).toHaveCount(0);
  await expect(zoomButton).toBeFocused();
  await expectStable(page, initial);
  await activate(page, image);
  await expect(openDialog).toBeVisible();
  await page.waitForTimeout(350);
  const touch = await page.evaluate(() => navigator.maxTouchPoints > 0);
  if (touch) {
    const y = await page.evaluate(() => Math.round(innerHeight * 0.45));
    await swipe(page, y, y + 140);
  } else {
    await page.mouse.wheel(0, 140);
  }
  await expect(openDialog).toHaveCount(0);
  await expect(zoomButton).toBeFocused();
  await expectStable(page, initial);
  const direction = await page.evaluate(() =>
    scrollY < document.documentElement.scrollHeight - innerHeight - 120
      ? 1
      : -1,
  );
  if (touch) {
    const y = await page.evaluate(() => Math.round(innerHeight * 0.65));
    await swipe(page, y, y - direction * 140);
  } else {
    await page.mouse.wheel(0, direction * 140);
  }
  await expect.poll(() => page.evaluate(() => scrollY)).not.toBe(initial);
});
