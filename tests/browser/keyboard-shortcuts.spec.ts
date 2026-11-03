import { test, expect } from "@playwright/test";
import { contentAction } from "./actions";
const agents = [
  {
    name: "macOS",
    ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/145.0.0.0 Safari/537.36",
    modifier: "Meta",
    label: "Command",
  },
  {
    name: "Windows",
    ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/145.0.0.0 Safari/537.36",
    modifier: "Control",
    label: "Ctrl",
  },
  {
    name: "Linux",
    ua: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/145.0.0.0 Safari/537.36",
    modifier: "Control",
    label: "Ctrl",
  },
  {
    name: "Android",
    ua: "Mozilla/5.0 (Linux; Android 15; Pixel 7) AppleWebKit/537.36 Chrome/145.0.0.0 Mobile Safari/537.36",
    modifier: "Control",
    label: "Ctrl",
  },
  {
    name: "iPad",
    ua: "Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1",
    modifier: "Meta",
    label: "Command",
  },
];
for (const agent of agents) {
  test.describe(agent.name, () => {
    test.use({ userAgent: agent.ua, viewport: { width: 1440, height: 1000 } });
    test("UA keeps search labels, ARIA and keyboard recognition consistent", async ({
      page,
    }, info) => {
      test.skip(
        info.project.name !== "chromium",
        "UA matrix uses an explicit desktop viewport",
      );
      await page.addInitScript(() =>
        Object.defineProperty(navigator, "userAgentData", {
          configurable: true,
          value: undefined,
        }),
      );
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      for (const scope of ["", "/private"]) {
        await page.goto(`${scope}/`);
        const trigger = page.getByRole("button", {
          name: "搜索知识、课程与任务",
          exact: true,
        });
        await expect(trigger).toHaveAttribute(
          "aria-keyshortcuts",
          `${agent.modifier}+K`,
        );
        const hint = trigger.locator("kbd");
        await expect(hint).toHaveAttribute(
          "aria-label",
          `快捷键${agent.label}+K`,
        );
        if (agent.modifier === "Meta")
          await expect(hint.locator("svg.lucide-command")).toBeVisible();
        else await expect(hint).toHaveText("Ctrl+K");
        await expect(
          page.locator('section[aria-live="polite"]'),
        ).toHaveAttribute(
          "aria-label",
          `通知，快捷键${agent.modifier === "Meta" ? "Option" : "Alt"}+T`,
        );
        // The other platform's modifier is not an alternative registration.
        await page.dispatchEvent("body", "keydown", {
          key: "k",
          code: "KeyK",
          ctrlKey: agent.modifier === "Meta",
          metaKey: agent.modifier !== "Meta",
        });
        await expect(page.getByRole("dialog")).toHaveCount(0);
        await page.keyboard.press(`${agent.modifier}+k`);
        const dialog = page.getByRole("dialog");
        await expect(dialog).toBeVisible();
        await expect(dialog.locator('kbd[aria-label="快捷键Esc"]')).toHaveText(
          "Esc",
        );
        // Auto-repeat and input composition cannot toggle the dialog.
        for (const extra of [{ repeat: true }, { isComposing: true }])
          await page.dispatchEvent("input", "keydown", {
            key: "k",
            code: "KeyK",
            ctrlKey: agent.modifier === "Control",
            metaKey: agent.modifier === "Meta",
            ...extra,
          });
        await expect(dialog).toBeVisible();
        await page.keyboard.press(`${agent.modifier}+k`);
        await expect(dialog).toHaveCount(0);
        await page.keyboard.press(`${agent.modifier}+k`);
        await expect(dialog).toBeVisible();
        await page.keyboard.press("Escape");
        await expect(dialog).toHaveCount(0);
        await expect(trigger).toBeFocused();
      }
      await page.addInitScript(() =>
        Object.defineProperty(navigator, "clipboard", {
          configurable: true,
          value: { writeText: async () => {} },
        }),
      );
      await page.goto("/knowledge/maths/limits/continuity/");
      const section = page
        .locator(".inline-section-heading")
        .filter({ has: page.locator("#definition") });
      await section.hover();
      await (await contentAction(page, section, "复制本节链接")).click();
      const notifications = page.locator("[data-sonner-toaster]");
      await expect(
        notifications.locator("[data-sonner-toast]").first(),
      ).toBeVisible();
      await page.keyboard.press("Alt+t");
      await expect(notifications).toBeFocused();
      await page.keyboard.press("Escape");
      expect(errors).toEqual([]);
    });
  });
}
