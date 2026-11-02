import { test, expect, type Locator, type Page } from "@playwright/test";

// Click actual viewport coordinates: Locator.click scrolls sticky controls into view.
async function pointerClick(page: Page, target: Locator) {
  const rect = await target.boundingBox();
  expect(rect).not.toBeNull();
  await page.mouse.click(rect!.x + rect!.width / 2, rect!.y + rect!.height / 2);
}

test("theme changes animate colors without moving the reading position", async ({
  page,
}) => {
  await page.goto("/courses/maths/higher-mathematics/4.3/");
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() =>
    window.scrollTo({ top: 1000, behavior: "instant" }),
  );
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(1000);
  await pointerClick(page, page.getByRole("button", { name: "切换主题" }));
  await expect(page.getByRole("menu")).toBeVisible();
  await pointerClick(
    page,
    page.getByRole("menuitem", { name: "深色", exact: true }),
  );
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(1000);
  await expect
    .poll(() => page.locator("html").getAttribute("data-theme-changing"))
    .toBeNull();
  await pointerClick(page, page.getByRole("button", { name: "切换主题" }));
  await pointerClick(
    page,
    page.getByRole("menuitem", { name: "浅色", exact: true }),
  );
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(1000);
});

test("TOC follows headings and article progress without moving the page", async ({
  page,
}) => {
  await page.goto("/courses/maths/higher-mathematics/4.3/");
  await page.evaluate(() => document.fonts.ready);
  const first = await page
    .locator('.reading-toc a[aria-current="location"]')
    .getAttribute("href");
  const target = page.locator(".reading-main h2, .reading-main h3").nth(2);
  const id = await target.getAttribute("id");
  await target.evaluate((element) =>
    element.scrollIntoView({ behavior: "instant", block: "start" }),
  );
  await expect(
    page.locator('.reading-toc a[aria-current="location"]'),
  ).toHaveAttribute("href", `#${id}`);
  expect(first).not.toBe(`#${id}`);
  await expect
    .poll(async () =>
      Number(
        await page
          .getByRole("progressbar", { includeHidden: true })
          .getAttribute("aria-valuenow"),
      ),
    )
    .toBeGreaterThan(0);
  const position = await page.evaluate(() => scrollY);
  await page.waitForTimeout(200);
  expect(await page.evaluate(() => scrollY)).toBe(position);
});

test("TOC resolves problem-set anchors after interactive content settles", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1360, height: 900 });
  await page.goto(
    "/private/tasks/maths/linear-algebra/assignment/fixture-slots/",
  );
  await page.evaluate(() => document.fonts.ready);
  for (const href of ["#fixture-slot-set", "#fixture-work"]) {
    await page.locator(href).evaluate((element) =>
      window.scrollTo({
        top: window.scrollY + element.getBoundingClientRect().top - 80,
        behavior: "instant",
      }),
    );
    await expect(
      page.locator('.reading-toc a[aria-current="location"]'),
    ).toHaveAttribute("href", href);
  }
});

