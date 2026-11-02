import { test, expect } from "@playwright/test";

test("Chinese UI localizes navigation, dialogs and content language independently", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await page.getByRole("button", { name: /搜索知识/ }).click();
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("button", { name: "关闭", exact: true }),
  ).toBeVisible();
  await expect(dialog).not.toContainText("Search for a command");
  await page.keyboard.press("Escape");
  await page.goto("/knowledge/maths/limits/continuity/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveAttribute(
    "lang",
    "zh-CN",
  );
  await expect(page.locator('link[hreflang="zh-CN"]')).toHaveAttribute(
    "href",
    /\/knowledge\/maths\/limits\/continuity\/$/,
  );
  await expect(page.locator('link[hreflang="en"]')).toHaveCount(0);
  await page.getByRole("button", { name: "讨论", exact: true }).click();
  await expect(page.getByRole("menu")).toContainText("附加内容");
  await expect(page.getByRole("menu")).toContainText("在线助手");
  await page.goto("/private/tasks/");
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("学习任务");
});
