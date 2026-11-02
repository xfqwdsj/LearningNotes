import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import {
  generatedPath,
  readFixtureCatalog,
  readFixtureJson,
} from "./fixtures/generated";
import { slots } from "@/lib/content/semantic";
import { parseContent } from "@/lib/content/syntax";
import { exportMarkdown } from "@/lib/content/content-export";
import { remarkGithubAlerts } from "@/lib/content/github-alerts";
import { renderSource } from "@/lib/content/source-render";
import {
  extractSections,
  parseMarkdown,
  renderMarkdown,
  stringifyMarkdown,
} from "@/lib/content/compile";
import type { SearchDocument } from "@/lib/content/types";
describe("GitHub alerts", () => {
  it("keeps alert syntax in export and renders a localized note", async () => {
    const source = "> [!NOTE]\n> **观察什么**\n>\n> 改变点上的函数值。\n";
    const tree = parseContent(source, true);
    const exported = exportMarkdown(tree);
    expect(exported).toContain("[!NOTE]");
    expect(exported).not.toContain("\\[!NOTE]");
    remarkGithubAlerts()(tree);
    const alert = tree.children[0];
    expect(alert?.type).toBe("containerDirective");
    if (alert?.type !== "containerDirective") throw new Error("missing alert");
    expect(alert.name).toBe("alert");
    expect(alert.attributes?.["type"]).toBe("note");
    const html = await renderSource(tree);
    expect(html).toContain("mdx-alert-note");
    expect(html).toContain("备注");
    expect(html).toContain("观察什么");
  });
  it("keeps display math after an alert whose bracket is escaped on stringify", async () => {
    const tree = parseContent(
      "> [!NOTE]\n> 注意。\n\n$$\n\\frac{\\tan \\alpha}{2}\n$$",
      true,
    );
    const html = await renderSource(tree);
    expect(html).toContain("katex");
    expect(html).toContain("mdx-alert-note");
  });
});
describe("question Markdown assets", () => {
  it("uses sequential titles instead of missing original numbers and groups multiple-choice answers", () => {
    const root = generatedPath(
      "vitest",
      "public/assets/knowledge/maths/limits/continuity/questions/continuity-check/absolute",
    );
    const parent = readFileSync(`${root}.md`, "utf8");
    const part = readFileSync(`${root}/properties.md`, "utf8");
    expect(parent.split("\n")[0]).toBe("# 示例知识点 · 题1");
    expect(part.split("\n")[0]).toBe("# 示例知识点 · 小题1.2");
    expect(part).not.toContain("undefined");
    expect(part).toContain("答案：A、C");
    expect(part).not.toContain("参考解答");
    expect(part).not.toMatch(/\n{4,}/);
  });
  it("publishes the complete structured question resource and set Markdown", () => {
    const root = generatedPath(
      "vitest",
      "public/assets/knowledge/maths/limits/continuity",
    );
    const resource = JSON.parse(
      readFileSync(`${root}/questions.json`, "utf8"),
    ) as {
      version: number;
      problemSets: {
        id: string;
        markdown: string;
        discussion: { markdown: string; text: string; html: string };
        questions: {
          target: string;
          markdown: string;
          discussion: { markdown: string; text: string; html: string };
          answers: { markdown: string }[];
          parts: {
            target: string;
            markdown: string;
            discussion: { markdown: string; text: string; html: string };
            answers: { markdown: string }[];
            parts: never[];
          }[];
        }[];
      }[];
    };
    const set = resource.problemSets[0]!;
    const parent = set.questions[0]!;
    expect(resource.version).toBe(2);
    expect(set.markdown).toContain("练习");
    expect(set.discussion.markdown).toContain("练习");
    expect(parent.markdown).toContain("示例题面");
    expect(
      [parent, ...parent.parts].some((question) =>
        question.answers.some((answer) => answer.markdown.length > 0),
      ),
    ).toBe(true);
    expect(readFileSync(`${root}/questions/sets/${set.id}.md`, "utf8")).toBe(
      set.markdown.trim(),
    );
  });
});
describe("content semantics", () => {
  it("defines a local label for every semantic slot", () => {
    const messages = JSON.parse(
      readFileSync("messages/zh-CN.json", "utf8"),
    ) as { semantic?: Record<string, string> };
    for (const names of Object.values(slots))
      for (const name of names)
        expect(messages.semantic?.[name], name).toBeTruthy();
  });
  it("recognizes stable semantic IDs and more summaries", () => {
    const sections = extractSections(
      "## 定义\n\n::section{#definition}\n\n简短定义。\n\n<!-- more -->\n\n详细说明。\n\n## 例题\n\n题目。",
    );
    expect(sections[0]?.id).toBe("definition");
    expect(sections[0]?.summary.text).toBe("简短定义。");
    expect(sections[0]?.markdown).toContain("详细说明");
  });
  it("rejects repeated semantic IDs", () => {
    expect(() =>
      extractSections(
        "## 一\n\n::section{#definition}\n\na\n\n## 二\n\n::section{#definition}\n\nb",
      ),
    ).toThrow("Duplicate section");
  });
  it("rejects a standalone proof section that only wraps one proof block", () => {
    expect(() =>
      extractSections(
        '## 证明\n\n::section{#proof slot="knowledge.proof"}\n\n:::proof\n\n正文。\n\n:::',
      ),
    ).toThrow("knowledge.proof sections must contain the proof directly");
  });
  it("parses both delimiters before Markdown escape processing", async () => {
    const source =
      "内联 \\(x^2\\) 与 $y^2$。\n\n\\[\n\\frac{1}{2}\n\\]\n\n`\\(not math\\)`\n\n```text\n\\[not math\\]\n```";
    const html = await renderMarkdown(source);
    expect(html.match(/class="katex"/g)).toHaveLength(3);
    expect(html).toContain("not math");
    const exported = stringifyMarkdown(parseMarkdown(source));
    expect(exported).toContain("$x^2$");
    expect(exported).toContain("$$");
  });
  it("renders code metadata, highlighted lines, numbers and library copy controls", async () => {
    const html = await renderMarkdown(
      '```ts title="example.ts" {2} ins={1} /answer/ startLineNumber=5\nconst answer = 42;\nconsole.log(answer);\n```',
    );
    expect(html).toContain("expressive-code");
    expect(html).toContain("example.ts");
    expect(html).toContain('data-language="ts"');
    expect(html).toContain('class="ln"');
    expect(html).toContain("data-copy-code=");
    expect(html).toMatch(/class="ec-line[^"]*highlight/);
    expect(html).toMatch(/class="ec-line[^"]*ins/);
    expect(html).not.toContain("<script");
  });
  it("keeps ordinary currency and escapes as text", async () => {
    const html = await renderMarkdown("价格 \\$20。转义 \\\\(x\\\\)。");
    expect(html).not.toContain('class="katex"');
  });
});
describe("generated content contract", () => {
  const load = (mode: "public" | "private") =>
    readFixtureCatalog("vitest", mode);
  it("generates a slug for every document", () => {
    for (const mode of ["public", "private"] as const)
      expect(
        load(mode).documents.every((document) => document.slug.length > 0),
      ).toBe(true);
  });
  it("keeps directory indexes lightweight while preserving full entry data", () => {
    const indexRoot = generatedPath("vitest", "public/assets/index");
    const indexFile = readdirSync(indexRoot, {
      recursive: true,
      encoding: "utf8",
    }).find((relative) => {
      if (!relative.endsWith(".json")) return false;
      const value = JSON.parse(
        readFileSync(`${indexRoot}/${relative}`, "utf8"),
      ) as {
        version?: number;
        entries?: { entry?: string; sections?: unknown }[];
      };
      return (
        value.version === 3 &&
        value.entries?.some((entry) => entry.entry && !entry.sections)
      );
    });
    expect(indexFile).toBeDefined();
    if (!indexFile) return;
    const index = JSON.parse(
      readFileSync(`${indexRoot}/${indexFile}`, "utf8"),
    ) as {
      version: number;
      entries: { entry: string }[];
    };
    const entry = index.entries.find((item) => item.entry)!.entry;
    const detail = JSON.parse(
      readFileSync(generatedPath("vitest", `public/assets${entry}`), "utf8"),
    ) as {
      version: number;
      sections: unknown[];
      problemSets: unknown[];
    };
    expect(index.version).toBe(3);
    expect(detail.version).toBe(3);
    expect(Array.isArray(detail.sections)).toBe(true);
    expect(Array.isArray(detail.problemSets)).toBe(true);
  });
  it("keeps private documents out of public data and resolves references", () => {
    const publicCatalog = load("public");
    const privateCatalog = load("private");
    expect(publicCatalog.documents.every((doc) => !doc.private)).toBe(true);
    expect(
      privateCatalog.documents.every(
        (doc) => doc.href.startsWith("/private/") && doc.private,
      ),
    ).toBe(true);
    const content = readFileSync(
      generatedPath("vitest", "public/catalog.json"),
      "utf8",
    );
    for (const doc of privateCatalog.documents)
      expect(content).not.toContain(doc.href);
    const article = publicCatalog.documents.find(
      (doc) => doc.path === "articles/connected-learning",
    );
    expect(article?.markdown).toContain("固定文字");
    expect(article?.markdown).not.toContain("<Knowledge");
  });
  it("keeps one section per semantic heading in a knowledge point", () => {
    const catalog = load("public");
    for (const doc of catalog.documents) {
      if (doc.kind !== "knowledge") continue;
      for (const title of ["定义", "性质", "证明", "例子", "交互探索"]) {
        expect(
          doc.sections.filter((section) => section.title.text === title).length,
          `${doc.path} · ${title}`,
        ).toBeLessThanOrEqual(1);
      }
    }
  });
  it("keeps a practice set before the following exploration section", () => {
    const catalog = load("public");
    const readingPage = catalog.documents.find(
      (doc) => doc.path === "knowledge/maths/limits/continuity",
    );
    expect(
      readingPage?.html.indexOf('data-learning-problem-set="'),
    ).toBeLessThan(readingPage?.html.indexOf('id="exploration"') ?? -1);
  });
  it("keeps included bodies out of host search text and exposes reference locations", () => {
    const catalog = load("public");
    const continuity = catalog.documents.find(
      (doc) => doc.path === "knowledge/maths/limits/continuity",
    );
    const references = continuity?.sections.find(
      (section) => section.id === "definition",
    )?.references;
    expect(
      references?.some((reference) =>
        reference.href.startsWith(
          "/courses/maths/higher-mathematics/1.8/#ref-",
        ),
      ),
    ).toBe(true);
    const search = readFixtureJson<SearchDocument[]>(
      "vitest",
      "public/search.json",
    );
    const noteSearch = search.find(
      (doc) => doc.key === "courses/maths/higher-mathematics/1.8/zh-CN",
    );
    expect(noteSearch?.text).not.toContain("夹具检索词");
    expect(
      search
        .find((doc) => doc.key === "knowledge/maths/limits/continuity/zh-CN")
        ?.references?.some((reference) =>
          reference.href.startsWith(
            "/courses/maths/higher-mathematics/1.8/#ref-",
          ),
        ),
    ).toBe(true);
  });
  it("uses namespace-scoped task IDs and natural chapter order", () => {
    const catalog = load("public");
    const course = catalog.documents.filter(
      (doc) => doc.course === "higher-mathematics",
    );
    expect(course.findIndex((doc) => doc.path.endsWith("/8.1"))).toBeLessThan(
      course.findIndex((doc) => doc.path.endsWith("/10.1")),
    );
    expect(
      catalog.documents
        .filter((doc) => doc.subject === "cs" && doc.kind === "course-note")
        .every((doc) => doc.course === "csintro"),
    ).toBe(true);
    const taskKeys = load("private").documents.map(
      (doc) => `${doc.subject}/${doc.course}/${doc.taskType}/${doc.id}`,
    );
    expect(new Set(taskKeys).size).toBe(taskKeys.length);
  });
});
