import { test, expect } from "@playwright/test";
import { contentAction } from "./actions";
test("home, theme, navigation and search", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("连接");
  await expect(page.locator("body")).not.toHaveJSProperty("scrollWidth", 0);
  await page.getByRole("button", { name: "切换主题" }).click();
  await page.getByRole("menuitem", { name: "深色" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.getByRole("button", { name: /搜索知识/ }).click();
  await page.getByPlaceholder("搜索知识点，或输入任务ID…").fill("夹具检索词");
  await expect(
    page
      .getByRole("dialog")
      .locator('a[href="/knowledge/maths/limits/fixture-continuity/"]'),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await page.goto("/knowledge/maths/limits/fixture-continuity/");
  await expect(page.locator("#definition")).toBeVisible();
  await expect(page.locator(".katex").first()).toBeVisible();
  const response = await page.request.get(
    "/knowledge/maths/limits/fixture-continuity.md",
  );
  expect(response.ok()).toBe(true);
  expect(await response.text()).toContain("夹具检索词");
  await expect(
    page.locator('link[rel="alternate"][type="text/markdown"]'),
  ).toHaveAttribute("href", /fixture-continuity\.md/);
});
test("mobile has no horizontal page overflow", async ({ page }) => {
  await page.goto("/courses/maths/higher-mathematics/fixture-11.1/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "移动布局示例",
  );
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth + 1,
  );
  expect(overflow).toBe(false);
});
test("private build assets use their own prefix", async ({ page }) => {
  await page.goto("/private/tasks/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("学习任务");
  const sources = await page
    .locator("script[src]")
    .evaluateAll((scripts) =>
      scripts.map((script) => script.getAttribute("src")),
    );
  expect(
    sources.filter(Boolean).every((src) => src?.startsWith("/private/")),
  ).toBe(true);
});

test("interactive demo has no duplicate title and observation uses a GitHub note", async ({
  page,
}) => {
  await page.goto("/knowledge/maths/limits/fixture-continuity/");
  const demo = page.locator(".interactive-demo");
  await expect(demo.getByText("交互探索", { exact: true })).toHaveCount(0);
  const note = page.locator(".mdx-alert-note");
  await expect(note).toBeVisible();
  await expect(note.locator(".mdx-alert-title")).toHaveText("备注");
  await expect(note).toContainText("观察什么");
});

test("interactive demo hydrates", async ({ page }) => {
  await page.goto("/knowledge/maths/limits/fixture-continuity/");
  const demo = page.locator(".interactive-demo");
  await demo.getByRole("slider").focus();
  await page.keyboard.press("ArrowRight");
  await expect(demo.locator(".demo-status")).toHaveText("不连续");
  await demo.getByRole("button").click();
  await expect(demo.locator(".demo-status")).toHaveText("连续");
});

test("partial formula selection copies full TeX source", async ({ page }) => {
  await page.goto("/knowledge/maths/limits/fixture-continuity/");
  await page.waitForLoadState("networkidle");
  const copied = await page.evaluate(() => {
    const target = document.querySelector(".katex-display .katex-html .mord");
    if (!target) throw new Error("Formula missing");
    const range = document.createRange();
    range.selectNodeContents(target);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    const data = new DataTransfer();
    document.dispatchEvent(
      new ClipboardEvent("copy", {
        clipboardData: data,
        bubbles: true,
        cancelable: true,
      }),
    );
    return data.getData("text/plain");
  });
  expect(copied).toContain("\\lim");
  expect(copied).toContain("f(x_0)");
});

test("course hierarchy and reader return links", async ({ page }) => {
  await page.goto("/courses/");
  await page
    .locator(".collection-grid")
    .getByRole("link", { name: /数学/ })
    .click();
  await expect(page).toHaveURL(/\/courses\/maths\//);
  await page
    .locator(".collection-grid")
    .getByRole("link", { name: /高等数学/ })
    .click();
  await expect(page).toHaveURL(/\/courses\/maths\/higher-mathematics\//);
  await page
    .locator(
      '.document-list a[href="/courses/maths/higher-mathematics/fixture-11.1"]',
    )
    .click();
  const parent = page.locator(
    '.breadcrumbs a[href="/courses/maths/higher-mathematics/"]',
  );
  await expect(parent).toBeVisible();
  await parent.click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "高等数学",
  );
});
test("knowledge pages and mathematical summaries render", async ({ page }) => {
  const response = await page.goto(
    "/knowledge/maths/trigonometry/fixture-angles-and-functions/",
  );
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "样例页面 fixture-angles-and-functions",
  );
  await page.goto("/courses/maths/higher-mathematics/");
  await expect(page.locator(".summary-math .katex").first()).toBeVisible();
});
test("graph hover preserves node center and exposes a useful destination", async ({
  page,
}) => {
  await page.goto("/");
  const node = page.getByRole("button", { name: "应用", exact: true });
  await node.scrollIntoViewIfNeeded();
  const before = await node.boundingBox();
  const beforeScroll = await page.evaluate(() => scrollY);
  await node.hover();
  await expect(node).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".orbit-detail a")).toHaveAttribute(
    "href",
    "/demos/",
  );
  await page.waitForTimeout(300);
  const after = await node.boundingBox();
  const afterScroll = await page.evaluate(() => scrollY);
  if (!before || !after) throw new Error("Node missing");
  expect(
    Math.abs(before.x + before.width / 2 - after.x - after.width / 2),
  ).toBeLessThan(1);
  expect(
    Math.abs(
      before.y +
        beforeScroll +
        before.height / 2 -
        after.y -
        afterScroll -
        after.height / 2,
    ),
  ).toBeLessThan(1);
});
test("home demo loads on scroll and mobile navigation closes", async ({
  page,
  isMobile,
}) => {
  await page.goto("/");
  await page.locator("#learning-path").scrollIntoViewIfNeeded();
  await expect(
    page.locator(".home-demo-stage .interactive-demo"),
  ).toBeVisible();
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth + 1,
  );
  expect(overflow).toBe(false);
  if (isMobile) {
    await page.getByRole("button", { name: "打开导航" }).click();
    await page
      .getByRole("navigation", { name: "移动导航" })
      .getByRole("link", { name: "课程", exact: true })
      .click();
    await expect(
      page.getByRole("navigation", { name: "移动导航" }),
    ).not.toBeVisible();
  }
});
test("404 has breathing room and clear exit links", async ({ page }) => {
  await page.goto("/missing-page/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "换个方向",
  );
  const main = await page.locator("main").boundingBox();
  const heading = await page.locator(".not-found-code").boundingBox();
  expect((heading?.y ?? 0) - (main?.y ?? 0)).toBeGreaterThan(50);
  await expect(
    page.locator("main").getByRole("link", { name: "选择浏览方式" }),
  ).toHaveAttribute("href", "/#browse");
});

