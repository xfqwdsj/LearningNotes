import { test, expect } from "@playwright/test";

test("computed demo SVGs hydrate without attribute mismatches", async ({
  page,
}) => {
  const mismatches: string[] = [];
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      /hydrat|server rendered HTML|didn't match|did not match/i.test(
        message.text(),
      )
    )
      mismatches.push(message.text());
  });

  for (const path of [
    "/knowledge/maths/limits/fixture-discontinuity/",
    "/knowledge/maths/limits/fixture-equivalent-infinitesimals/",
    "/knowledge/maths/statistics/fixture-one-sample-variance-test/",
    "/knowledge/maths/statistics/fixture-one-sample-tests/",
    "/knowledge/maths/statistics/fixture-p-value/",
    "/knowledge/maths/limits/fixture-power-exponential-function/",
    "/knowledge/maths/statistics/fixture-upper-tail-quantile/",
    "/knowledge/maths/statistics/fixture-sampling-distributions/",
    "/knowledge/maths/limits/fixture-important-limits/",
    "/knowledge/maths/statistics/fixture-t-distribution/",
    "/knowledge/maths/derivatives/fixture-taylor-formula/",
    "/knowledge/maths/statistics/fixture-two-sample-tests/",
  ]) {
    await page.goto(path);
    await expect(page.locator(".interactive-demo svg").first()).toBeVisible();
  }
  expect(mismatches).toEqual([]);
});

test("new interactive demos answer their stated question", async ({ page }) => {
  await page.goto("/knowledge/maths/integrals/fixture-definite-integral/");
  const riemann = page.locator(".interactive-demo");
  await expect(riemann).toBeVisible();
  await expect(riemann.getByText("4 个矩形")).toBeVisible();
  await riemann.getByRole("slider").first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(riemann.getByText("5 个矩形")).toBeVisible();
  await expect(riemann.locator(".demo-conclusion")).not.toContainText(
    "conclusion",
  );

  await page.goto("/knowledge/maths/derivatives/fixture-taylor-formula/");
  const taylor = page.locator(".interactive-demo");
  await expect(taylor.getByText("3 次").first()).toBeVisible();
  await taylor.getByRole("slider").first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(taylor.getByText("5 次").first()).toBeVisible();
  await expect(taylor.locator(".demo-conclusion")).not.toContainText(
    "conclusion",
  );

  await page.goto(
    "/knowledge/maths/probability/fixture-continuous-distributions/",
  );
  const density = page.locator(".interactive-demo");
  await expect(density.locator(".demo-conclusion")).toContainText("密度高度");
  await density.getByRole("slider").first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(density.locator(".demo-conclusion")).toContainText("密度高度");
  await expect(density.locator(".demo-conclusion")).not.toContainText(
    "conclusion",
  );

  await page.goto("/knowledge/cs/data-representation/fixture-floating-point/");
  const float = page.locator(".interactive-demo");
  await expect(
    float.getByText("float32", { exact: true }).first(),
  ).toBeVisible();
  await page.getByLabel("十进制数值").fill("0.2");
  await expect(float.locator(".demo-conclusion")).toContainText("还原值");
  await expect(float.locator(".demo-conclusion")).not.toContainText("inexact");

  await page.goto(
    "/knowledge/maths/trigonometry/fixture-angles-and-functions/",
  );
  const circle = page.locator(".interactive-demo");
  await expect(circle).toBeVisible();
  await expect(circle.locator(".demo-conclusion")).toContainText("cos");
  await circle.getByRole("slider").first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(circle.locator(".demo-conclusion")).not.toContainText("result");

  await page.goto("/knowledge/maths/trigonometry/fixture-inverse-functions/");
  const inverse = page.locator(".interactive-demo");
  await expect(inverse).toBeVisible();
  await expect(inverse.locator(".demo-conclusion")).toContainText("主值角");
  await expect(inverse.locator(".demo-conclusion")).not.toContainText("result");

  await page.goto(
    "/knowledge/maths/trigonometry/fixture-derivatives-integrals/",
  );
  const trig = page.locator(".interactive-demo");
  await expect(trig).toBeVisible();
  await trig.getByRole("slider").first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(trig.locator(".demo-conclusion")).toContainText("切线斜率");
  await expect(trig.locator(".demo-conclusion")).not.toContainText("result");
});

test("practice controls and the exploration demo both render", async ({
  page,
}) => {
  await page.goto("/knowledge/maths/limits/fixture-continuity/");
  const footer = page.locator(".problem-set-footer").first();
  const demo = page.locator(".interactive-demo");
  await expect(
    footer.getByRole("button", { name: "清空本题集", exact: true }),
  ).toBeVisible();
  await expect(demo).toBeVisible();
});

