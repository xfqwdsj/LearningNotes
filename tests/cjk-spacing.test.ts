import { describe, expect, it } from "vitest";
import {
  normalizeContentSource,
  normalizeJsonTextSource,
  normalizeMarkdownSource,
} from "../scripts/cjk-spacing";

describe("CJK and non-CJK source spacing", () => {
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
    ).toBe("中文*Python*入门，**English**中文，[Rust语言](/rust) 与API。");
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
      "**解** $(X,Y)$ 是随机向量。",
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

  it("covers image alternative text and link titles", () => {
    expect(
      normalizeMarkdownSource(
        '![Python 图像](/image "Rust 标题") [API 文档](/api "SDK 说明")',
      ).source,
    ).toBe('![Python图像](/image "Rust标题") [API文档](/api "SDK说明")');
  });

  it("uses the Markdown AST when entities precede a target space", () => {
    expect(normalizeMarkdownSource("AT&amp;T 中文 Python").source).toBe(
      "AT&amp;T中文Python",
    );
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
