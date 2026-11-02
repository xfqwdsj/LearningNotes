import { test, expect } from "@playwright/test";

test("knowledge folders retain their real hierarchy and can mix folders with pages", async ({
  page,
  request,
}) => {
  await page.goto("/knowledge/cs/programming/");
  await expect(
    page.locator('.collection-grid a[href="/knowledge/cs/programming/c/"]'),
  ).toBeVisible();
  await expect(
    page.locator(
      '.collection-grid a[href="/knowledge/cs/programming/python/"]',
    ),
  ).toBeVisible();
  await expect(
    page.locator(
      '.document-list a[href="/knowledge/cs/programming/fixture-operator-precedence/"]',
    ),
  ).toBeVisible();
  await page.goto("/knowledge/cs/programming/c/fixture-operator-precedence/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "C 运算符优先级",
  );
  await expect(
    page.locator('.breadcrumbs a[href="/knowledge/cs/programming/c/"]'),
  ).toBeVisible();
  await page.goto(
    "/knowledge/cs/programming/python/fixture-operator-precedence/",
  );
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Python 运算符优先级",
  );
  expect(
    (await request.get("/knowledge/operator-precedence.md")).status(),
  ).toBe(404);
});

test("omitted semantic headings never decorate the first imported child", async ({
  page,
}) => {
  await page.goto("/courses/cs/csintro/fixture-4.1/");
  await expect(
    page.getByRole("heading", { name: "步长决定方向和间隔", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".content-inclusion .has-slot-badge")).toHaveCount(
    0,
  );
  await page.goto("/knowledge/cs/programming/python/fixture-sequences/");
  await expect(
    page.locator('.inline-section-heading[data-slot="knowledge.properties"]'),
  ).toHaveCount(1);
  const ordinary = page.locator(".inline-section-heading").filter({
    has: page.getByRole("heading", {
      name: "步长决定方向和间隔",
      exact: true,
    }),
  });
  await expect(ordinary).not.toHaveClass(/has-slot-badge/);
});

test("task slots use semantic markers without adding section surfaces", async ({
  page,
}) => {
  await page.goto(
    "/private/tasks/maths/linear-algebra/assignment/fixture-slots/",
  );
  const headings = page.locator('.inline-section-heading[data-slot^="task."]');
  await expect(headings).toHaveCount(8);
  expect(
    new Set(
      await headings.evaluateAll((elements) =>
        elements.map((element) =>
          getComputedStyle(element).getPropertyValue("--slot-accent").trim(),
        ),
      ),
    ).size,
  ).toBe(8);
  await expect(page.locator(".section-slot-badge")).toHaveCount(7);
  expect(
    new Set(
      await page
        .locator(".semantic-section[data-slot]")
        .evaluateAll((elements) =>
          elements.map((element) => getComputedStyle(element).backgroundColor),
        ),
    ),
  ).toEqual(new Set(["rgba(0, 0, 0, 0)"]));
  const setBadges = page.locator(".problem-set-header .section-kind-badge");
  expect(
    await setBadges.evaluateAll((elements) =>
      elements
        .map((element) => element.getAttribute("aria-label"))
        .filter(Boolean),
    ),
  ).toEqual(["反馈"]);
  const workHeading = page.locator(
    '.inline-section-heading[data-slot="task.work"]',
  );
  const workActions = workHeading.locator(".inline-section-actions");
  const directAction = workActions.getByRole("button", {
    name: "复制本节链接",
    exact: true,
  });
  if (await directAction.count()) {
    expect(
      await workActions.evaluate(
        (element) => getComputedStyle(element).opacity,
      ),
    ).toBe("0");
    await workHeading.hover();
    await expect
      .poll(() =>
        workActions.evaluate((element) => getComputedStyle(element).opacity),
      )
      .toBe("1");
  } else {
    await expect(
      workActions.getByRole("button", { name: "本节操作", exact: true }),
    ).toHaveCount(1);
  }
});

test("inclusion source hints render Markdown titles", async ({ page }) => {
  await page.goto("/courses/maths/prob-stat/fixture-6.2/");
  const fSource = page.locator(
    '.inclusion-source a[href="/knowledge/maths/statistics/fixture-f-distribution/#definition"]',
  );
  await expect(fSource).toBeVisible();
  await expect(fSource.locator(".katex")).toBeVisible();
  await expect(fSource).not.toContainText("$");
});

test("language and calculus explorations respond through native controls", async ({
  page,
}) => {
  await page.goto("/knowledge/cs/data-representation/fixture-twos-complement/");
  let demo = page.locator(".interactive-demo");
  await demo.getByRole("button", { name: "切换第 7 位", exact: true }).click();
  await expect(demo.locator(".demo-conclusion")).toContainText("-115");
  for (const theme of ["深色", "浅色"]) {
    await page.getByRole("button", { name: "切换主题" }).click();
    await page.getByRole("menuitem", { name: theme, exact: true }).click();
    await page.waitForTimeout(350);
    for (const position of [7, 0]) {
      const button = demo.getByRole("button", {
        name: `切换第 ${position} 位`,
        exact: true,
      });
      const colors = await button.evaluate((element) => ({
        button: getComputedStyle(element).color,
        value: getComputedStyle(element.querySelector("strong")!).color,
      }));
      expect(colors.value).toBe(colors.button);
    }
  }
  await page.goto("/knowledge/cs/programming/python/fixture-sequences/");
  demo = page.locator(".interactive-demo");
  await expect(demo.locator("output")).toContainText("'b', 'd', 'f'");
  await demo.getByRole("button", { name: "试试反向间隔取值" }).click();
  await expect(demo.locator("output")).toContainText("'g', 'e', 'c', 'a'");
  await demo.getByRole("spinbutton", { name: "步长step" }).fill("0");
  await expect(demo.getByRole("alert")).toContainText("步长不能为零");
  await page.goto("/knowledge/cs/programming/c/fixture-pointers-arrays/");
  demo = page.locator(".interactive-demo");
  await demo.getByRole("slider").focus();
  await page.keyboard.press("End");
  await expect(demo.locator(".demo-conclusion")).toContainText("不能解引用");
  await page.goto("/knowledge/maths/probability/fixture-bayes-theorem/");
  demo = page.locator(".interactive-demo");
  await expect(demo.locator(".demo-conclusion")).toContainText("66.7");
  await expect(demo.locator(".katex-error")).toHaveCount(0);
  await demo.getByRole("slider").first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(demo.locator(".demo-conclusion")).not.toContainText("66.7");
  await page.goto(
    "/knowledge/maths/multivariable-calculus/fixture-directional-derivative-gradient/",
  );
  demo = page.locator(".interactive-demo");
  await demo.getByRole("slider").focus();
  await page.keyboard.press("Home");
  await expect(demo.locator(".demo-conclusion")).toContainText("2");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > innerWidth + 1,
  );
  expect(overflow).toBe(false);
});

