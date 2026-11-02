import { expect, test } from "@playwright/test";

test("automatic CJK and non-CJK gaps come from typography CSS", async ({
  page,
}) => {
  await page.goto("/");
  const result = await page.evaluate(() => {
    const bodyAutospace = getComputedStyle(document.body)
      .getPropertyValue("text-autospace")
      .trim();
    const pre = document.createElement("pre");
    pre.textContent = "中文English";
    document.body.append(pre);
    const preAutospace = getComputedStyle(pre)
      .getPropertyValue("text-autospace")
      .trim();
    pre.remove();

    const container = document.createElement("div");
    container.style.cssText =
      "position:absolute;visibility:hidden;font:32px serif;white-space:nowrap";
    const normal = document.createElement("span");
    normal.textContent = "中文English123";
    normal.style.setProperty("text-autospace", "normal");
    const disabled = document.createElement("span");
    disabled.textContent = "中文English123";
    disabled.style.setProperty("text-autospace", "no-autospace");
    container.append(normal, disabled);
    document.body.append(container);
    const widths = {
      normal: normal.getBoundingClientRect().width,
      disabled: disabled.getBoundingClientRect().width,
    };
    container.remove();
    return { bodyAutospace, preAutospace, widths };
  });

  expect(result.bodyAutospace).toBe("normal");
  expect(result.preAutospace).toBe("no-autospace");
  expect(result.widths.normal).toBeGreaterThan(result.widths.disabled);
});
