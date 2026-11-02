import { test, expect } from "@playwright/test";

test("Next navigation animates forward and back without smooth-scroll warnings", async ({
  page,
}) => {
  const warnings: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "warning") warnings.push(message.text());
  });
  await page.addInitScript(() => {
    const state = window as typeof window & {
      routeTransitions: { types: string[]; animations: string[] }[];
    };
    state.routeTransitions = [];
    const original = document.startViewTransition.bind(document);
    document.startViewTransition = (options) => {
      const transition = options ? original(options) : original();
      void transition.ready
        .then(() => {
          state.routeTransitions.push({
            types: [...transition.types],
            animations: document
              .getAnimations()
              .flatMap((animation) =>
                animation instanceof CSSAnimation
                  ? [animation.animationName]
                  : [],
              ),
          });
        })
        .catch(() => {});
      return transition;
    };
  });
  await page.goto("/courses/");
  await expect(page.locator("html")).toHaveAttribute(
    "data-scroll-behavior",
    "smooth",
  );
  await page
    .locator(".collection-card")
    .filter({ hasText: "数学" })
    .first()
    .click();
  await expect(page).toHaveURL(/\/courses\/maths\//);
  await expect
    .poll(() =>
      page.evaluate(() =>
        (
          window as typeof window & {
            routeTransitions: { types: string[]; animations: string[] }[];
          }
        ).routeTransitions.some(
          (transition) =>
            transition.types.includes("nav-forward") &&
            transition.animations.includes("page-route-enter"),
        ),
      ),
    )
    .toBe(true);
  await page.locator(".page-parent-link").click();
  await expect(page).toHaveURL(/\/courses\/$/);
  await expect
    .poll(() =>
      page.evaluate(() =>
        (
          window as typeof window & {
            routeTransitions: { types: string[]; animations: string[] }[];
          }
        ).routeTransitions.some(
          (transition) =>
            transition.types.includes("nav-back") &&
            transition.animations.includes("page-route-enter"),
        ),
      ),
    )
    .toBe(true);
  expect(
    warnings.filter((warning) =>
      /scroll-behavior|smooth.scroll/i.test(warning),
    ),
  ).toEqual([]);
});

test("reduced motion suppresses route animation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/courses/");
  const animation = await page.evaluate(() => {
    const element = document.createElement("div");
    element.style.viewTransitionName = "motion-probe";
    element.style.viewTransitionClass = "page-forward";
    document.body.append(element);
    return new Promise<string>((resolve) => {
      const transition = document.startViewTransition(() => {
        element.textContent = "test";
      });
      void transition.ready.then(() => {
        resolve(
          getComputedStyle(
            document.documentElement,
            "::view-transition-new(motion-probe)",
          ).animationName,
        );
      });
      void transition.finished.then(() => element.remove());
    });
  });
  expect(animation).toBe("none");
});