test("KaTeX fractions and superscripts use the matching current sizing CSS", async ({
  page,
}) => {
  await page.goto("/knowledge/maths/integrals/fixture-integral-formulas/");
  const formula = page.locator(".katex").filter({ hasText: "arctan" }).last();
  await expect(formula).toBeVisible();
  const sizes = await formula.evaluate((element) => ({
    root: parseFloat(getComputedStyle(element).fontSize),
    nested: [...element.querySelectorAll(".katex-sizing")].map((node) =>
      parseFloat(getComputedStyle(node).fontSize),
    ),
    obsolete: element.querySelectorAll(".sizing").length,
  }));
  expect(sizes.obsolete).toBe(0);
  expect(sizes.nested.some((size) => size < sizes.root * 0.8)).toBe(true);
});

test("heading links copy their exact anchor", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: async (text: string) => {
          document.documentElement.dataset["clipboard"] = text;
        },
      },
    });
  });
  await page.goto("/knowledge/maths/limits/fixture-continuity/");
  const section = page
    .locator(".inline-section-heading")
    .filter({ has: page.locator("#definition") });
  await section.hover();
  const link = await contentAction(page, section, "复制本节链接");
  await link.click();
  await expect(page.locator("html")).toHaveAttribute(
    "data-clipboard",
    /\/knowledge\/maths\/limits\/fixture-continuity\/#definition$/,
  );
});

