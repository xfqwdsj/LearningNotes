import { test, expect } from "@playwright/test";

test("a referenced section exposes statically generated reference locations", async ({
  page,
}) => {
  await page.goto("/knowledge/maths/limits/continuity/");
  const section = page
    .locator(".inline-section-heading")
    .filter({ has: page.locator("#definition") });
  await section.hover();
  const direct = section.getByRole("button", { name: /查看引用位置/ });
  if (await direct.isVisible()) {
    await direct.click();
  } else {
    await section.getByRole("button", { name: "本节操作" }).click();
  }
  const reference = page
    .getByRole("menuitem")
    .filter({ hasText: "引用来源示例" });
  await expect(reference).toBeVisible();
  await reference.click();
  await expect(page).toHaveURL(
    /\/courses\/maths\/higher-mathematics\/1\.8\/#ref-knowledge-maths-limits-continuity-definition$/,
  );
});

test("search finds a source section and lists where it is referenced", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "搜索知识、课程与任务" }).click();
  await page.getByPlaceholder("搜索知识点，或输入任务ID…").fill("夹具检索词");
  const result = page.locator(".search-result").filter({
    has: page.locator('a[href="/knowledge/maths/limits/continuity/"]'),
  });
  await expect(result).toBeVisible();
  const references = result.locator(".search-references");
  await expect(references).toContainText("引用");
  await expect(
    references.getByRole("link", {
      name: /引用来源示例/,
    }),
  ).toBeVisible();
});
