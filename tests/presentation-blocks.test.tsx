import { describe, expect, it } from "vitest";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import messages from "../messages/zh-CN.json";
import { RichContent } from "@/components/rich-content";
import { AnswerDisclosure } from "@/components/questions/answer-disclosure";
import { parseContent } from "@/lib/content/syntax";
import { renderSource } from "@/lib/content/source-render";
import { exportMarkdown } from "@/lib/content/content-export";
import {
  createSourceResolver,
  type ContentSource,
} from "@/lib/content/source-resolver";

const renderUi = (children: ReactNode) =>
  renderToStaticMarkup(
    <NextIntlClientProvider
      locale="zh-CN"
      timeZone="Asia/Shanghai"
      messages={messages}
    >
      {children}
    </NextIntlClientProvider>,
  );

const fixture = `::::example{title="检验 $x^2$"}

例子正文。

:::proof

证明中的 $x^2$。

:::

::::

:::disclosure{icon="lightbulb" title="补充 **说明**"}

补充正文。

:::

:::steps

3. 确定条件。
4. 计算结果。

   补充解释。

:::
`;

describe("presentation containers", () => {
  it("uses fixed proof and answer chrome while retaining anchors", async () => {
    const source = await renderSource(
      parseContent(':::proof{title="推导 $x^2$"}\nBody.\n:::', true),
    );
    const html = renderUi(createElement(RichContent, { html: source }));
    const answer = renderUi(
      <AnswerDisclosure kind="reference">
        <p>Answer.</p>
      </AnswerDisclosure>,
    );
    for (const markup of [html, answer]) {
      expect(markup).toContain('class="content-disclosure ');
      expect(markup).toContain('class="content-disclosure-summary"');
      expect(markup).toContain('class="content-disclosure-body"');
      expect(markup).not.toMatch(/<details[^>]* open/);
    }
    expect(html).toContain(
      '<strong class="content-disclosure-kind" data-disclosure-kind="proof" lang="zh-CN">证明</strong>',
    );
    expect(html).toContain("lucide-file-check-2");
    expect(html).not.toContain("mdx-proof mdx-proof");
    expect(answer).toContain("lucide-book-open-check");
    expect(answer).toContain("参考解答");
    expect(html).toContain('class="katex"');
    const linked = renderUi(
      createElement(RichContent, {
        html: '<details id="answer-1" class="reference-answer"><summary>错误标题</summary><p>Text.</p></details>',
      }),
    );
    expect(linked).toContain('id="answer-1"');
    expect(linked).toContain("参考解答");
    expect(linked).not.toContain("错误标题");
    expect(linked).toContain("lucide-book-open-check");
    expect(linked.match(/<summary/g)).toHaveLength(1);
  });
  it("renders nested containers, math titles and native collapsed proofs without extra headings", async () => {
    const tree = parseContent(fixture, true);
    const before = structuredClone(tree);
    const html = await renderSource(tree);
    expect(html).toContain('<section class="mdx-example">');
    expect(html).toContain(
      '<details class="mdx-proof"><summary class="presentation-block-title"><strong class="content-disclosure-kind" data-disclosure-kind="proof" lang="zh-CN">证明</strong></summary>',
    );
    expect(html).toContain(
      '<details class="mdx-disclosure"><summary class="presentation-block-title"><span class="content-disclosure-icon-slot" data-disclosure-icon-slot="">',
    );
    expect(html).toContain("lucide-lightbulb");
    expect(html).toContain('<div class="mdx-steps"><ol start="3" role="list">');
    expect(html).toContain('class="katex"');
    expect(html).not.toMatch(/<h[1-6]|<details[^>]* open/);
    expect(tree).toEqual(before);
    const markdown = exportMarkdown(tree);
    expect(markdown).toContain("**检验 $x^2$**");
    expect(markdown).toContain("**证明**");
    expect(markdown).toContain("补充 **说明**");
    expect(markdown).toContain("1. 确定条件。");
    expect(markdown).toContain("2. 计算结果。");
    expect(markdown).toContain("补充解释。");
    expect(markdown).not.toContain(":::");
    expect(tree).toEqual(before);
  });

  it("preserves containers through semantic inclusion and readable exports", async () => {
    const origin: ContentSource = {
      file: "/content/origin.mdx",
      contentPath: "articles/origin.mdx",
      body: `## 原文\n\n::section{#example}\n\n${fixture}`,
      private: false,
      data: { kind: "article", lang: "zh-CN", title: "原文" },
    };
    const host: ContentSource = {
      ...origin,
      file: "/content/host.mdx",
      contentPath: "articles/host.mdx",
      body: '::include{src="/articles/origin/" section="example"}',
    };
    const tree = createSourceResolver([origin, host]).resolve(host);
    expect(await renderSource(tree)).toContain('class="mdx-example"');
    expect(exportMarkdown(tree)).toContain("**检验 $x^2$**");
    expect(exportMarkdown(tree)).toContain("/articles/origin/#example");
  });

  it("supports untitled steps without adding headings or exporting decorative numbering", async () => {
    const tree = parseContent(
      ":::steps\n\n1. Plain explanation.\n2. **Title**\n\n   More detail.\n\n:::",
      true,
    );
    const html = await renderSource(tree);
    expect(html).toContain(
      '<span class="step-number" aria-hidden="true"></span>',
    );
    expect(html).toContain("<p>Plain explanation.</p>");
    expect(html).not.toMatch(/<h[1-6]/);
    expect(exportMarkdown(tree)).toContain("1. Plain explanation.");
    expect(exportMarkdown(tree)).not.toContain("step-number");
  });

  it("keeps escaped directives and code as literal content", async () => {
    const tree = parseContent("\\:::example\n\n```md\n:::proof\n```", true);
    expect(await renderSource(tree)).not.toContain('class="mdx-proof"');
    expect(await renderSource(tree)).not.toContain('class="mdx-example"');
    expect(exportMarkdown(tree)).toContain(":::proof");
  });

  it("normalizes block syntax in presentation titles", async () => {
    const tree = parseContent(':::proof{title="# Heading"}\nBody.\n:::', true);
    expect(await renderSource(tree)).toContain("<strong>Heading</strong>");
    expect(exportMarkdown(tree)).toContain("**证明** **Heading**");
  });

  it("renders generic disclosures with markdown titles, markdown content and a configured icon", async () => {
    const tree = parseContent(
      ':::disclosure{icon="sparkles" title="**提示** $x^2$"}\n\n正文 **重点**。\n:::',
      true,
    );
    const html = renderUi(
      createElement(RichContent, { html: await renderSource(tree) }),
    );
    expect(html).toContain('class="content-disclosure ');
    expect(html).toContain("lucide-sparkles");
    expect(html).toContain("<strong>提示</strong>");
    expect(html).toContain('class="katex"');
    expect(html).toContain("<strong>重点</strong>");
    expect(exportMarkdown(tree)).toContain("**提示** $x^2$");
    expect(exportMarkdown(tree)).toContain("正文 **重点**。");
  });

  it.each([
    ["::example", "container directive"],
    [":proof[text]", "container directive"],
    ["::disclosure", "container directive"],
    [':::example{wrong="value"}\nBody.\n:::', "Unsupported"],
    [':::proof{icon="info"}\nBody.\n:::', "Unsupported"],
    [':::disclosure{icon="info"}\nBody.\n:::', "disclosure requires a title"],
    [':::disclosure{title="标题"}\nBody.\n:::', "disclosure requires an icon"],
    [
      ':::disclosure{icon="unknown" title="标题"}\nBody.\n:::',
      "Unsupported Lucide icon",
    ],
    [':::steps{title="步骤"}\n1. Step.\n:::', "Unsupported"],
    [":::steps\n- Step.\n:::", "ordered Markdown list"],
  ])(
    "rejects malformed presentation syntax %s in HTML and exports",
    async (source, error) => {
      const tree = parseContent(source, true);
      await expect(renderSource(tree)).rejects.toThrow(error);
      expect(() => exportMarkdown(tree)).toThrow(error);
    },
  );

  it("uses localized defaults and permits explicit inline formatting", async () => {
    expect(
      await renderSource(parseContent(":::example\nBody.\n:::", true)),
    ).toContain('lang="zh-CN">例子</p>');
    const tree = parseContent(
      ':::proof{title="**推导** $x^2$"}\nBody.\n:::',
      true,
    );
    expect(await renderSource(tree)).toContain("<strong>推导</strong>");
    expect(exportMarkdown(tree)).toContain("**证明** **推导** $x^2$");
  });
});