test("code frames show language, title, line numbers and copy only the source", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: async (text: string) => {
          document.documentElement.dataset["clipboard"] = text;
        },
      },
    });
  });
  await page.goto(
    "/knowledge/cs/data-representation/fixture-number-base-conversion/",
  );
  const block = page.locator(".expressive-code").first();
  await expect(block.locator(".title")).toContainText("示例代码.py");
  await expect(block.locator(".frame[data-language='python']")).toBeVisible();
  await expect(block.locator(".ln").first()).toBeVisible();
  await expect(block.locator(".ec-line.mark")).toHaveCount(1);
  await expect(block.locator(".ec-line.ins")).toHaveCount(1);
  await expect(block.locator(".code-copy")).toBeAttached();
  const layout = await block.evaluate((element) => {
    const pre = element.querySelector("pre");
    const firstLine = element.querySelector(".ec-line");
    const firstCode = firstLine?.querySelector(".code");
    const markedLines = [
      ...element.querySelectorAll(".ec-line.mark, .ec-line.ins"),
    ];
    const button = element.querySelector<HTMLElement>(".code-copy");
    if (!pre || !firstLine || !firstCode || !button || !markedLines.length)
      throw new Error("Code frame controls missing");
    const preStyle = getComputedStyle(pre);
    const codeStyle = getComputedStyle(firstCode);
    const buttonStyle = getComputedStyle(button);
    const preRect = pre.getBoundingClientRect();
    const codeRect = firstCode.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    return {
      prePaddingEnd: parseFloat(preStyle.paddingInlineEnd),
      codePaddingEnd: parseFloat(codeStyle.paddingInlineEnd),
      preInnerRight:
        preRect.right -
        parseFloat(preStyle.borderRightWidth) -
        parseFloat(preStyle.paddingInlineEnd),
      preOuterInnerRight: preRect.right - parseFloat(preStyle.borderRightWidth),
      markedLineRights: markedLines.map(
        (line) => line.getBoundingClientRect().right,
      ),
      codeContentRight:
        codeRect.right -
        parseFloat(codeStyle.borderRightWidth) -
        parseFloat(codeStyle.paddingInlineEnd),
      buttonLeft:
        buttonRect.left -
        parseFloat(buttonStyle.borderLeftWidth) -
        parseFloat(buttonStyle.paddingLeft),
    };
  });
  expect(layout.prePaddingEnd).toBe(0);
  expect(layout.codePaddingEnd).toBeGreaterThan(32);
  for (const right of layout.markedLineRights)
    expect(Math.abs(right - layout.preOuterInnerRight)).toBeLessThan(1);
  expect(layout.codeContentRight).toBeLessThanOrEqual(layout.buttonLeft);
  expect(layout.preInnerRight).toBeGreaterThanOrEqual(
    Math.max(...layout.markedLineRights) - 1,
  );
  const expectedCopy = await block
    .locator("[data-copy-code]")
    .getAttribute("data-copy-code");
  expect(expectedCopy).not.toBeNull();
  await block.getByRole("button", { name: "复制代码" }).dispatchEvent("click");
  await expect
    .poll(() => page.locator("html").getAttribute("data-clipboard"))
    .toBe(expectedCopy);
  const copied = await page.locator("html").getAttribute("data-clipboard");
  expect(copied).not.toContain("示例代码.py");
  expect(copied).not.toMatch(/^1\s+b =/);
});

test("discussion links prefill context without visiting providers", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.open = (() => {
      const target = {
        opener: null,
        close() {},
        location: {
          set href(value: string) {
            document.documentElement.dataset["discussion"] = value;
          },
        },
      };
      return target as unknown as Window;
    }) as typeof window.open;
  });
  await page.goto("/knowledge/maths/limits/fixture-continuity/");
  await page
    .locator(".article-header")
    .getByRole("button", { name: "讨论", exact: true })
    .click();
  await page.getByRole("menuitem", { name: "在Claude中讨论" }).click();
  await expect(page.locator("html")).toHaveAttribute(
    "data-discussion",
    /^https:\/\/claude.ai\/new\?q=/,
  );
  const target = await page.locator("html").getAttribute("data-discussion");
  expect(new URL(target!).searchParams.get("q")).toContain("Markdown：");
  await page
    .locator(".article-header")
    .getByRole("button", { name: "讨论", exact: true })
    .click();
  await expect(
    page.getByRole("menuitem", { name: "在Grok中讨论" }),
  ).toBeVisible();
});

test("home adapts across narrow phones and intermediate desktop widths", async ({
  page,
}) => {
  await page.goto("/");
  for (const width of [320, 360, 390, 768, 820, 1024]) {
    await page.setViewportSize({ width, height: 850 });
    const dimensions = await page.evaluate(() => ({
      width: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
    }));
    expect(dimensions.scroll, `viewport ${width}`).toBeLessThanOrEqual(
      dimensions.width + 1,
    );
  }
});

test("reader shows one breadcrumb navigation without duplicate returns", async ({
  page,
}) => {
  await page.goto("/courses/maths/higher-mathematics/fixture-11.1/");
  await expect(page.getByRole("navigation", { name: "面包屑" })).toHaveCount(1);
  await expect(
    page.locator(".reading-return, .reading-sidebar .back-link"),
  ).toHaveCount(0);
});

