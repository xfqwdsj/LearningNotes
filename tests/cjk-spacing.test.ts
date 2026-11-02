import { describe, expect, it } from "vitest";
import {
  findSpacingCandidates,
  normalizeContentSource,
  normalizeJsonTextSource,
  normalizeMarkdownSource,
  spacingPreservationHint,
} from "../scripts/cjk-spacing";

describe("CJK and non-CJK source spacing", () => {
  it("finds spacing candidates without AST context", () => {
    expect(
      findSpacingCandidates("中文 ， API，中文 %s 参数，中文 C++ 程序。"),
    ).toEqual([
      { start: 2, end: 3, removed: " ", count: 1 },
      { start: 4, end: 5, removed: " ", count: 1 },
      { start: 11, end: 12, removed: " ", count: 1 },
      { start: 14, end: 15, removed: " ", count: 1 },
      { start: 20, end: 21, removed: " ", count: 1 },
      { start: 24, end: 25, removed: " ", count: 1 },
    ]);
  });

  it("scan candidates use the same punctuation and token boundaries", () => {
    expect(
      findSpacingCandidates(String.raw`中文 ， API；中文 %s 参数；C++ 程序。`),
    ).toHaveLength(5);
  });

  it("finds ICU placeholder boundaries without scanning placeholder internals", () => {
    expect(findSpacingCandidates("中文 {value} 参数")).toHaveLength(2);
    expect(
      findSpacingCandidates("{count, plural, one {# 项} other {# 项}} 中文"),
    ).toHaveLength(1);
  });

  it("removes spaces between CJK and non-CJK letters or numbers", () => {
    expect(
      normalizeMarkdownSource(
        "中文 Python 入门 and Rust 编程，第 3 章保留 3.14，版本 ２。",
      ).source,
    ).toBe("中文Python入门and Rust编程，第3章保留3.14，版本２。");
  });

  it("handles Markdown inline boundaries without changing delimiters", () => {
    expect(
      normalizeMarkdownSource(
        "中文 *Python* 入门，**English** 中文，[Rust 语言](/rust) 与 API。",
      ).source,
    ).toBe("中文*Python*入门，**English**中文，[Rust语言](/rust)与API。");
  });

  it("keeps code and math content intact while spacing adjacent text", () => {
    expect(
      normalizeMarkdownSource(
        "中文 `Python 代码` 入门，$Python x$ 与 `API` 内容，中文 `API` 说明。",
      ).source,
    ).toBe("中文`Python 代码`入门，$Python x$与`API`内容，中文`API`说明。");
  });

  it("handles code spans and inline math as atomic visible objects", () => {
    expect(
      normalizeMarkdownSource(
        "中文 `range(1, 2)` 后文，中文 $x$ 公式，中文 `API` 后文。",
      ).source,
    ).toBe("中文`range(1, 2)`后文，中文$x$公式，中文`API`后文。");
  });

  it("normalizes visible text inside text directives", () => {
    expect(
      normalizeMarkdownSource("::caption[自定义题注，支持 **强调** 和 $x^2$。]")
        .source,
    ).toBe("::caption[自定义题注，支持 **强调** 和$x^2$。]");
  });

  it("normalizes md, markdown, and MDX fenced examples only", () => {
    const source = [
      "```md",
      "# Python 入门",
      "",
      "中文 API 说明。",
      "```",
      "",
      '```MDX title="Python 示例"',
      '<p title="API 文档">MDX Python 正文</p>',
      "```",
      "",
      "~~~markdown",
      "中文 Markdown 示例。",
      "~~~",
      "",
      "```ts",
      'const message = "中文 Python";',
      "```",
      "",
      "```",
      "中文 Python",
      "```",
    ].join("\n");
    expect(normalizeMarkdownSource(source, true).source).toBe(
      [
        "```md",
        "# Python入门",
        "",
        "中文API说明。",
        "```",
        "",
        '```MDX title="Python示例"',
        '<p title="API文档">MDX Python正文</p>',
        "```",
        "",
        "~~~markdown",
        "中文Markdown示例。",
        "~~~",
        "",
        "```ts",
        'const message = "中文 Python";',
        "```",
        "",
        "```",
        "中文 Python",
        "```",
      ].join("\n"),
    );
  });

  it("maps fenced example content through containers without recursive Markdown blocks", () => {
    const source = [
      "> ````MDX",
      "> 中文 Python 示例。",
      ">",
      "> ```mdx",
      "> 内层 Python 内容。",
      "> ```",
      "> ````",
      "",
      "  ~~~md",
      "  缩进 Python 内容。",
      "  ~~~",
    ].join("\n");
    expect(normalizeMarkdownSource(source, true).source).toBe(
      [
        "> ````MDX",
        "> 中文Python示例。",
        ">",
        "> ```mdx",
        "> 内层 Python 内容。",
        "> ```",
        "> ````",
        "",
        "  ~~~md",
        "  缩进Python内容。",
        "  ~~~",
      ].join("\n"),
    );
  });

  it("maps fenced examples after front matter and preserves CRLF", () => {
    expect(
      normalizeContentSource(
        "---\r\ntitle: 测试\r\n---\r\n\r\n```mdx\r\n中文 Python 内容。\r\n```\r\n",
      ).source,
    ).toBe(
      "---\r\ntitle: 测试\r\n---\r\n\r\n```mdx\r\n中文Python内容。\r\n```\r\n",
    );
  });

  it("processes Markdown examples in Markdown files", () => {
    expect(
      normalizeMarkdownSource("```markdown\n中文 Python 内容。\n```", false)
        .source,
    ).toBe("```markdown\n中文Python内容。\n```");
  });

  it("recognizes punctuation that belongs to a visible non-CJK token", () => {
    expect(
      normalizeMarkdownSource(
        String.raw`中文 %s 参数，价格 \$10，使用 \$HOME，C++ 程序，100% 完成，
@user 账户与 .env 文件。`,
      ).source,
    ).toBe(
      String.raw`中文%s参数，价格\$10，使用\$HOME，C++程序，100%完成，
@user账户与.env文件。`,
    );
  });

  it("tightens spaces around CJK punctuation without changing Western sentence spaces", () => {
    expect(
      normalizeMarkdownSource(
        "中文 ， API；中文（ API ）。\n\nHello. English — text.",
      ).source,
    ).toBe("中文，API；中文（API）。\n\nHello. English — text.");
  });

  it("keeps Markdown-separating spaces when removing them would change the AST", () => {
    expect(
      normalizeMarkdownSource("**基线是什么？** 最小规模取什么值？").source,
    ).toBe("**基线是什么？** 最小规模取什么值？");
    expect(normalizeMarkdownSource("**解** $(X,Y)$ 是随机向量。").source).toBe(
      "**解** $(X,Y)$是随机向量。",
    );
    expect(
      normalizeContentSource(
        '---\ntitle: "**基线是什么？** 最小规模"\n---\n\n正文。',
      ).source,
    ).toBe('---\ntitle: "**基线是什么？** 最小规模"\n---\n\n正文。');
    expect(
      normalizeJsonTextSource('{"message":"**基线是什么？** 最小规模"}').source,
    ).toBe('{"message":"**基线是什么？** 最小规模"}');
  });

  it("covers directive titles, code metadata, and MDX text", () => {
    const source = [
      ':::example{title="X 型区域：Python 入门"}',
      "正文 Python 内容。",
      ":::",
      "",
      '<p title="Python 标题">MDX Python 正文</p>',
      "",
      '```ts title="Python 示例"',
      'const value = "中文 Python";',
      "```",
    ].join("\n");
    expect(normalizeMarkdownSource(source, true).source).toBe(
      [
        ':::example{title="X型区域：Python入门"}',
        "正文Python内容。",
        ":::",
        "",
        '<p title="Python标题">MDX Python正文</p>',
        "",
        '```ts title="Python示例"',
        'const value = "中文 Python";',
        "```",
      ].join("\n"),
    );
  });

  it("covers inline and reference image alternative text and link titles", () => {
    expect(
      normalizeMarkdownSource(
        [
          '![Python 图像](/image "Rust 标题") [API 文档](/api "SDK 说明")',
          "",
          "![参考 Python][diagram] [参考 API][docs]",
          "",
          '[diagram]: /diagram "参考 Rust 标题"',
          '[docs]: /docs "参考 SDK 说明"',
        ].join("\n"),
      ).source,
    ).toBe(
      [
        '![Python图像](/image "Rust标题")[API文档](/api "SDK说明")',
        "",
        "![参考Python][diagram][参考API][docs]",
        "",
        '[diagram]: /diagram "参考Rust标题"',
        '[docs]: /docs "参考SDK说明"',
      ].join("\n"),
    );
  });

  it("covers visible HTML link and image attributes", () => {
    expect(
      normalizeMarkdownSource(
        [
          '<a href="/docs" title="API 文档">API 链接文字</a>',
          '<img src="/diagram" alt="Python 图像">',
        ].join("\n"),
      ).source,
    ).toBe(
      [
        '<a href="/docs" title="API文档">API链接文字</a>',
        '<img src="/diagram" alt="Python图像">',
      ].join("\n"),
    );
  });

  it.each([
    ["English [中文](url) English", "English[中文](url)English"],
    ["中文 [English](url) 中文", "中文[English](url)中文"],
    ["English [English](url) English", "English [English](url) English"],
    ["English ![中文图像](image) English", "English![中文图像](image)English"],
    ["中文 ![English](image) 中文", "中文![English](image)中文"],
    ["English ![English](image) English", "English ![English](image) English"],
    ["English ![（中文）](image) English", "English![（中文）](image)English"],
  ])(
    "tightens link and image outer spaces with Chinese: %s",
    (source, expected) => {
      expect(normalizeMarkdownSource(source).source).toBe(expected);
    },
  );

  it.each([
    ["[ 中文 ](url)", "[中文](url)"],
    ["[ English ](url)", "[ English ](url)"],
    ["![ 中文 ](image)", "![中文](image)"],
    ["![ English ](image)", "![ English ](image)"],
  ])(
    "tightens spaces inside link and image delimiters with Chinese",
    (source, expected) => {
      expect(normalizeMarkdownSource(source).source).toBe(expected);
    },
  );

  it("tightens raw HTML link and image boundaries", () => {
    expect(
      normalizeMarkdownSource(
        [
          'English <a href="/docs">中文</a> English',
          'English <img src="/image" alt="中文"> English',
          'English <img src="/image" alt="（中文）"> English',
        ].join("\n"),
      ).source,
    ).toBe(
      [
        'English<a href="/docs">中文</a>English',
        'English<img src="/image" alt="中文">English',
        'English<img src="/image" alt="（中文）">English',
      ].join("\n"),
    );
  });

  it("tightens MDX image boundaries with punctuation-wrapped alternatives", () => {
    expect(
      normalizeMarkdownSource(
        'English <img src="/image" alt="（中文）" /> English',
        true,
      ).source,
    ).toBe('English<img src="/image" alt="（中文）" />English');
  });

  it("uses the Markdown AST when entities precede a target space", () => {
    expect(normalizeMarkdownSource("AT&amp;T 中文 Python").source).toBe(
      "AT&amp;T中文Python",
    );
  });

  it("preserves HTML-escaped spaces while cleaning other spaces", () => {
    expect(normalizeMarkdownSource("中文&#32;API 入门").source).toBe(
      "中文&#32;API入门",
    );
    expect(normalizeMarkdownSource("中文 &#32; API").source).toBe(
      "中文&#32;API",
    );
    expect(normalizeMarkdownSource("中文&#x20;API").edits).toEqual([]);
    expect(normalizeMarkdownSource("中文&#32;*API* 入门").source).toBe(
      "中文&#32;*API*入门",
    );
    expect(normalizeMarkdownSource("中文&#32;$x$ 入门").source).toBe(
      "中文&#32;$x$入门",
    );
    expect(
      normalizeJsonTextSource('{"message":"中文&#32;API 入门"}').source,
    ).toBe('{"message":"中文&#32;API入门"}');
  });

  it("reports how to preserve an intentional space", () => {
    expect(spacingPreservationHint).toContain("&#32;");
  });

  it("maps front matter offsets and Markdown blockquote continuations", () => {
    const source = [
      "---",
      "title: 测试",
      "---",
      "",
      "> [!NOTE]",
      "> 正文 CPU 硬件与 Python 默认运行。",
      "",
      String.raw`:::example{title="X 型区域：$\displaystyle x$"}`,
      "正文",
      ":::",
      "",
      "- :option[A]{#a} 选项 A",
    ].join("\n");
    expect(normalizeContentSource(source).source).toBe(
      [
        "---",
        "title: 测试",
        "---",
        "",
        "> [!NOTE]",
        "> 正文CPU硬件与Python默认运行。",
        "",
        String.raw`:::example{title="X型区域：$\displaystyle x$"}`,
        "正文",
        ":::",
        "",
        "- :option[A]{#a} 选项A",
      ].join("\n"),
    );
  });

  it("supports Han, Kana, Hangul, and accented Latin", () => {
    expect(normalizeMarkdownSource("漢字 café カナ Latin 한글").source).toBe(
      "漢字caféカナLatin한글",
    );
  });

  it("preserves spaces between non-CJK words and numbers", () => {
    expect(
      normalizeMarkdownSource("Web 3 模型，A 1 对，第 42 项。").source,
    ).toBe("Web 3模型，A 1对，第42项。");
  });

  it("normalizes front matter values but not metadata keys", () => {
    const source = [
      "---",
      "title: Python 入门",
      'description: "使用 API 的说明"',
      "tags: [C 语言, Python, 版本 2]",
      "order: 1",
      "---",
      "",
      "正文 Python 内容。",
    ].join("\n");
    expect(normalizeContentSource(source).source).toBe(
      [
        "---",
        "title: Python入门",
        'description: "使用API的说明"',
        "tags: [C语言, Python, 版本2]",
        "order: 1",
        "---",
        "",
        "正文Python内容。",
      ].join("\n"),
    );
  });

  it("normalizes JSON string values without rewriting keys or layout", () => {
    const source = [
      "{",
      '  "中文 Key": "中文 Python 入门",',
      '  "nested": { "message": "第 3 项，第 {count, number} 项与 Python 示例" },',
      '  "literal": "中文 {not valid} 文本"',
      "}",
    ].join("\n");
    expect(normalizeJsonTextSource(source).source).toBe(
      [
        "{",
        '  "中文 Key": "中文Python入门",',
        '  "nested": { "message": "第3项，第{count, number}项与Python示例" },',
        '  "literal": "中文 {not valid} 文本"',
        "}",
      ].join("\n"),
    );
  });

  it("does not clean JSON fenced code blocks", () => {
    const source = '```json\n{"result":"文本 {value}。"}\n```';
    expect(normalizeMarkdownSource(source, true).source).toBe(source);
  });

  it("removes JSON spaces without reserializing unrelated escapes", () => {
    const source = String.raw`{"message":"中文 \u0050ython 入门","separator":"中文\u0020Python","path":"\/api"}`;
    expect(normalizeJsonTextSource(source).source).toBe(
      String.raw`{"message":"中文\u0050ython入门","separator":"中文Python","path":"\/api"}`,
    );
  });

  it("preserves Markdown line breaks around ICU placeholders", () => {
    expect(
      normalizeJsonTextSource(
        '{"guide":"- [分类索引]({index})\\n{entries}\\n"}',
      ).source,
    ).toBe('{"guide":"- [分类索引]({index})\\n{entries}\\n"}');
  });

  it("is idempotent", () => {
    const once = normalizeContentSource(
      "---\ntitle: Python 入门\n---\n\n中文 API 说明。",
    );
    expect(once.edits).not.toHaveLength(0);
    expect(normalizeContentSource(once.source).edits).toEqual([]);
  });
});
