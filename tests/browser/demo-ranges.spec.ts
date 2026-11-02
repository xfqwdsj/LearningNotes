import { expect, test } from "@playwright/test";

test("demo sliders glide continuously and dock to semantic steps", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/knowledge/maths/integrals/definite-integral/");

  const demo = page.locator(".interactive-demo");
  const slider = demo.getByRole("slider").first();
  const control = demo.locator(".demo-range-control").first();
  await expect(slider).toBeVisible();
  await slider.scrollIntoViewIfNeeded();

  const box = await slider.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box!.x + box!.width * 0.2, box!.y + box!.height / 2);
  await page.mouse.down();
  await page.mouse.move(box!.x + box!.width * 0.68, box!.y + box!.height / 2, {
    steps: 6,
  });

  await expect(control).toHaveAttribute("data-dragging", "true");
  await expect(control).toHaveAttribute("data-marks", "true");
  await expect(demo.locator(".demo-range-tick")).toHaveCount(40);
  await expect(
    demo.locator('.demo-range-tick[data-active="true"]'),
  ).toHaveCount(1);
  await expect
    .poll(() =>
      demo
        .locator(".demo-range-tick")
        .first()
        .evaluate(
          (element) => getComputedStyle(element, "::before").animationName,
        ),
    )
    .toBe("demo-range-tick-up");

  const docked = await slider.getAttribute("aria-valuetext");
  await page.mouse.up();

  await expect(control).toHaveAttribute("data-dragging", "false");
  await expect(demo.locator(".demo-range-ticks")).toHaveAttribute(
    "data-phase",
    "exiting",
  );
  await expect
    .poll(() =>
      demo
        .locator(".demo-range-tick")
        .first()
        .evaluate(
          (element) => getComputedStyle(element, "::before").animationName,
        ),
    )
    .toBe("demo-range-tick-up-out");
  await expect(demo.locator(".demo-range-ticks")).toHaveCount(0);
  await expect
    .poll(async () => slider.getAttribute("aria-valuenow"))
    .toBe(docked);
});

test("dense steps avoid rendering distracting tick marks", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/knowledge/cs/data-representation/floating-point/");

  const demo = page.locator(".interactive-demo");
  const slider = demo.getByRole("slider").first();
  const control = demo.locator(".demo-range-control").first();
  await slider.scrollIntoViewIfNeeded();
  const box = await slider.boundingBox();
  expect(box).not.toBeNull();

  await page.mouse.move(box!.x + box!.width * 0.3, box!.y + box!.height / 2);
  await page.mouse.down();
  await page.mouse.move(box!.x + box!.width * 0.6, box!.y + box!.height / 2, {
    steps: 4,
  });

  await expect(control).toHaveAttribute("data-dragging", "true");
  await expect(control).toHaveAttribute("data-marks", "false");
  await expect(demo.locator(".demo-range-ticks")).toHaveCount(0);
  await page.mouse.up();
});
