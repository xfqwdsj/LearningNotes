import { test, expect } from "@playwright/test";
import { openDiscussion } from "./actions";

test("discussion groups stay coherent and attachment selection keeps the menu open", async ({
  page,
}) => {
  test.skip(
    test.info().project.name !== "chromium",
    "Structural menu checks run on the pointer layout; mobile uses the compact menu test.",
  );
  await page.goto("/knowledge/maths/limits/continuity/");
  const heading = page
    .locator(".inline-section-heading")
    .filter({ has: page.locator("#definition") });
  await heading.hover();
  await openDiscussion(page, heading, "讨论此节");
  const menu = page.getByRole("menu").last();
  for (const name of ["原文", "原文与链接", "链接"]) {
    await menu.getByRole("menuitemradio", { name, exact: true }).click();
    await expect(menu).toBeVisible();
    await expect(
      menu.getByRole("menuitemradio", { name, exact: true }),
    ).toHaveAttribute("aria-checked", "true");
  }
  const discussion = menu.getByRole("group", { name: "讨论方式" });
  await expect(discussion).toContainText("本地Agent");
  await expect(
    discussion.getByRole("menuitem", { name: "复制讨论提示词" }),
  ).toBeVisible();
  await expect(
    menu.locator('[data-slot="dropdown-menu-separator"]'),
  ).toHaveCount(2);
});

test("flat controls and floating layers use their intended material levels", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: async () => {} },
    }),
  );
  await page.goto("/knowledge/maths/limits/continuity/");
  const flat = page
    .locator(".article-header")
    .getByRole("button", { name: "复制原文" });
  expect(
    await flat.evaluate((element) => {
      const css = getComputedStyle(element);
      return [css.borderTopWidth, css.boxShadow, css.backdropFilter];
    }),
  ).toEqual(["0px", "none", "none"]);
  await flat.click();
  const notification = page
    .locator("[data-sonner-toast]")
    .filter({ hasText: "已复制" });
  await expect(notification).toBeVisible();
  await expect
    .poll(() =>
      notification.evaluate(
        (element) => getComputedStyle(element).backdropFilter,
      ),
    )
    .toContain("blur(16px)");
  expect(
    await notification.evaluate(
      (element) => getComputedStyle(element).boxShadow,
    ),
  ).not.toBe("none");
  await page
    .locator(".article-header")
    .getByRole("button", { name: "讨论", exact: true })
    .click();
  await expect
    .poll(() =>
      page
        .getByRole("menu")
        .evaluate((element) => getComputedStyle(element).backdropFilter),
    )
    .toContain("blur(16px)");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: /搜索知识/ }).click();
  await expect
    .poll(() =>
      page
        .getByRole("dialog")
        .evaluate((element) => getComputedStyle(element).backdropFilter),
    )
    .toContain("blur(24px)");
});

test("flat copy and discussion controls reuse the same Button variant", async ({
  page,
}) => {
  test.skip(
    test.info().project.name !== "chromium",
    "Icon layout is pointer-only; narrow screens use one menu trigger.",
  );
  await page.goto("/knowledge/maths/limits/continuity/");
  const readStyle = (element: Element) => {
    const css = getComputedStyle(element);
    return [
      css.backgroundColor,
      css.color,
      css.borderTopWidth,
      css.borderRadius,
      css.boxShadow,
      css.backdropFilter,
      css.height,
      css.fontSize,
    ];
  };
  const header = page.locator(".article-header");
  const copy = header.getByRole("button", { name: "复制原文" });
  const discuss = header.getByRole("button", { name: "讨论", exact: true });
  await expect(copy).toHaveAttribute("data-variant", "ghost");
  await expect(discuss).toHaveAttribute("data-variant", "ghost");
  expect(await copy.evaluate(readStyle)).toEqual(
    await discuss.evaluate(readStyle),
  );
  const heading = page
    .locator(".inline-section-heading")
    .filter({ has: page.locator("#definition") });
  await heading.hover();
  const buttons = heading.locator("button:visible");
  const styles = await buttons.evaluateAll((elements) =>
    elements.map((element) => {
      const css = getComputedStyle(element);
      const svg = element.querySelector("svg");
      return [
        css.width,
        css.height,
        css.borderRadius,
        css.backgroundColor,
        svg ? getComputedStyle(svg).width : "",
      ];
    }),
  );
  expect(styles).toHaveLength(4);
  expect(styles[0]).toEqual(styles[1]);
  expect(styles[1]).toEqual(styles[2]);
  expect(styles[2]).toEqual(styles[3]);
});