test("reading rails fit the viewport and reveal their current item on entry", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1360, height: 760 });
  await page.goto("/courses/maths/higher-mathematics/7.3/");
  await page.evaluate(() => document.fonts.ready);
  await expect(
    page.locator(
      ".reading-sidebar [aria-current], .reading-toc [aria-current]",
    ),
  ).toHaveCount(2);

  const rails = await page
    .locator(".reading-sidebar, .reading-toc")
    .evaluateAll((elements) =>
      elements.map((element) => {
        const nav = element.querySelector("nav")!;
        const railRect = element.getBoundingClientRect();
        return {
          bottom: railRect.bottom,
          height: railRect.height,
          navScrollTop: nav.scrollTop,
          viewportHeight: innerHeight,
        };
      }),
    );

  expect(rails).toHaveLength(2);
  for (const rail of rails) {
    expect(rail.bottom).toBeLessThanOrEqual(rail.viewportHeight);
  }
  expect(await page.evaluate(() => scrollY)).toBe(0);
  await expect
    .poll(() =>
      page.locator(".reading-sidebar, .reading-toc").evaluateAll((elements) =>
        elements.every((element) => {
          const nav = element.querySelector("nav")!;
          const current = nav.querySelector<HTMLElement>("[aria-current]")!;
          const navRect = nav.getBoundingClientRect();
          const currentRect = current.getBoundingClientRect();
          return (
            currentRect.top >= navRect.top &&
            currentRect.bottom <= navRect.bottom
          );
        }),
      ),
    )
    .toBe(true);
  const initialLeft = rails[0]!;
  const sidebarOverflow = await page
    .locator(".reading-sidebar nav")
    .evaluate((element) => element.scrollHeight > element.clientHeight);
  if (sidebarOverflow)
    await expect
      .poll(() =>
        page
          .locator(".reading-sidebar nav")
          .evaluate((element) => element.scrollTop),
      )
      .toBeGreaterThan(0);

  await page.evaluate(() => window.scrollTo({ top: 700, behavior: "instant" }));
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(700);
  const stickyRails = await page
    .locator(".reading-sidebar, .reading-toc")
    .evaluateAll((elements) =>
      elements.map((element) => {
        const rect = element.getBoundingClientRect();
        return { bottom: rect.bottom, top: rect.top };
      }),
    );
  for (const rail of stickyRails) expect(rail.top).toBeCloseTo(96, 0);
  await expect
    .poll(() =>
      page
        .locator(".reading-sidebar")
        .evaluate((element) => element.getBoundingClientRect().height),
    )
    .toBeCloseTo(initialLeft.height, 0);

  await page.goto("/knowledge/cs/data-representation/number-base-conversion/");
  await page.evaluate(() => document.fonts.ready);
  const toc = page.locator(".reading-toc");
  const tocNav = toc.locator("nav");
  expect(
    await tocNav.evaluate(
      (element) => element.scrollHeight > element.clientHeight,
    ),
  ).toBe(true);
  const tocLinks = tocNav.locator("a");
  const targetHref = await tocLinks
    .nth((await tocLinks.count()) - 3)
    .getAttribute("href");
  await page
    .locator(targetHref!)
    .evaluate((element) =>
      element.scrollIntoView({ behavior: "instant", block: "start" }),
    );
  const current = tocNav.locator('[aria-current="location"]');
  await expect(current).toHaveAttribute("href", targetHref!);
  await expect
    .poll(() =>
      tocNav.evaluate((nav) => {
        const item = nav.querySelector<HTMLElement>(
          '[aria-current="location"]',
        )!;
        const navRect = nav.getBoundingClientRect();
        const itemRect = item.getBoundingClientRect();
        return itemRect.top >= navRect.top && itemRect.bottom <= navRect.bottom;
      }),
    )
    .toBe(true);
});

test("section heading rules span the reading column while actions stay overlaid", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1360, height: 900 });
  await page.goto("/knowledge/maths/limits/continuity/");
  await page.evaluate(() => document.fonts.ready);
  const widths = await page
    .locator(".inline-section-heading.heading-level-2:not(.problem-set-header)")
    .evaluateAll((elements) =>
      elements.map((element) => {
        const heading = element.querySelector("h2")!;
        return {
          container: element.getBoundingClientRect().width,
          heading: heading.getBoundingClientRect().width,
          rule: getComputedStyle(heading).borderBottomWidth,
        };
      }),
    );
  expect(widths.length).toBeGreaterThan(0);
  for (const width of widths) {
    expect(width.rule).toBe("1px");
    expect(Math.abs(width.heading - width.container)).toBeLessThan(1);
  }
  const setHeader = page.locator(".problem-set-header");
  await expect(
    setHeader.getByRole("button", { name: "清空本题集" }),
  ).toHaveCount(0);
  await expect(
    page
      .locator(".problem-set-footer")
      .getByRole("button", { name: "清空本题集" }),
  ).toHaveCount(1);
  expect((await setHeader.boundingBox())!.height).toBeLessThan(80);
  await expect(setHeader.locator(".section-kind-badge")).toHaveText("题集");
  const alignment = await page
    .locator(".inline-section-heading")
    .filter({ has: page.locator("#examples") })
    .evaluate((element) => {
      const heading = element.querySelector("h2")!;
      const button = [
        ...element.querySelectorAll(".inline-section-actions button"),
      ].find((candidate) => candidate.getBoundingClientRect().width > 0)!;
      const range = document.createRange();
      range.selectNodeContents(heading);
      const text = range.getBoundingClientRect();
      const action = button.getBoundingClientRect();
      return {
        text: (text.top + text.bottom) / 2,
        action: (action.top + action.bottom) / 2,
      };
    });
  expect(Math.abs(alignment.text - alignment.action)).toBeLessThan(1.5);
  if (test.info().project.name === "chromium")
    await expect(setHeader.locator(".inline-section-actions")).toHaveCSS(
      "opacity",
      "0",
    );
});

