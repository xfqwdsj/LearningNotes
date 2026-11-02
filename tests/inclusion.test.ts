import { describe, expect, it } from "vitest";
import { normalizeHeadingLevels } from "@/lib/content/heading-levels";
import {
  createSourceResolver,
  type ContentSource,
} from "@/lib/content/source-resolver";
import { stringifyContent } from "@/lib/content/syntax";
import { renderSource } from "@/lib/content/source-render";
import { exportMarkdown } from "@/lib/content/content-export";
import { sourceSections } from "@/lib/content/source-sections";
import { readFixtureCatalog } from "./fixtures/generated";
const source = (
  name: string,
  body: string,
  extra: Partial<ContentSource> = {},
): ContentSource => ({
  file: `/content/${name}.mdx`,
  contentPath: `articles/${name}.mdx`,
  body,
  private: false,
  data: { kind: "article", lang: "zh-CN", title: name },
  ...extra,
  ...(extra.data?.kind === "knowledge"
    ? {
        contentPath: extra.contentPath ?? `knowledge/maths/${name}.mdx`,
      }
    : {}),
});
describe("shared source inclusion", () => {
  it("does not transfer a removed root slot to child headings and preserves independently marked children", () => {
    const original = source(
      "concept",
      `## Definition
::section{#definition slot="knowledge.definition"}

### First ordinary child

Text.

### Marked child
::section{#examples slot="knowledge.examples"}

Example.`,
      {
        data: {
          kind: "knowledge",
          lang: "zh-CN",
          title: "Concept",
        },
      },
    );
    const host = source(
      "host",
      '::knowledge{path="maths/concept" slot="definition"}',
    );
    const resolver = createSourceResolver([original, host]);
    const extracted = sourceSections(resolver.resolve(host)).map(
      (item) => item.section,
    );
    expect(extracted[0]?.slot).toBeUndefined();
    expect(extracted[1]?.slot).toBe("knowledge.examples");
    const own = sourceSections(resolver.resolve(original)).map(
      (item) => item.section,
    );
    expect(own.find((section) => section.id === "definition")?.slot).toBe(
      "knowledge.definition",
    );
    expect(
      own.find((section) => section.title.text === "First ordinary child")
        ?.slot,
    ).toBeUndefined();
  });
  it("resolves equal filenames by their full subject and category paths", () => {
    const c = source("c", "## Rule\nC", {
      contentPath: "knowledge/cs/programming/c/operator-precedence.mdx",
      data: {
        kind: "knowledge",
        lang: "zh-CN",
        title: "C",
      },
    });
    const python = source("python", "## Rule\nPython", {
      contentPath: "knowledge/cs/programming/python/operator-precedence.mdx",
      data: {
        kind: "knowledge",
        lang: "zh-CN",
        title: "Python",
      },
    });
    const host = source(
      "host",
      '::knowledge{path="cs/programming/c/operator-precedence"}\n\n::knowledge{path="cs/programming/python/operator-precedence"}',
    );
    const resolver = createSourceResolver([c, python, host]);
    expect(resolver.href(c)).toBe(
      "/knowledge/cs/programming/c/operator-precedence/",
    );
    expect(resolver.href(python)).toBe(
      "/knowledge/cs/programming/python/operator-precedence/",
    );
    const output = stringifyContent(resolver.resolve(host), true);
    expect(output).toContain("Python");
    expect(output).toContain("C");
  });

  it("omits selected headings, rebases descendants and preserves source semantic roles", async () => {
    const knowledge = source(
      "concept",
      '## Definition\n::section{#definition slot="knowledge.definition"}\n\nText $x^2$.\n\n#### Child\n\nBody.\n',
      {
        data: {
          kind: "knowledge",
          lang: "zh-CN",
          title: "Concept",
        },
      },
    );
    const host = source(
      "host",
      '## Host\n\n::knowledge{path="maths/concept" slot="definition"}\n\n::include{src="/knowledge/maths/concept/" section="definition"}\n',
    );
    const resolved = createSourceResolver([knowledge, host]).resolve(host);
    const html = await renderSource(resolved);
    expect(html).not.toMatch(/<h[1-6][^>]*>Definition<\/h/);
    expect(html).toContain('data-slot="knowledge.definition"');
    expect(html).toContain('<h3 id="inc-1-child">');
    expect(html).toContain('<h3 id="inc-2-child">');
    expect(html).toContain("katex");
    expect(exportMarkdown(resolved)).not.toContain("::knowledge");
    expect(exportMarkdown(resolved)).toContain(
      "/knowledge/maths/concept/#definition",
    );
    expect(
      new Set(sourceSections(resolved).map((s) => s.section.id)).size,
    ).toBe(sourceSections(resolved).length);
  });
  it("renders Markdown titles in inclusion source hints for HTML and export", async () => {
    const knowledge = source(
      "f-distribution",
      '## Definition\n::section{#definition slot="knowledge.definition"}\n\nText.\n',
      {
        data: {
          kind: "knowledge",
          lang: "zh-CN",
          title: "$F$ 分布",
        },
      },
    );
    const host = source(
      "host",
      '::knowledge{path="maths/f-distribution" slot="definition"}',
    );
    const resolved = createSourceResolver([knowledge, host]).resolve(host);
    const html = await renderSource(resolved);
    const sourceHint = /<p class="inclusion-source">([\s\S]*?)<\/p>/.exec(
      html,
    )?.[1];
    expect(sourceHint).toContain('class="katex"');
    expect(sourceHint).not.toContain("$F$");
    const markdown = exportMarkdown(resolved);
    expect(markdown).toContain(
      "[来源：$F$ 分布](/knowledge/maths/f-distribution/#definition)",
    );
    expect(markdown).not.toContain("\\$F\\$");
  });
  it("collects source sections and stable host anchors for references", () => {
    const knowledge = source(
      "concept",
      '## Definition\n::section{#definition slot="knowledge.definition"}\n\nText.\n',
      {
        data: {
          kind: "knowledge",
          lang: "zh-CN",
          title: "Concept",
        },
      },
    );
    const host = source(
      "host",
      '## First\n\n::knowledge{path="maths/concept" slot="definition"}\n\n## Second\n\n::knowledge{path="maths/concept" slot="definition"}\n',
    );
    const references: {
      sourceHref: string;
      sourceSectionId?: string;
      hostSectionTitle?: string;
      anchor: string;
    }[] = [];
    createSourceResolver([knowledge, host]).resolve(
      host,
      [],
      "",
      undefined,
      (reference) => references.push(reference),
    );
    expect(references).toHaveLength(2);
    expect(references[0]?.sourceHref).toBe(
      "/knowledge/maths/concept/#definition",
    );
    expect(references[0]?.sourceSectionId).toBe("definition");
    expect(references[0]?.hostSectionTitle).toBe("First");
    expect(references[0]?.anchor).toBe(
      "ref-knowledge-maths-concept-definition",
    );
    expect(references[1]?.hostSectionTitle).toBe("Second");
    expect(references[1]?.anchor).toBe(
      "ref-knowledge-maths-concept-definition-2",
    );
  });
  it("shares non-mutating heading normalization and caps at h6", () => {
    const host = source("host", "#### Child\n\n###### Nested");
    const tree = createSourceResolver([host]).parse(host);
    expect(stringifyContent(normalizeHeadingLevels(tree, 3), true)).toContain(
      "### Child",
    );
    expect(stringifyContent(tree, true)).toContain("#### Child");
    expect(stringifyContent(normalizeHeadingLevels(tree, 6), true)).toContain(
      "###### Nested",
    );
  });
  it("resolves host locale fallback, validates selectors, cycles and private isolation", () => {
    const zh = source(
      "zh",
      '## Definition\n::section{#definition slot="knowledge.definition"}\n\nChinese',
      {
        contentPath: "knowledge/maths/concept.mdx",
        data: {
          kind: "knowledge",
          lang: "zh-CN",
          title: "Concept",
        },
      },
    );
    const en = source(
      "en",
      '## Definition\n::section{#definition slot="knowledge.definition"}\n\nEnglish',
      {
        contentPath: "knowledge/maths/concept.mdx",
        data: {
          kind: "knowledge",
          lang: "en",
          title: "Concept",
        },
      },
    );
    const host = source(
      "host",
      "::knowledge{path=maths/concept slot=definition}",
      {
        data: { kind: "article", lang: "en-US", title: "Host" },
      },
    );
    expect(
      exportMarkdown(createSourceResolver([zh, en, host]).resolve(host)),
    ).toContain("English");
    const privateSource = { ...zh, private: true };
    expect(() =>
      createSourceResolver([privateSource, host]).resolve(host),
    ).toThrow("inaccessible");
    const cycle = source("cycle", '::include{src="/articles/cycle/"}');
    expect(() => createSourceResolver([cycle]).resolve(cycle)).toThrow(
      "Circular",
    );
    expect(() =>
      createSourceResolver([
        zh,
        source("missing", "::knowledge{path=maths/concept slot=missing}"),
      ]).resolve(
        source("missing", "::knowledge{path=maths/concept slot=missing}"),
      ),
    ).toThrow("Missing inclusion");
  });
  it("keeps fences, escapes and ordinary colon text out of directive interpretation", async () => {
    const host = source(
      "host",
      "Time 22:00.\n\n\\:knowledge\\{slug=literal\\}\n\n~~~md\n::include{src=missing}\n~~~",
    );
    const resolved = createSourceResolver([host]).resolve(host);
    expect(await renderSource(resolved)).toContain("22:00");
    expect(exportMarkdown(resolved)).toContain("::include");
  });
  it("keeps current article source links without a duplicate definition heading", () => {
    const catalog = readFixtureCatalog("vitest", "public");
    const article = catalog.documents.find(
      (doc) => doc.path === "articles/connected-learning",
    )!;
    expect(article.html).toContain('class="content-inclusion"');
    expect(article.html).not.toMatch(/<h[1-6][^>]*>定义<\/h/);
    expect(article.markdown).toContain(
      "/knowledge/maths/limits/continuity/#definition",
    );
  });
});