test("statistics demos visualize their changing models", async ({ page }) => {
  await page.goto("/knowledge/maths/statistics/fixture-moment-estimation/");
  const moment = page.locator(".interactive-demo");
  const momentGraph = moment.locator("svg[role='img']");
  await expect(momentGraph).toBeVisible();
  await expect(moment.getByRole("slider")).toHaveCount(3);
  await expect(momentGraph.locator("circle")).toHaveCount(3);
  await expect(momentGraph.locator("rect")).toBeVisible();
  await expect(moment.locator(".demo-conclusion")).toContainText("拟合区间");

  await page.goto("/knowledge/maths/statistics/fixture-f-distribution/");
  const fDistribution = page.locator(".interactive-demo");
  const graph = fDistribution.locator("svg[role='img']");
  await expect(graph).toBeVisible();
  await expect(fDistribution.getByRole("slider")).toHaveCount(2);
  await expect(fDistribution.locator(".demo-range .katex")).toHaveCount(2);
  await expect(fDistribution.locator(".demo-controls")).not.toContainText("$");
  const reference = graph.locator('line[stroke-dasharray="4 4"]');
  const x = Number(await reference.getAttribute("x1"));
  const tick = graph
    .locator("foreignObject")
    .filter({
      has: page
        .locator('annotation[encoding="application/x-tex"]')
        .filter({ hasText: /^1$/ }),
    })
    .first();
  await expect(tick).toBeVisible();
  expect(
    Number(await tick.getAttribute("x")) +
      Number(await tick.getAttribute("width")) / 2,
  ).toBe(x);
  await expect(tick.locator(".demo-graph-formula")).toHaveCSS(
    "text-align",
    "center",
  );

  await expect(graph.locator('path[stroke-dasharray="7 4"]')).toBeVisible();
  const before = await graph.getAttribute("aria-label");
  await fDistribution.getByRole("slider").first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(graph).not.toHaveAttribute("aria-label", before ?? "");
});

test("calculus and geometry demos render their mathematical objects", async ({
  page,
}) => {
  test.slow();
  const pages = [
    "/knowledge/maths/trigonometry/fixture-angle-transformations/",
    "/knowledge/maths/trigonometry/fixture-basic-identities/",
    "/knowledge/maths/trigonometry/fixture-reduction-formulas/",
    "/knowledge/maths/analytic-geometry/fixture-vectors/",
    "/knowledge/maths/analytic-geometry/fixture-dot-product/",
    "/knowledge/maths/analytic-geometry/fixture-space-curves/",
    "/knowledge/maths/analytic-geometry/fixture-mixed-product/",
    "/knowledge/maths/analytic-geometry/fixture-line-in-space/",
    "/knowledge/maths/analytic-geometry/fixture-cylinder-surface/",
    "/knowledge/maths/analytic-geometry/fixture-revolution-surface/",
    "/knowledge/maths/analytic-geometry/fixture-quadrics/",
    "/knowledge/maths/line-integrals/fixture-line-integral-arc-length/",
    "/knowledge/maths/line-integrals/fixture-boundary-orientation/",
    "/knowledge/maths/line-integrals/fixture-greens-theorem/",
    "/knowledge/maths/line-integrals/fixture-path-independence/",
    "/knowledge/maths/line-integrals/fixture-line-integral-coordinates/",
    "/knowledge/maths/integrals/fixture-area-between-curves/",
    "/knowledge/maths/integrals/fixture-definite-integral-computation/",
    "/knowledge/maths/integrals/fixture-integration-applications/",
    "/knowledge/maths/integrals/fixture-variable-force-work/",
    "/knowledge/maths/integrals/fixture-integration-by-substitution/",
    "/knowledge/maths/integrals/fixture-integration-by-parts/",
    "/knowledge/maths/integrals/fixture-newton-leibniz/",
    "/knowledge/maths/integrals/fixture-fundamental-theorem-of-calculus/",
    "/knowledge/maths/integrals/fixture-gamma-function/",
    "/knowledge/maths/integrals/fixture-wallis-formula/",
    "/knowledge/maths/integrals/fixture-improper-integral/",
    "/knowledge/maths/integrals/fixture-solid-of-revolution/",
    "/knowledge/maths/series/fixture-absolute-convergence/",
    "/knowledge/maths/series/fixture-cauchy-product/",
    "/knowledge/maths/series/fixture-series-convergence-tests/",
    "/knowledge/maths/derivatives/fixture-mean-value-theorems/",
    "/knowledge/maths/derivatives/fixture-cauchy-mean-value/",
    "/knowledge/maths/derivatives/fixture-rolle-theorem/",
    "/knowledge/maths/derivatives/fixture-chain-rule/",
    "/knowledge/maths/derivatives/fixture-differential/",
    "/knowledge/maths/derivatives/fixture-implicit-differentiation/",
    "/knowledge/maths/derivatives/fixture-parametric-derivative/",
    "/knowledge/maths/derivatives/fixture-inverse-function-derivative/",
    "/knowledge/maths/differential-equations/fixture-differential-equation-basics/",
    "/knowledge/maths/differential-equations/fixture-separable-differential-equation/",
    "/knowledge/maths/differential-equations/fixture-homogeneous-differential-equation/",
    "/knowledge/maths/multivariable-calculus/fixture-multivariable-functions/",
    "/knowledge/maths/multivariable-calculus/fixture-multivariable-limit/",
    "/knowledge/maths/multivariable-calculus/fixture-multivariable-continuity/",
    "/knowledge/maths/multivariable-calculus/fixture-multivariable-extrema/",
    "/knowledge/maths/multivariable-calculus/fixture-global-extrema/",
    "/knowledge/maths/multivariable-calculus/fixture-constrained-extrema/",
    "/knowledge/maths/multivariable-calculus/fixture-total-differential/",
    "/knowledge/maths/multivariable-calculus/fixture-point-sets/",
    "/knowledge/maths/multivariable-calculus/fixture-multivariable-chain-rule/",
    "/knowledge/maths/multivariable-calculus/fixture-space-curve-tangent/",
    "/knowledge/maths/multivariable-calculus/fixture-differential-geometry-applications/",
    "/knowledge/maths/multivariable-calculus/fixture-implicit-function-theorem/",
    "/knowledge/maths/multivariable-calculus/fixture-surface-tangent-plane/",
    "/knowledge/maths/multiple-integrals/fixture-double-integral/",
    "/knowledge/maths/multiple-integrals/fixture-double-integral-computation/",
    "/knowledge/maths/multiple-integrals/fixture-iterated-integral/",
    "/knowledge/maths/multiple-integrals/fixture-polar-double-integral/",
    "/knowledge/maths/multiple-integrals/fixture-triple-integral/",
    "/knowledge/maths/multiple-integrals/fixture-triple-integral-cartesian/",
    "/knowledge/maths/multiple-integrals/fixture-triple-integral-cylindrical/",
    "/knowledge/maths/multiple-integrals/fixture-triple-integral-spherical/",
  ];

  for (const href of pages) {
    await page.goto(href);
    const demo = page.locator(".interactive-demo");
    await expect(demo.locator("svg[role='img']"), href).toBeVisible();
    await expect(
      demo.locator("fieldset button, fieldset [role='slider']").first(),
      href,
    ).toBeVisible();
  }
});