test("formula copy stays outside horizontal scrolling and uses the shared icon style", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: async (text: string) => {
          document.documentElement.dataset["clipboard"] = text;
        },
      },
    });
  });
  await page.goto("/knowledge/maths/limits/fixture-continuity/");
  const frame = page.locator(".math-display-frame").first();
  const scroll = frame.locator(".katex-display");
  const button = frame.getByRole("button", { name: "复制公式源码" });
  await expect(button).toBeVisible();
  await scroll.locator(":scope > .katex").evaluate((element) => {
    (element as HTMLElement).style.minWidth = "1400px";
  });
  await button.scrollIntoViewIfNeeded();
  const before = await button.boundingBox();
  await scroll.evaluate((element) => {
    element.scrollLeft = 350;
  });
  await expect
    .poll(() => scroll.evaluate((element) => element.scrollLeft))
    .toBe(350);
  const after = await button.boundingBox();
  expect(Math.abs(before!.x - after!.x)).toBeLessThan(0.5);
  expect(
    await button.evaluate((element) => element.closest(".katex-display")),
  ).toBeNull();
  const tex = await frame
    .locator('annotation[encoding="application/x-tex"]')
    .textContent();
  await button.click({ force: true });
  await expect(page.locator("html")).toHaveAttribute("data-clipboard", tex!);
  await expect
    .poll(() =>
      button.evaluate((element) => getComputedStyle(element).backdropFilter),
    )
    .toContain("blur(12px)");
  const style = await button.evaluate((element) => {
    const css = getComputedStyle(element);
    return { radius: css.borderRadius, width: css.width, height: css.height };
  });
  await page.goto(
    "/knowledge/cs/data-representation/fixture-number-base-conversion/",
  );
  const codeButton = page.getByRole("button", { name: "复制代码" }).first();
  await expect(codeButton).toBeVisible();
  await expect
    .poll(() =>
      codeButton.evaluate(
        (element) => getComputedStyle(element).backdropFilter,
      ),
    )
    .toContain("blur(12px)");
  const codeStyle = await codeButton.evaluate((element) => {
    const css = getComputedStyle(element);
    return { radius: css.borderRadius, width: css.width, height: css.height };
  });
  expect(codeStyle).toEqual(style);
});

test("heading, code and formula copy share feedback on an insecure HTTP hostname", async ({
  baseURL,
}) => {
  test.skip(
    test.info().project.name !== "chromium",
    "This test launches its own desktop browser for clipboard fallback behavior.",
  );
  const { hostname } = await import("node:os");
  const { chromium } = await import("@playwright/test");
  const host = hostname().toLowerCase();
  const port = new URL(baseURL!).port;
  const browser = await chromium.launch({
    args: [`--host-resolver-rules=MAP ${host} 127.0.0.1`],
  });
  try {
    const page = await browser.newPage();
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.addInitScript(() =>
      document.addEventListener("copy", () => {
        document.documentElement.dataset["clipboard"] =
          getSelection()?.toString() ?? "";
      }),
    );
    for (const kind of ["heading", "code", "formula"]) {
      await page.goto(
        `http://${host}:${port}/${kind === "code" ? "knowledge/cs/data-representation/fixture-number-base-conversion/" : "knowledge/maths/limits/fixture-continuity/"}`,
      );
      expect(await page.evaluate(() => window.isSecureContext)).toBe(false);
      expect(await page.evaluate(() => !!navigator.clipboard)).toBe(false);
      const button =
        kind === "heading"
          ? page.getByRole("button", { name: "复制本节链接" }).first()
          : page
              .getByRole("button", {
                name: kind === "code" ? "复制代码" : "复制公式源码",
              })
              .first();
      await button.dispatchEvent("click");
      await expect(button).toHaveAttribute("data-copy-state", "copied");
      await expect(
        page.locator("[data-sonner-toast]").filter({ hasText: "已复制" }),
      ).toBeVisible();
      expect(
        await page.locator("html").getAttribute("data-clipboard"),
      ).toBeTruthy();
    }
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});

test("copy failures use one nonblocking message instead of an exception", async ({
  page,
}) => {
  test.skip(
    test.info().project.name !== "chromium",
    "Heading copy is an inline control only in the pointer layout.",
  );
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", { value: undefined });
    document.execCommand = () => false;
  });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/knowledge/maths/limits/fixture-continuity/");
  const button = page.getByRole("button", { name: "复制本节链接" }).first();
  await button.click();
  await expect(
    page.locator("[data-sonner-toast]").filter({ hasText: "复制失败，请重试" }),
  ).toBeVisible();
  await expect(button).toHaveAttribute("data-copy-state", "idle");
  expect(errors).toEqual([]);
});
