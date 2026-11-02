import { test, expect } from "@playwright/test";
import { renderMarkdownSource } from "../../src/lib/markdown/render";

test("runtime Markdown normalizes demo blocks and preserves ICU updates", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/demos/normal/*.json", async (route) => {
    const response = await route.fetch();
    const record = await response.json();
    record.title = renderMarkdownSource("# 正态 **实验**", {
      mode: "single-line",
      linkPolicy: "plain",
    });
    record.messages.intro =
      "# 观察曲线\n\n$$\nx^2\n$$\n\n```txt\none\ntwo\n```\n\n| a | b |\n|---|---|\n| c | d |";
    record.messages.conclusion = "**当前概率 {value}**，$P={value}$。";
    record.messages.reset = "**恢复标准正态**";
    record.messages.graphLabel =
      "**均值** {mu}，标准差 {sigma}，区间 {z}，概率 {value}";
    await route.fulfill({ response, json: record });
  });
  await page.goto("/demos/?demo=normal");
  const demo = page.locator('[data-lab-demo="normal"] .interactive-demo');
  await expect(demo).toBeVisible();
  await expect(demo.locator(".demo-header h3")).toHaveText("正态 实验");
  await expect(demo.locator(".demo-header h3 strong").first()).toBeVisible();
  const intro = demo.locator(".demo-intro");
  await expect(intro.locator("strong")).toHaveText("观察曲线");
  await expect(intro.locator("code")).toHaveText("one two");
  await expect(intro).toContainText("a · b；c · d");
  await expect(intro.locator(".katex")).toBeVisible();
  await expect(intro.locator("h1,h2,pre,table,.katex-display")).toHaveCount(0);
  await expect(demo.locator('svg[role="img"]')).not.toHaveAttribute(
    "aria-label",
    /\*\*/,
  );
  const conclusion = demo.locator(".demo-conclusion");
  await expect(conclusion.locator("strong")).toContainText("当前概率");
  const before = await conclusion.innerText();
  await demo.getByRole("slider").last().focus();
  await page.keyboard.press("ArrowRight");
  await expect(conclusion).not.toHaveText(before);
  await expect(conclusion).not.toContainText("{value}");
  await expect(conclusion.locator(".katex-error")).toHaveCount(0);
  await expect(
    demo.getByRole("button", { name: "恢复标准正态" }).locator("strong"),
  ).toBeVisible();
  await testInfo.attach("markdown-demo", {
    body: await demo.screenshot(),
    contentType: "image/png",
  });
  expect(errors).toEqual([]);
});

test("nested ICU parameters retain Markdown and mathematical symbols", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/demos/fake-coin/*.json", async (route) => {
    const response = await route.fetch();
    const record = await response.json();
    for (const key of ["left", "right", "balanced"])
      record.messages[key] = "*内层* $\\alpha$";
    record.messages.first = "外层 **{outcome}**，候选 {group}。";
    record.messages.second = "再次 **{outcome}**，$x={coin}$。";
    await route.fulfill({ response, json: record });
  });
  await page.goto("/demos/?demo=fake-coin");
  const demo = page.locator('[data-lab-demo="fake-coin"] .interactive-demo');
  await expect(demo).toBeVisible();
  await demo.getByRole("button", { name: "下一次称量" }).click();
  const conclusion = demo.locator(".demo-conclusion");
  await expect(conclusion.locator("strong em")).toHaveText("内层");
  await expect(conclusion.locator(".katex .katex-html")).toHaveText("α");
  await expect(conclusion).not.toContainText("*");
  await demo.getByRole("button", { name: "下一次称量" }).click();
  await expect(conclusion.locator("strong em")).toHaveText("内层");
  await expect(conclusion.locator(".katex")).toHaveCount(2);
  await expect(conclusion.locator(".katex-error")).toHaveCount(0);
  await expect(
    conclusion.locator('annotation[encoding="application/x-tex"]').last(),
  ).not.toContainText("\\text");
  expect(errors).toEqual([]);
});
