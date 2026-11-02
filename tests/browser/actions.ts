import { expect, type Locator, type Page } from "@playwright/test";

/**
 * Return the visible content action for a boundary.
 * Pointer layouts expose icon buttons; narrow/touch layouts open the action menu.
 */
export async function contentAction(
  page: Page,
  scope: Locator,
  name: string,
): Promise<Locator> {
  const inline = scope.locator(`button[aria-label="${name}"]`);
  if (await inline.isVisible().catch(() => false)) return inline;
  const trigger = scope.locator(".content-actions-menu button");
  await expect(trigger).toBeVisible();
  await trigger.click();
  const item = page.getByRole("menuitem", { name, exact: true });
  await expect(item).toBeVisible();
  return item;
}

/** Open the discussion controls; narrow layouts expose them in the compact menu. */
export async function openDiscussion(
  page: Page,
  scope: Locator,
  name: string,
): Promise<void> {
  const inline = scope.locator(`button[aria-label="${name}"]`);
  if (await inline.isVisible().catch(() => false)) {
    await inline.click();
    await expect(page.getByRole("menu")).toBeVisible();
    return;
  }
  const trigger = scope.locator(".content-actions-menu button");
  await expect(trigger).toBeVisible();
  await trigger.click();
  await expect(page.getByRole("menu")).toBeVisible();
}
