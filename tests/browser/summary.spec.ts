import { test, expect, type Page } from "@playwright/test";

async function openArchiveList(page: Page) {
  await page.route("https://fixture.invalid/**", (route) =>
    route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800"><rect width="600" height="800" fill="#ddd"/></svg>',
    }),
  );
  await page.goto("/private/tasks/maths/higher-mathematics/assignment/");
  return page.locator(".document-row").filter({
    has: page.getByRole("link", {
      name: "任务摘要示例",
      exact: true,
    }),
  });
}

test("marked task summaries show descendants and images and animate expansion", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const trackedWindow = window as Window & {
      __summaryPreviewMaxHeight?: number;
    };
    trackedWindow.__summaryPreviewMaxHeight = 0;
    const sample = () => {
      for (const element of document.querySelectorAll(
        ".summary-preview-viewport",
      )) {
        trackedWindow.__summaryPreviewMaxHeight = Math.max(
          trackedWindow.__summaryPreviewMaxHeight ?? 0,
          element.getBoundingClientRect().height,
        );
      }
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
  const row = await openArchiveList(page);
  await expect(row.locator(".summary-preview h3").first()).toHaveText(
    "样例日期",
  );
  await expect(row.locator(".summary-preview")).toContainText(
    "2026/11/02 20:00",
  );
  await expect(row.locator(".summary-preview")).not.toContainText(
    "任务正文示例",
  );
  await expect(row.locator(".summary-preview img")).toHaveCount(2);
  const viewport = row.locator(".summary-preview-viewport");
  const expand = row.getByRole("button", { name: "展开摘要" });
  await expect(expand).toBeVisible();
  await expect
    .poll(() =>
      viewport.evaluate((element) => element.getBoundingClientRect().height),
    )
    .toBeLessThanOrEqual(129);
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (
            window as Window & {
              __summaryPreviewMaxHeight?: number;
            }
          ).__summaryPreviewMaxHeight ?? 0,
      ),
    )
    .toBeLessThanOrEqual(129);
  await expand.click();
  await expect(row.getByRole("button", { name: "收起摘要" })).toHaveAttribute(
    "aria-expanded",
    "true",
  );
  await expect
    .poll(() =>
      viewport.evaluate((element) => element.getBoundingClientRect().height),
    )
    .toBeGreaterThan(300);
  await row.getByRole("button", { name: "收起摘要" }).click();
  await expect
    .poll(() =>
      viewport.evaluate((element) => element.getBoundingClientRect().height),
    )
    .toBeLessThanOrEqual(129);
  await expect(page).toHaveURL(/assignment\/$/);
});

