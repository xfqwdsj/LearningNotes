import { test, expect, type Locator, type Page } from "@playwright/test";
import { contentAction, openDiscussion } from "./actions";
import { parseContent } from "@/lib/content/syntax";
import { renderSource } from "@/lib/content/source-render";

test.beforeEach(async ({ page }) => {
  await page.route("https://fixture.invalid/**", (route) =>
    route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600"><rect width="400" height="600" fill="#ddd"/></svg>',
    }),
  );
});

const path = "/knowledge/maths/limits/continuity/";
const target = (id: string) =>
  `[data-question-target="continuity-check/absolute/${id}"]`;
type ClipboardWindow = Window & {
  __clipboardResult?: Promise<string | null> | undefined;
};
async function useCapturedClipboard(page: Page) {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: async (text: string) => {
          sessionStorage.setItem("copied-prompt", text);
          window.dispatchEvent(new Event("clipboard-captured"));
        },
      },
    }),
  );
}
async function captureNextClipboard(page: Page) {
  await page.evaluate(() => {
    (window as ClipboardWindow).__clipboardResult = new Promise((resolve) => {
      window.addEventListener(
        "clipboard-captured",
        () => resolve(sessionStorage.getItem("copied-prompt")),
        { once: true },
      );
    });
  });
}
function nextClipboard(page: Page) {
  return page.evaluate(() =>
    (
      (window as ClipboardWindow).__clipboardResult ?? Promise.resolve(null)
    ).then((value) => {
      (window as ClipboardWindow).__clipboardResult = undefined;
      return value;
    }),
  );
}
function ownButton(part: Locator, name: string) {
  return part
    .locator(":scope > .question-toolbar")
    .getByRole("button", { name, exact: true });
}