test("process demo renders transitions and advances its state", async ({
  page,
}) => {
  await page.goto("/knowledge/cs/operating-systems/fixture-process/");
  const demo = page.locator(".interactive-demo");
  const graph = demo.locator("svg[role='img']");

  await expect(graph).toBeVisible();
  await expect(graph.locator("rect")).toHaveCount(5);
  await expect(
    graph.locator("path[marker-end='url(#process-arrow)']"),
  ).toHaveCount(3);

  await demo.getByRole("button", { name: "接纳进就绪队列" }).click();
  await expect(graph).toHaveAttribute("aria-label", /就绪/);
  await demo.getByRole("button", { name: "调度运行" }).click();
  await expect(graph).toHaveAttribute("aria-label", /运行/);
  await demo.getByRole("button", { name: "等待I/O" }).click();
  await expect(graph).toHaveAttribute("aria-label", /阻塞/);
  await demo.getByRole("button", { name: "I/O完成" }).click();
  await expect(graph).toHaveAttribute("aria-label", /就绪/);
});

test("new Python and probability demos expose their object relations", async ({
  page,
}) => {
  await page.goto("/knowledge/cs/programming/python/fixture-mutability/");
  const mutability = page.locator(".interactive-demo");
  const objectGraph = mutability.locator("svg[role='img']");
  await expect(objectGraph).toBeVisible();
  await expect(objectGraph.locator("rect")).toHaveCount(3);
  await mutability.getByRole("button", { name: "复制列表" }).click();
  await expect(objectGraph.locator("rect")).toHaveCount(4);
  await expect(objectGraph).toHaveAttribute("aria-label", /复制列表/);

  await page.goto(
    "/knowledge/maths/probability/fixture-conditional-probability/",
  );
  const conditional = page.locator(".interactive-demo");
  const sampleSpace = conditional.locator("svg[role='img']");
  await expect(sampleSpace).toBeVisible();
  await expect(sampleSpace.locator("rect")).toHaveCount(8);
  const before = await sampleSpace.getAttribute("aria-label");
  await conditional.getByRole("slider").nth(1).focus();
  await page.keyboard.press("ArrowLeft");
  await expect(sampleSpace).not.toHaveAttribute("aria-label", before ?? "");

  await page.goto("/knowledge/maths/probability/fixture-random-events/");
  const events = page.locator(".interactive-demo").getByRole("img");
  await expect(events).toBeVisible();
  await expect(events).toHaveAttribute("aria-label", /并集/);

  await page.goto("/knowledge/maths/probability/fixture-event-partition/");
  const partition = page.locator(".interactive-demo").getByRole("img");
  await expect(partition).toBeVisible();
  await expect(partition).toHaveAttribute("aria-label", /六个样本点/);

  await page.goto("/knowledge/maths/probability/fixture-indicator-variable/");
  const indicator = page.locator(".interactive-demo");
  const indicatorGraph = indicator.locator("svg[role='img']");
  await expect(indicatorGraph).toBeVisible();
  const indicatorBefore = await indicatorGraph.getAttribute("aria-label");
  await indicator.getByRole("button", { name: "第 1 次结果" }).click();
  await expect(indicatorGraph).not.toHaveAttribute(
    "aria-label",
    indicatorBefore ?? "",
  );
});