test("image summaries animate to the folded height without shifting", async ({
  page,
}) => {
  let releaseImage: (() => void) | undefined;
  const imageGate = new Promise<void>((resolve) => {
    releaseImage = resolve;
  });
  await page.route("https://fixture.invalid/**", async (route) => {
    await imageGate;
    await route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800"><rect width="600" height="800" fill="#ddd"/></svg>',
    });
  });
  await page.goto("/private/tasks/maths/linear-algebra/assignment/", {
    waitUntil: "domcontentloaded",
  });
  const row = page.locator(".document-row").filter({
    has: page.getByRole("link", {
      name: "夹具分类检索",
      exact: true,
    }),
  });
  const viewport = row.locator(".summary-preview-viewport");
  const image = row.locator(".summary-preview img");

  await expect(viewport).toHaveAttribute("data-measured", "true");
  expect(
    await viewport.evaluate((element) => getComputedStyle(element).maxHeight),
  ).toBe("none");
  await expect(viewport).toHaveAttribute("data-overflow", "false");
  await expect(viewport).toHaveAttribute("data-folded", "false");
  await expect(row.getByRole("button", { name: "展开摘要" })).toHaveCount(0);
  const initialHeight = await viewport.evaluate(
    (element) => element.getBoundingClientRect().height,
  );
  const initialContentHeight = await row
    .locator(".summary-preview-content")
    .evaluate((element) => element.scrollHeight);
  expect(Math.abs(initialHeight - initialContentHeight)).toBeLessThanOrEqual(1);
  expect(initialHeight).toBeLessThan(127);

  await image.evaluate((element) => {
    (
      window as Window & {
        __summaryImage?: HTMLImageElement;
      }
    ).__summaryImage = element as HTMLImageElement;
  });
  await viewport.evaluate((element) => {
    const trackedWindow = window as Window & {
      __summaryGrowthHeights?: number[];
      __summaryImageComplete?: boolean[];
      __summaryImageOffsets?: number[];
    };
    trackedWindow.__summaryGrowthHeights = [];
    trackedWindow.__summaryImageComplete = [];
    trackedWindow.__summaryImageOffsets = [];
    element.dataset["testTracked"] = "true";
    const sample = () => {
      const tracked = document.querySelector<HTMLElement>(
        '[data-test-tracked="true"]',
      );
      if (!tracked) return;
      trackedWindow.__summaryGrowthHeights!.push(
        tracked.getBoundingClientRect().height,
      );
      const image = tracked.querySelector("img");
      const figure = tracked.querySelector("figure");
      trackedWindow.__summaryImageComplete!.push(image?.complete ?? false);
      if (image?.naturalHeight && figure) {
        trackedWindow.__summaryImageOffsets!.push(
          image.getBoundingClientRect().y - figure.getBoundingClientRect().y,
        );
      }
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });

  releaseImage?.();
  await expect(image).toHaveJSProperty("complete", true);
  await expect
    .poll(() =>
      page.evaluate(
        (initial) =>
          (
            window as Window & {
              __summaryGrowthHeights?: number[];
            }
          ).__summaryGrowthHeights?.some(
            (height) => height > initial && height < 127,
          ) ?? false,
        initialHeight,
      ),
    )
    .toBe(true);
  await expect(row.getByRole("button", { name: "展开摘要" })).toBeVisible();
  await expect(viewport).toHaveAttribute("data-overflow", "true");
  await expect(viewport).toHaveAttribute("data-folded", "true");
  await expect
    .poll(() =>
      viewport.evaluate((element) => element.getBoundingClientRect().height),
    )
    .toBeLessThanOrEqual(129);
  await expect(viewport).toHaveAttribute("style", /height:\s*128px/);
  expect(
    await page.evaluate(() => {
      const tracked = (
        window as Window & {
          __summaryImage?: HTMLImageElement;
        }
      ).__summaryImage;
      const current = document.querySelector(".document-row img");
      return tracked === current && tracked?.isConnected === true;
    }),
  ).toBe(true);
  const heights = await page.evaluate(
    () =>
      (
        window as Window & {
          __summaryGrowthHeights?: number[];
        }
      ).__summaryGrowthHeights ?? [],
  );
  expect(Math.max(...heights)).toBeLessThanOrEqual(129);
  expect(
    heights.every(
      (height, index) => index === 0 || height >= heights[index - 1]! - 1,
    ),
  ).toBe(true);
  const imageComplete = await page.evaluate(
    () =>
      (
        window as Window & {
          __summaryImageComplete?: boolean[];
        }
      ).__summaryImageComplete ?? [],
  );
  const firstGrowth = heights.findIndex(
    (height) => height > initialHeight + 0.5,
  );
  expect(firstGrowth).toBeGreaterThanOrEqual(0);
  expect(imageComplete[firstGrowth]).toBe(true);
  const imageOffsets = await page.evaluate(
    () =>
      (
        window as Window & {
          __summaryImageOffsets?: number[];
        }
      ).__summaryImageOffsets ?? [],
  );
  expect(imageOffsets.length).toBeGreaterThan(0);
  expect(
    Math.max(...imageOffsets) - Math.min(...imageOffsets),
  ).toBeLessThanOrEqual(1);
});

test("summary interaction is separate from article navigation", async ({
  page,
}) => {
  const row = await openArchiveList(page);
  await row.getByRole("button", { name: "展开摘要" }).click();
  await row
    .getByRole("link", {
      name: "任务摘要示例",
      exact: true,
    })
    .click();
  await expect(page).toHaveURL(/assignment\/fixture-summary\/$/);
  await expect(
    page.getByRole("heading", { name: "任务正文示例", exact: true }),
  ).toBeVisible();
});

test("summary controls remain independent of the full card reading link", async ({
  page,
}) => {
  const row = await openArchiveList(page);
  await row.getByRole("button", { name: "展开摘要" }).click();
  await expect(page).toHaveURL(/assignment\/$/);
  await row.getByRole("button", { name: "收起摘要" }).click();
  await expect(page).toHaveURL(/assignment\/$/);
  await row.click({ position: { x: 8, y: 8 } });
  await expect(page).toHaveURL(/assignment\/fixture-summary\/$/);
});