test("standard single/multiple controls stay aligned and retain checked drafts", async ({
  page,
}) => {
  await page.goto(path);
  await page.evaluate(() => document.fonts.ready);
  const single = page.locator(target("continuity"));
  const radio = single.getByRole("radio").first();
  await expect(radio).toBeEnabled();
  await radio.scrollIntoViewIfNeeded();
  const before = await radio.boundingBox();
  const row = single.locator(".question-choice").first();
  const baseline = await row.evaluate((e) => {
    const label = e
      .querySelector(".question-choice-label")!
      .getBoundingClientRect();
    const content = e
      .querySelector(".question-choice-content")!
      .getBoundingClientRect();
    return Math.abs(label.top - content.top);
  });
  expect(baseline).toBeLessThan(0.1);
  await row.click();
  await expect(radio).toBeChecked();
  expect((await radio.boundingBox())!.y).toBeCloseTo(before!.y, 1);
  await ownButton(single, "检查本小题").click();
  await expect(single.locator(".answer-correct")).toBeVisible();

  const multiple = page.locator(target("properties"));
  const boxes = multiple.getByRole("checkbox");
  await boxes.nth(0).scrollIntoViewIfNeeded();
  const checkboxBefore = await boxes.nth(0).boundingBox();
  await multiple.locator(".question-choice").nth(0).click();
  await expect(boxes.nth(0)).toBeChecked();
  expect((await boxes.nth(0).boundingBox())!.y).toBeCloseTo(
    checkboxBefore!.y,
    1,
  );
  await expect(boxes.nth(0).locator("svg")).toBeVisible();
  await ownButton(multiple, "检查本小题").click();
  await expect(multiple.locator(".answer-incorrect")).toBeVisible();
  await multiple.locator(".question-choice").nth(2).click();
  await expect(boxes.nth(0)).toBeChecked();
  await expect(boxes.nth(2)).toBeChecked();
  await ownButton(multiple, "检查本小题").click();
  await expect(multiple.locator(".answer-correct")).toBeVisible();
  const value = page.locator(target("value"));
  await value.getByRole("textbox").fill("0e2");
  await ownButton(value, "检查本小题").click();
  await expect(value.locator(".answer-correct")).toBeVisible();
  await expect(page.locator(".problem-set-score")).toContainText("3 / 3");
  await page.reload();
  await expect(single.getByRole("radio").first()).toBeChecked();
  await expect(multiple.getByRole("checkbox").nth(2)).toBeChecked();
  await expect(value.getByRole("textbox")).toHaveValue("0e2");
  await expect(value.locator(".answer-correct")).toBeVisible();
  await ownButton(multiple, "清空本小题").click();
  await expect(multiple.getByRole("checkbox").nth(0)).not.toBeChecked();
  await expect(value.getByRole("textbox")).toHaveValue("0e2");
  await page.getByRole("button", { name: "清空本题集", exact: true }).click();
  await expect(value.getByRole("textbox")).toHaveValue("");
  await expect(single.getByRole("radio").first()).not.toBeChecked();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("fill-in blanks keep focus while typing and copy as underscores", async ({
  page,
}) => {
  await page.goto(
    "/private/tasks/maths/higher-mathematics/assignment/fixture-input/",
  );
  const question = page.locator('[data-question-target="set-2/q2"]');
  const input = question.locator("input.question-inline-input").first();
  await expect(input).toBeEnabled();
  await input.click();
  await page.keyboard.type("abc");
  await expect(input).toHaveValue("abc");
  await expect(input).toBeFocused();

  const copy = (element: Element) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    const selection = window.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);
    const data = new DataTransfer();
    const event = new ClipboardEvent("copy", {
      clipboardData: data,
      bubbles: true,
      cancelable: true,
    });
    element.dispatchEvent(event);
    return {
      prevented: event.defaultPrevented,
      text: data.getData("text/plain"),
    };
  };
  const copied = await question.locator(".question-stem > p").evaluate(copy);
  expect(copied.prevented).toBe(true);
  expect(copied.text).toContain("______");
  expect(copied.text).not.toContain("abc");

  await page.goto(
    "/private/tasks/circuits/digital-analog-circuits/assignment/fixture-nested/",
  );
  const plain = page
    .locator(".question-list > li")
    .first()
    .locator(".question-stem > p")
    .first();
  const plainCopied = await plain.evaluate(copy);
  expect(plainCopied.prevented).toBe(false);
  expect(plainCopied.text).not.toContain("______");
});

test("references are collapsed, stale drafts are ignored, and unavailable storage keeps trial usable", async ({
  page,
}) => {
  await page.goto(path);
  const part = page.locator(target("value"));
  await expect(part.getByRole("textbox")).toBeEnabled();
  await part.getByRole("textbox").fill("0");
  await ownButton(part, "检查本小题").click();
  await page.reload();
  await expect(part.getByRole("textbox")).toHaveValue("0");
  await expect(part.locator(".answer-correct")).toBeVisible();
  await page.evaluate(() => {
    for (const key of Object.keys(localStorage)) {
      if (!key.startsWith("learning:answers:")) continue;
      const draft = JSON.parse(localStorage.getItem(key)!);
      draft.revision = "old";
      localStorage.setItem(key, JSON.stringify(draft));
    }
  });
  await page.reload();
  await expect(part.getByRole("textbox")).toHaveValue("");
  await expect(part.locator(".answer-correct")).toHaveCount(0);
  await expect(part.locator("details")).not.toHaveAttribute("open");
  await expect(part.locator(".when-closed").first()).toBeVisible();
  await expect(part.locator(".when-open").first()).toBeHidden();
  await part.locator("details > summary").first().click();
  await expect(part.locator("details")).toHaveAttribute("open", "");
  await expect(part.locator(".when-open").first()).toBeVisible();
  expect(
    await part
      .locator("details .content-disclosure-body > .prose")
      .first()
      .evaluate((element) => getComputedStyle(element).maxWidth),
  ).toBe("none");
  await page.addInitScript(() => {
    for (const method of ["getItem", "setItem", "removeItem"])
      Object.defineProperty(Storage.prototype, method, {
        value() {
          throw new DOMException("Unavailable", "SecurityError");
        },
      });
  });
  await page.reload();
  await expect(part.getByRole("textbox")).toBeEnabled();
  await part.getByRole("textbox").fill("0");
  await ownButton(part, "检查本小题").click();
  await expect(part.locator(".answer-correct")).toBeVisible();
  await expect(page.locator(".problem-set-save")).toContainText("本次会话");
});