test("compact heading actions collapse into a scoped menu on narrow screens", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/knowledge/maths/limits/continuity/");
  const heading = page
    .locator(".inline-section-heading")
    .filter({ has: page.locator("#definition") });
  const trigger = heading.getByRole("button", {
    name: "本节操作",
    exact: true,
  });
  await expect(trigger).toBeVisible();
  await trigger.click();
  await expect(
    page.getByRole("menuitem", { name: "复制本节链接", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("menuitem", { name: "复制讨论提示词", exact: true }),
  ).toBeVisible();
});

test("knowledge slots get a local marker without shifting the text column", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1360, height: 900 });
  await page.goto("/knowledge/maths/limits/continuity/");
  await page.evaluate(() => document.fonts.ready);
  const badges = page.locator(".section-slot-badge");
  await expect(badges).toHaveCount(4);
  expect(
    await badges.evaluateAll((elements) =>
      elements.map((element) => element.getAttribute("aria-label")),
    ),
  ).toEqual(["定义", "性质", "例子", "探索"]);
  const positions = await page.evaluate(() => {
    const title = document.querySelector(".article-header h1")!;
    const paragraph = document.querySelector(".semantic-section .prose p")!;
    return {
      title: title.getBoundingClientRect().x,
      paragraph: paragraph.getBoundingClientRect().x,
    };
  });
  expect(Math.abs(positions.title - positions.paragraph)).toBeLessThan(1);
});

test("document and on-page navigation share the same current-item styling", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1360, height: 900 });
  await page.goto("/courses/maths/higher-mathematics/4.3/");
  const left = page.locator(
    '.reading-sidebar .reading-nav-link[aria-current="page"]',
  );
  const right = page.locator(
    '.reading-toc .reading-nav-link[aria-current="location"]',
  );
  await expect(left).toHaveCount(1);
  await expect(right).toHaveCount(1);
  const appearance = (element: HTMLElement | SVGElement) => {
    const css = getComputedStyle(element);
    return {
      background: css.backgroundColor,
      radius: css.borderRadius,
      color: css.color,
      fontSize: css.fontSize,
      lineHeight: css.lineHeight,
      border: css.borderInlineStartWidth,
    };
  };
  await expect
    .poll(() => right.evaluate(appearance))
    .toEqual(await left.evaluate(appearance));
  expect((await left.evaluate(appearance)).border).toBe("0px");
  await expect(page.locator(".reading-progress")).toContainText(/已读 \d+%/);
  await expect(page.locator(".reading-progress > span")).toHaveCount(0);
});

test("sibling navigation preserves the reading sidebar and its scroll position", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1360, height: 760 });
  await page.goto("/courses/maths/higher-mathematics/4.3/");
  const sidebar = page.locator(".reading-sidebar");
  const current = sidebar.locator('[aria-current="page"]');
  await expect(current).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  const next = current.locator("xpath=following-sibling::a[1]");
  const href = await next.getAttribute("href");
  await expect
    .poll(() =>
      next.evaluate((item) => {
        const rect = item.getBoundingClientRect();
        const nav = item.parentElement!.getBoundingClientRect();
        return rect.top >= nav.top && rect.bottom <= nav.bottom;
      }),
    )
    .toBe(true);
  await sidebar.evaluate((element) =>
    element.setAttribute("data-persistence-test", "original"),
  );
  await next.evaluate((element) => {
    const nav = element.parentElement!;
    nav.scrollTop +=
      element.getBoundingClientRect().top -
      nav.getBoundingClientRect().top -
      120;
  });
  const scrollTop = await sidebar
    .locator("nav")
    .evaluate((element) => element.scrollTop);
  await page.evaluate(() => window.scrollTo({ top: 700, behavior: "instant" }));
  await next.click();
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await expect(current).toHaveAttribute("href", href!);
  await expect(sidebar).toHaveAttribute("data-persistence-test", "original");
  expect(
    await sidebar.locator("nav").evaluate((element) => element.scrollTop),
  ).toBeCloseTo(scrollTop, 0);
});

test("the last sidebar item is reachable at page top after resizing while scrolled", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1360, height: 760 });
  await page.goto("/courses/maths/higher-mathematics/7.3/");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(".reading-sidebar [aria-current]")).toBeVisible();
  await page.evaluate(() => window.scrollTo({ top: 700, behavior: "instant" }));
  await page.setViewportSize({ width: 1360, height: 740 });
  await expect
    .poll(() =>
      page.locator(".reading-sidebar").evaluate((rail) => {
        const offset = parseFloat(
          (rail as HTMLElement).style.getPropertyValue("--reading-rail-offset"),
        );
        return offset > 150;
      }),
    )
    .toBe(true);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  const nav = page.locator(".reading-sidebar nav");
  await nav.hover();
  await page.mouse.wheel(0, 3000);
  await expect
    .poll(() =>
      nav.evaluate((element) => {
        const last = element.lastElementChild!.getBoundingClientRect();
        const rect = element.getBoundingClientRect();
        return (
          last.top >= rect.top &&
          last.bottom <= rect.bottom &&
          rect.bottom <= innerHeight
        );
      }),
    )
    .toBe(true);
  expect(await page.evaluate(() => scrollY)).toBe(0);
});
