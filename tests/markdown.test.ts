import { describe, expect, it } from "vitest";
import {
  parseMarkdownFragment,
  renderMarkdownValue,
  renderMarkdownSource,
  normalizeSingleLine,
} from "@/lib/markdown/render";
import { renderIcuMarkdown } from "@/lib/markdown/icu";
import { parseContent } from "@/lib/content/syntax";
import { isMarkdownValue } from "@/lib/markdown/types";
import { readFixtureCatalog } from "./fixtures/generated";
describe("Markdown field contract", () => {
  it("renders an existing fragment without parsing its source again", () => {
    const fragment = parseMarkdownFragment("**Bold** and $x^2$");
    expect(
      renderMarkdownValue(fragment, {
        mode: "single-line",
        linkPolicy: "plain",
      }),
    ).toEqual(
      renderMarkdownSource("**Bold** and $x^2$", {
        mode: "single-line",
        linkPolicy: "plain",
      }),
    );
  });
  it.each([
    [
      "<b>bold</b> and <em>emphasis</em>",
      "bold and emphasis",
      "<strong>bold</strong>",
    ],
    ["# Heading", "Heading", "<strong>Heading</strong>"],
    ["one\n\ntwo  \nthree", "one two three", "one two three"],
    ["$$\nx^2\n$$", "x^2", 'class="katex"'],
    ["```ts\none\ntwo\n```", "one two", "<code>one two</code>"],
    ["1. one\n2. two", "1. one；2. two", "1. one；2. two"],
    ["| a | b |\n|---|---|\n| c | d |", "a · b；c · d", "a · b；c · d"],
    ["> **quoted**", "quoted", "<strong>quoted</strong>"],
    ["![**alt**](/image) ![](/empty)", "alt", "alt"],
    [
      "<div><h2>HTML</h2><p>paragraph</p></div>",
      "HTML paragraph",
      "<strong>HTML</strong>",
    ],
    [
      ":::example\n# Title\n\nText\n:::",
      "Title Text",
      "<strong>Title</strong>",
    ],
  ])("compresses %s", (source, text, html) => {
    const value = renderMarkdownSource(source, { mode: "single-line" });
    expect(value.text).toBe(text);
    expect(value.html).toContain(html);
    expect(value.html).not.toMatch(
      /<(?:h[1-6]|p|pre|table|ul|ol|div|img|blockquote)[\s>]/,
    );
    expect(value.html).not.toContain('class="katex-display"');
  });
  it("preserves full blocks and summaries and permits natural wrapping", () => {
    for (const mode of ["block", "summary"] as const)
      expect(
        renderMarkdownSource("# Heading\n\nBody", { mode }).html,
      ).toContain("<h1>");
    expect(renderMarkdownSource("long title").html).not.toContain("nowrap");
  });
  it("uses link policy and reference definitions consistently", () => {
    const source = "[link][a]\n\n[a]: /target";
    expect(renderMarkdownSource(source).html).toContain('<a href="/target">');
    expect(renderMarkdownSource(source, { linkPolicy: "plain" }).html).toBe(
      "link",
    );
    expect(
      renderMarkdownSource("[bad](javascript:alert(1))").html,
    ).not.toContain("javascript:");
  });
  it("compresses native MDX block structure", () => {
    const tree = normalizeSingleLine(
      parseContent("<div>\n\n## Heading\n\nText\n\n</div>", true),
    );
    expect(JSON.stringify(tree)).not.toContain("mdxJsx");
    expect(JSON.stringify(tree)).toContain("strong");
  });
  it("prepares every content title, summary and reference, including private data", () => {
    for (const scope of ["public", "private"] as const) {
      const catalog = readFixtureCatalog("vitest", scope);
      for (const doc of catalog.documents) {
        expect(isMarkdownValue(doc)).toBe(true);
        expect(isMarkdownValue(doc.title)).toBe(true);
        expect(isMarkdownValue(doc.description)).toBe(true);
        for (const section of doc.sections) {
          expect(isMarkdownValue(section)).toBe(true);
          expect(isMarkdownValue(section.title)).toBe(true);
          expect(isMarkdownValue(section.summary)).toBe(true);
        }
        for (const ref of [
          ...(doc.references ?? []),
          ...doc.sections.flatMap((s) => s.references ?? []),
        ])
          expect(isMarkdownValue(ref.title)).toBe(true);
      }
    }
  });
});
describe("joint ICU Markdown", () => {
  it("parses Markdown arguments independently inside surrounding markup", () => {
    expect(
      renderIcuMarkdown("**Hello {name}**", { name: "*world*" }).html,
    ).toBe("<strong>Hello <em>world</em></strong>");
    const value = renderIcuMarkdown("**{first} {second}**", {
      first: "left*",
      second: "*right",
    });
    expect(value.html).toBe("<strong>left* *right</strong>");
    expect(renderMarkdownSource(value.markdown).html).toBe(value.html);
    expect(renderIcuMarkdown("before{space}after", { space: " " }).html).toBe(
      "before after",
    );
  });
  it("preserves prepared rich values and does not interpret their text as ICU", () => {
    const inner = renderIcuMarkdown("**{name}**", { name: "*world*" });
    const outer = renderIcuMarkdown("Before {value}", { value: inner });
    expect(outer.html).toContain("<strong>");
    expect(outer.html).toContain("<em>");
    expect(renderIcuMarkdown("{value}", { value: "**{unbound}**" }).html).toBe(
      "<strong>{unbound}</strong>",
    );
    expect(renderIcuMarkdown("{value}", { value: "LNATOM0END" }).text).toBe(
      "LNATOM0END",
    );
  });
  it("keeps block fragments in block positions and normalizes them in inline positions", () => {
    const body = "# Heading\n\nBody\n\n- One\n- Two";
    const block = renderIcuMarkdown("{body}", { body }, { mode: "block" });
    expect(block.html).toContain("<h1>Heading</h1>");
    expect(block.html).toContain("<ul>");
    const inline = renderIcuMarkdown(
      "Before {body} after",
      { body },
      { mode: "block" },
    );
    expect(inline.html).toContain("<strong>Heading</strong>");
    expect(inline.html).not.toContain("<h1>");
    expect(inline.html).not.toContain("<ul>");
    expect(renderIcuMarkdown("{body}", { body }).html).not.toContain("<h1>");
  });
  it("binds Markdown references within their own argument layer", () => {
    const value = renderIcuMarkdown("[outer][ref] {value}\n\n[ref]: /outer", {
      value: "[inner][ref]\n\n[ref]: /inner",
    });
    expect(value.html).toContain('<a href="/outer">outer</a>');
    expect(value.html).toContain('<a href="/inner">inner</a>');
    const literal = renderIcuMarkdown("{value}\n\n[ref]: /outer", {
      value: "[ref]",
    });
    expect(literal.html).not.toContain("<a");
  });
  it("allows Markdown and formulas inside selected branches and arguments", () => {
    const value = renderIcuMarkdown(
      "**{n, plural, one {{label}} other {{label}}}**",
      { n: 2, label: "[formula](/formula) $x^2$" },
      { locale: "en" },
    );
    expect(value.html).toContain('<strong><a href="/formula">formula</a>');
    expect(value.html).toContain('class="katex"');
  });
  it("combines Markdown across selected branches and nested plurals", () => {
    expect(
      renderIcuMarkdown(
        "**{n, plural, =0 {none} one {# item} other {# items}}**",
        { n: 2 },
        { locale: "en" },
      ).html,
    ).toBe("<strong>2 items</strong>");
    expect(
      renderIcuMarkdown("{who, select, a {**A**} other {*B*}}", { who: "a" })
        .html,
    ).toBe("<strong>A</strong>");
    expect(
      renderIcuMarkdown(
        "{n, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}",
        { n: 22 },
        { locale: "en" },
      ).text,
    ).toBe("22nd");
  });
  it("supports number/date/time formatting deterministically", () => {
    expect(
      renderIcuMarkdown("{n, number, percent}", { n: 0.25 }, { locale: "en" })
        .text,
    ).toBe("25%");
    expect(
      renderIcuMarkdown(
        "{d, date, ::yyyyMMdd}",
        { d: new Date("2020-01-02T12:00:00Z") },
        { locale: "en" },
      ).text,
    ).toContain("2020");
    expect(
      renderIcuMarkdown(
        "{d, time, short}",
        { d: new Date("2020-01-02T12:00:00Z") },
        { locale: "en" },
      ).text,
    ).toMatch(/\d/);
  });
  it("supports TeX groups, ICU quoted braces and math parameters", () => {
    for (const template of [
      "$x<1+{value}$",
      "$\\sqrt[3]{y}+{value}$",
      "$\\frac{x}{y}+{value}$",
      "$\\frac{\\sqrt{x}}{y}+{value}$",
      "$\\frac{1}{2}+{value}$",
      "$x^{2}+{value}$",
      "$\\mathrm'{x}'+{value}$",
    ]) {
      const value = renderIcuMarkdown(template, { value: 3 });
      expect(value.html).toContain('class="katex"');
      expect(value.html).not.toContain("katex-error");
    }

    const symbols = renderIcuMarkdown("$x={value}b$", {
      value: "\\alpha+\\frac{1}{2}+z^2",
    });
    expect(symbols.html).toContain("<mi>α</mi>");
    expect(symbols.html).toContain("<mfrac>");
    expect(symbols.html).toContain("<msup>");
    expect(symbols.html).not.toContain("katex-error");
    expect(symbols.markdown).not.toContain("\\text");
    const prepared = renderMarkdownSource("$\\alpha+x^2$");
    expect(
      renderIcuMarkdown("$a={value}$", { value: prepared }).html,
    ).toContain("<mi>α</mi>");
    expect(() => renderIcuMarkdown("$x={value}$", { value: "}" })).toThrow(
      /Invalid TeX argument fragment/,
    );
  });
  it("keeps TeX argument comments and commands inside the argument layer", () => {
    for (const value of [
      "\\alpha%comment\nx",
      "\\text{a%comment\nb}",
      "\\frac{a}%comment\n{b}",
      "\\verb|a%b|",
      "5\\%",
    ]) {
      const result = renderIcuMarkdown("$a+{value}+b$", { value });
      expect(result.html).not.toContain("katex-error");
      expect(renderMarkdownSource(result.markdown).html).not.toContain(
        "katex-error",
      );
    }
    const alpha = renderIcuMarkdown("$a+{value}+b$", {
      value: "\\alpha% trailing comment",
    });
    expect(alpha.html).toContain("<mi>α</mi>");
    expect(alpha.html).toContain("<mi>b</mi>");
  });
  it("preserves explicit ICU number formatting inside math", () => {
    const result = renderIcuMarkdown(
      "$" + "{n, number, percent}$",
      { n: 0.25 },
      { locale: "en" },
    );
    expect(result.html).toContain("25%");
    expect(result.html).not.toContain("katex-error");
  });
  it("interpolates URL and image attributes as values without changing Markdown structure", () => {
    expect(renderIcuMarkdown("<https://example.com>").html).toContain(
      'href="https://example.com"',
    );
    expect(() =>
      renderIcuMarkdown("{missing}", { missing: undefined } as never),
    ).toThrow(/Missing ICU argument/);
    expect(renderIcuMarkdown("`<T>`").html).toBe("<code>&lt;T&gt;</code>");
    expect(
      renderIcuMarkdown("[**{label}**]({url})", {
        label: "*name*",
        url: '/target?q="value"',
      }).html,
    ).toBe(
      '<a href="/target?q=&quot;value&quot;"><strong><em>name</em></strong></a>',
    );
    const image = renderIcuMarkdown(
      "![{caption}]({url})",
      { caption: "**diagram**", url: "/image" },
      { mode: "block" },
    );
    expect(image.html).toBe('<p><img src="/image" alt="diagram"></p>');
    const code = renderIcuMarkdown("`{snippet}` after", {
      snippet: "` **literal** $x$",
    });
    expect(code.html).toBe("<code>` **literal** $x$</code> after");
  });
  it("fails clearly for missing arguments and custom tags", () => {
    expect(() => renderIcuMarkdown("{missing}")).toThrow(
      /Missing ICU argument/,
    );
    expect(() => renderIcuMarkdown("<custom>text</custom>")).toThrow(
      /Unsupported ICU XML tag/,
    );
  });
});