test("stack, cross product, and sampling explorations preserve their mathematical state", async ({
  page,
}) => {
  await page.goto(
    "/knowledge/cs/computer-architecture/fixture-function-call-stack/",
  );
  let demo = page.locator(".interactive-demo");
  await demo.getByRole("button", { name: "下一步", exact: true }).click();
  await expect(demo.locator(".demo-conclusion")).toContainText("3");
  for (let index = 0; index < 8; index++)
    await demo.getByRole("button", { name: "下一步", exact: true }).click();
  await expect(demo.locator(".demo-conclusion")).toContainText("24");
  await expect(
    demo.getByRole("button", { name: "下一步", exact: true }),
  ).toBeDisabled();
  await page.goto(
    "/knowledge/maths/analytic-geometry/fixture-vector-products/",
  );
  demo = page.locator(".interactive-demo");
  await demo.getByRole("slider").last().focus();
  await page.keyboard.press("Home");
  await expect(demo.locator(".demo-conclusion")).toContainText("共线");
  await page.keyboard.press("ArrowRight");
  await expect(demo.locator(".demo-conclusion")).toContainText("背离");
  await page.goto(
    "/knowledge/maths/probability/fixture-central-limit-theorem/",
  );
  demo = page.locator(".interactive-demo");
  await demo.getByRole("slider").focus();
  await page.keyboard.press("End");
  await expect(demo.locator(".demo-conclusion")).toContainText("32");
  await demo.getByRole("button", { name: "标准化", exact: true }).click();
  await expect(
    demo.getByRole("button", { name: "标准化", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  const bars = await demo
    .locator("svg > rect")
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("height")));
  await demo.getByRole("button", { name: "重新抽样", exact: true }).click();
  expect(
    await demo
      .locator("svg > rect")
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("height"))),
  ).not.toEqual(bars);
  await expect(demo.locator(".katex-error")).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 1,
    ),
  ).toBe(false);
});