test("question images use the shared viewer without a CORS request", async ({
  page,
}) => {
  // The original cross-origin image has no CORS headers; the viewer uses the browser image directly.
  await page.route(/https:\/\/.*\/1\.jpg/, async (route) =>
    route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600"><path fill="red" d="M0 0h400v300H0z"/><path fill="blue" d="M0 300h400v300H0z"/></svg>',
    }),
  );
  await page.goto(
    "/private/tasks/maths/higher-mathematics/exercise/fixture-image/",
  );
  const image = page.locator('article [data-rmiz-content="found"] img').first();
  await image.scrollIntoViewIfNeeded();
  await expect
    .poll(() => image.evaluate((e: HTMLImageElement) => e.naturalWidth))
    .toBe(400);
  const source = await image.getAttribute("src");
  expect(source).not.toBeNull();
  await expect(image).not.toHaveAttribute("crossorigin");
  const zoomButton = page.locator("article [data-rmiz-btn-zoom]").first();
  const openDialog = page.locator("dialog[data-rmiz-modal][open]");
  await expect(zoomButton).toHaveCSS("width", "1px");
  await expect(zoomButton).toHaveCSS("height", "1px");
  for (let i = 0; i < 2; i++) {
    await zoomButton.focus();
    await page.keyboard.press("Enter");
    await expect(openDialog).toBeVisible();
    await expect(openDialog.locator("[data-rmiz-btn-unzoom]")).toHaveCount(0);
    await expect(openDialog.locator("[data-rmiz-modal-img]")).toHaveAttribute(
      "src",
      source!,
    );
    if (i === 0) await page.keyboard.press("Escape");
    else await openDialog.locator("[data-rmiz-modal-img]").click();
    await expect(openDialog).toHaveCount(0);
    await expect(zoomButton).toBeFocused();
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("single-part control ownership and original numbers are preserved", async ({
  page,
}) => {
  await page.goto(
    "/private/tasks/circuits/digital-analog-circuits/assignment/fixture-nested/",
  );
  const roots = page.locator(".question-list > li");
  await expect(roots).toHaveCount(4);
  await expect(
    page.getByRole("button", { name: "检查本题集", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "清空本题集", exact: true }),
  ).toHaveCount(1);
  for (const [index, number] of ["1.8", "1.9", "1.16", "1.17"].entries()) {
    await expect(roots.nth(index)).toHaveAttribute(
      "data-original-number",
      number,
    );
    await expect(roots.nth(index)).toHaveAttribute("value", String(index + 1));
    await expect(
      roots.nth(index).locator(":scope > .question-heading > .original-number"),
    ).toHaveText(`原${number}`);
    await expect(ownButton(roots.nth(index), "检查答案")).toHaveCount(0);
    await expect(ownButton(roots.nth(index), "清空本题")).toHaveCount(
      index === 1 ? 0 : 1,
    );
    const childToolbars = roots
      .nth(index)
      .locator(".question-part > .question-toolbar");
    await expect(childToolbars).toHaveCount(index === 1 ? 2 : 0);
    await expect(
      roots
        .nth(index)
        .locator(
          `:scope > .question-heading > .question-share-actions button[aria-label="${index === 1 ? "复制整题链接" : "复制本题链接"}"]`,
        ),
    ).toHaveCount(1);
  }
  const singlePart = roots.first().getByRole("textbox");
  await singlePart.fill("Only part work");
  await expect(roots.first().locator(".answer-ungraded")).toHaveCount(0);
  await ownButton(roots.first(), "清空本题").click();
  await expect(singlePart).toHaveValue("");
  const parts = roots.nth(1).locator(".question-part");
  await expect(parts).toHaveCount(2);
  for (const [index, number] of ["2", "4"].entries()) {
    await expect(parts.nth(index)).toHaveAttribute("value", String(index + 1));
    await expect(
      parts.nth(index).locator(":scope > .question-heading > .original-number"),
    ).toHaveText(`原${number}`);
  }
  const numbered = await roots.first().evaluate((root) => {
    return [root, ...root.querySelectorAll(".question-part")].every((item) => {
      const tag = item.querySelector(
        ":scope > .question-heading .original-number",
      );
      return (
        !!tag &&
        tag.textContent?.trim().startsWith("原") &&
        !!item.getAttribute("data-original-number")
      );
    });
  });
  expect(numbered).toBe(true);
  await parts.nth(0).getByRole("textbox").fill("First work");
  await parts.nth(1).getByRole("textbox").fill("Second work");
  for (const part of await parts.all()) {
    await expect(ownButton(part, "检查本小题")).toHaveCount(0);
    await expect(ownButton(part, "清空本小题")).toHaveCount(1);
  }
  await expect(parts.locator(".answer-ungraded")).toHaveCount(0);
  for (const part of await parts.all())
    await ownButton(part, "清空本小题").click();
  await expect(parts.nth(0).getByRole("textbox")).toHaveValue("");
  await expect(parts.nth(1).getByRole("textbox")).toHaveValue("");
  await page.goto(
    "/private/tasks/maths/linear-algebra/assignment/fixture-number-a/",
  );
  await expect(page.locator(".question-list > li").nth(2)).toHaveAttribute(
    "value",
    "3",
  );
  await expect(page.locator(".question-list > li").nth(2)).toHaveAttribute(
    "data-original-number",
    "4",
  );
  await page.goto(
    "/private/tasks/maths/linear-algebra/assignment/fixture-number-b/",
  );
  await expect(page.locator(".question-list > li").nth(1)).toHaveAttribute(
    "value",
    "2",
  );
  await expect(page.locator(".question-list > li").nth(1)).toHaveAttribute(
    "data-original-number",
    "3",
  );
  await page.goto(
    "/private/tasks/maths/linear-algebra/assignment/fixture-groups/",
  );
  const sets = page.locator(".question-list");
  await expect(sets).toHaveCount(2);
  for (const set of await sets.all()) {
    await expect(set.locator(":scope > li").nth(0)).toHaveAttribute(
      "value",
      "1",
    );
    await expect(set.locator(":scope > li").nth(1)).toHaveAttribute(
      "value",
      "2",
    );
  }
  await expect(sets.first().locator(":scope > li").first()).toHaveAttribute(
    "data-original-number",
    "3",
  );
});

test("root discussion includes child drafts with optional references and Markdown excludes browser drafts", async ({
  page,
}) => {
  await useCapturedClipboard(page);
  await page.goto(path);
  await page
    .locator(target("value"))
    .getByRole("textbox")
    .fill("unpublished-draft-value");
  const root = page.locator(
    '[data-question-target="continuity-check/absolute"]',
  );
  await openDiscussion(
    page,
    root.locator(
      ":scope > .question-share-actions, :scope > .question-heading > .question-share-actions",
    ),
    "讨论整题",
  );
  const sourceMode = page.getByRole("menuitemradio", {
    name: "原文",
    exact: true,
  });
  await sourceMode.click();
  await expect(sourceMode).toHaveAttribute("aria-checked", "true");
  await captureNextClipboard(page);
  await page.getByRole("menuitem", { name: "复制讨论提示词" }).click();
  const withoutReference = await nextClipboard(page);
  expect(withoutReference).toContain("unpublished-draft-value");
  expect(withoutReference).not.toContain("固定参考解答：数值为零。");
  await page.waitForTimeout(350);
  await openDiscussion(
    page,
    root.locator(
      ":scope > .question-share-actions, :scope > .question-heading > .question-share-actions",
    ),
    "讨论整题",
  );
  await expect(
    page.getByRole("menuitemcheckbox", { name: "讨论时附加参考解答" }),
  ).toBeVisible();
  await page
    .getByRole("menuitemcheckbox", { name: "讨论时附加参考解答" })
    .click();
  await captureNextClipboard(page);
  await page.getByRole("menuitem", { name: "复制讨论提示词" }).click();
  expect(await nextClipboard(page)).toContain("固定参考解答：数值为零。");
  const exported = await page.request.get(
    "/knowledge/maths/limits/continuity/questions/continuity-check/absolute.md",
  );
  expect(exported.ok()).toBe(true);
  expect(await exported.text()).not.toContain("unpublished-draft-value");
});

test("question resources load only when an export or discussion action needs them", async ({
  page,
}) => {
  const resourceRequests: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).pathname.endsWith("/questions.json"))
      resourceRequests.push(request.url());
  });
  await page.goto(path);
  expect(resourceRequests).toEqual([]);
  const root = page.locator(
    '[data-question-target="continuity-check/absolute"]',
  );
  const copy = await contentAction(
    page,
    root.locator(
      ":scope > .question-share-actions, :scope > .question-heading > .question-share-actions",
    ),
    "复制整题Markdown",
  );
  const responsePromise = page.waitForResponse((response) => {
    const pathname = new URL(response.url()).pathname;
    return pathname === "/knowledge/maths/limits/continuity/questions.json";
  });
  await copy.click();
  const response = await responsePromise;
  expect(response.ok()).toBe(true);
  const resource = (await response.json()) as {
    version: number;
    problemSets: {
      questions: { target: string; markdown: string }[];
    }[];
  };
  expect(resource.version).toBe(2);
  expect(resource.problemSets[0]?.questions[0]?.markdown).toContain("示例题面");
  expect(resourceRequests).toHaveLength(1);
  await expect(
    page.locator("[data-sonner-toast]").filter({ hasText: "已复制" }),
  ).toBeVisible();
});