describe("knowledge definition organization", () => {
  it("keeps semantic section roles and independently includable child targets", () => {
    const body = `## Definition
::section{#definition slot="knowledge.definition"}

A definition sample.

## Conditions
::section{#conditions slot="knowledge.properties"}

A condition sample.

## Derivation
::section{#derivation slot="knowledge.proof"}

A derivation sample.

## One-variable case
::section{#one-variable}

F is a sample target.

## Two-variable case
::section{#two-variables}

F is another sample target.

## System case
::section{#system}

F is a third sample target.
`;
    const page = source("fixture-knowledge", body, {
      data: {
        kind: "knowledge",
        title: "Knowledge fixture",
        lang: "zh-CN",
      },
    });
    const resolver = createSourceResolver([page]);
    const sections = sourceSections(resolver.resolve(page)).map(
      (item) => item.section,
    );
    expect(
      sections.filter((section) => section.slot === "knowledge.definition"),
    ).toHaveLength(1);
    expect(sections.find((section) => section.id === "conditions")?.slot).toBe(
      "knowledge.properties",
    );
    expect(sections.find((section) => section.id === "derivation")?.slot).toBe(
      "knowledge.proof",
    );
    for (const id of ["one-variable", "two-variables", "system"]) {
      expect(
        sections.find((section) => section.id === id)?.slot,
      ).toBeUndefined();
      const host = source(
        `host-${id}`,
        `::include{src="/knowledge/maths/fixture-knowledge/" section="${id}"}`,
      );
      const expanded = createSourceResolver([page, host]).resolve(host);
      expect(stringifyContent(expanded)).toContain("F");
    }
  });
});