test("single-part copy and discussion include the complete parent and child", async ({
  page,
}) => {
  await useCapturedClipboard(page);
  await page.goto(
    "/private/tasks/circuits/digital-analog-circuits/assignment/fixture-nested/",
  );
  const root = page.locator(".question-list > li").first();
  await expect(root.locator(".question-toolbar")).toHaveCount(1);
  const copy = await contentAction(
    page,
    root.locator(
      ":scope > .question-share-actions, :scope > .question-heading > .question-share-actions",
    ),
    "复制本题Markdown",
  );
  const responsePromise = page.waitForResponse((response) =>
    new URL(response.url()).pathname.endsWith(
      "/private/tasks/circuits/digital-analog-circuits/assignment/fixture-nested/questions.json",
    ),
  );
  await captureNextClipboard(page);
  await copy.click();
  const response = await responsePromise;
  expect(response.ok()).toBe(true);
  const copied = await nextClipboard(page);
  expect(copied).toContain("原题号：1.8");
  expect(copied).toContain("测试题面：父级题目");
  expect(copied).toContain("answer = 1");
  await root.getByRole("textbox").fill("Single-part draft");
  await openDiscussion(
    page,
    root.locator(
      ":scope > .question-share-actions, :scope > .question-heading > .question-share-actions",
    ),
    "讨论本题",
  );
  await captureNextClipboard(page);
  await page.getByRole("menuitem", { name: "复制讨论提示词" }).click();
  const discussion = await nextClipboard(page);
  expect(discussion).toContain("测试题面：父级题目");
  expect(discussion).toContain("answer = 1");
});

test("an omitted original number keeps the stem on the marker line", async ({
  page,
}) => {
  await page.goto(path);
  const root = page.locator(
    '[data-question-target="continuity-check/absolute"]',
  );
  await expect(root.locator(":scope > .question-heading")).toHaveCount(0);
  await expect(root.locator(":scope > .question-share-float")).toHaveCount(1);
  const part = page.locator(target("value"));
  await expect(part.locator(":scope > .question-heading")).toHaveCount(0);
  await expect(part.locator(":scope > .question-share-float")).toHaveCount(1);
});

test("leading page annotations stay outside stems and question slices keep their separator", async ({
  page,
}) => {
  await page.goto(
    "/private/tasks/maths/higher-mathematics/assignment/fixture-pages/",
  );
  const set = page.locator('[data-problem-set="page-set"]');
  const questions = set.locator(".question-list");
  await expect(questions).toHaveCount(1);
  await expect(
    set.locator('.question-list > [data-question-target="page-set/q1"]'),
  ).toHaveCount(1);

  const first = page.locator('[data-question-target="page-set/q1"]');
  await expect(first.locator(":scope > .source-page")).toHaveText("第42页");
  await expect(first.locator(".question-stem .source-page")).toHaveCount(0);
  const inclusion = first.locator(
    ":scope > .question-stem > .content-inclusion",
  );
  await expect(inclusion).toHaveCount(1);
  await expect(inclusion.locator(":scope > :first-child")).toHaveCSS(
    "margin-top",
    "0px",
  );
  await expect(inclusion.locator(":scope > :last-child")).toHaveCSS(
    "margin-bottom",
    "0px",
  );

  const third = page.locator('[data-question-target="page-set/q3"]');
  await expect(third.locator(":scope > .source-page")).toHaveText("第44页");
  await expect(third).toHaveCSS("border-top-width", "1px");
});

test("page annotations share the question width, avoid text and flow inline on narrow screens", async ({
  page,
}) => {
  const html = await renderSource(
    parseContent(
      `::page{number="42"}

正文用于验证页码的位置。文字应在页码左侧自然换行，不进入页码占据的区域。正文和工具栏使用同一个内容边界。

::page{number="43"}

这里继续同一道题的内容，跨页标记不作为分割线显示。`,
      true,
    ),
  );
  await page.setViewportSize({ width: 1360, height: 900 });
  await page.goto(path);
  await expect(
    page.locator(target("value")).getByRole("textbox"),
  ).toBeEnabled();
  const stem = page.locator(target("value")).locator(":scope > .question-stem");
  await stem.evaluate((element, source) => {
    element.innerHTML = source;
  }, html);
  await expect(stem.locator(".source-page")).toHaveCount(2);
  await expect(stem.locator(".source-page").first()).toHaveText("第42页");
  await expect(stem.locator(".source-page").nth(1)).toHaveText("第43页");
  const aligned = await stem.evaluate((element) => {
    const stemRight = element.getBoundingClientRect().right;
    const toolbar = element
      .parentElement!.querySelector(":scope > .question-toolbar")!
      .getBoundingClientRect();
    return {
      right: Math.abs(stemRight - toolbar.right),
      pages: [...element.querySelectorAll(".source-page")].map((marker) => ({
        right: Math.abs(marker.getBoundingClientRect().right - stemRight),
        float: getComputedStyle(marker).float,
      })),
    };
  });
  expect(aligned.right).toBeLessThan(1);
  for (const marker of aligned.pages) {
    expect(marker.right).toBeLessThan(1);
    expect(marker.float).toBe("inline-end");
  }
  for (const width of [1360, 390]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await stem.evaluate((element) => {
        const markers = [...element.querySelectorAll(".source-page")];
        for (const paragraph of element.querySelectorAll("p")) {
          const range = document.createRange();
          range.selectNodeContents(paragraph);
          for (const text of range.getClientRects()) {
            for (const marker of markers) {
              const box = marker.getBoundingClientRect();
              if (
                text.left < box.right &&
                text.right > box.left &&
                text.top < box.bottom &&
                text.bottom > box.top
              )
                return false;
            }
          }
        }
        return true;
      }),
    ).toBe(true);
  }
  await expect(stem.locator(".source-page").first()).toHaveCSS("float", "none");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
