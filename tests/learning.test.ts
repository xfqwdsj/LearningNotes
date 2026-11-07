import { describe, it, expect } from "vitest";
import { parseContent, stringifyContent } from "@/lib/content/syntax";
import { compileExercises } from "@/lib/content/exercises";
import { renderSource } from "@/lib/content/source-render";
import { exportMarkdown } from "@/lib/content/content-export";
import { sourceSections } from "@/lib/content/source-sections";
import { presentSections } from "@/lib/content/semantic";
import { attachProblemSets } from "@/lib/content/problem-sets";
import {
  createSourceResolver,
  type ContentSource,
} from "@/lib/content/source-resolver";
import { evaluateAnswer } from "@/lib/content/evaluation";
import type { ResponseInput } from "@/lib/content/learning-types";
import { clientProblemSet } from "@/lib/content/learning-client";
import {
  problemSetDiscussion,
  questionDiscussion,
} from "@/lib/content/learning-discussion";

const fixture = `### A source

::problems{#set}

::page{number="42"}

1. ::question{#q1 number="11"}

   A parent problem with :choice-slot{}.

   1. ::part{#p1}

      Value: :blank{#n type="number" placeholder="输入数值"} and :blank{#word type="text"}.

      :::reference
      ::correct{blank="n" value="0.5" tolerance="0.01"}

      ::correct{blank="word" value="é"}

      An explanation.
      :::

   2. ::part{#p2}

      Choose.

      :::choices{#choice mode="multiple"}
      * :option[A]{#a} First $x^2$.
      * :option[B]{#b} Second.
      * :option[C]{#c} Third.
      :::

      :::reference
      ::correct{option="a"}

      ::correct{option="c"}
      :::

:::work{for="set/q1/p1"}
Written personal work.
:::
`;
async function compile(source: string) {
  const tree = parseContent(source, true);
  return { tree, sets: await compileExercises(tree, renderSource) };
}
describe("problem semantics", () => {
  it("reuses prepared section metadata", async () => {
    const source = fixture.replace(
      "::problems{#set}",
      "::section{#source}\n\n::problems{#set}",
    );
    const standardTree = attachProblemSets(
      presentSections(parseContent(source, true), "knowledge"),
    );
    const standard = await compileExercises(standardTree, renderSource);
    const preparedTree = attachProblemSets(
      presentSections(parseContent(source, true), "knowledge"),
    );
    sourceSections(preparedTree);
    const prepared = await compileExercises(preparedTree, renderSource, {
      sectionsPrepared: true,
    });
    expect(prepared).toEqual(standard);
  });
  it("keeps complete server data while trimming the interactive client view", async () => {
    const { sets } = await compile(fixture);
    const set = sets[0]!;
    const parent = set.questions[0]!;
    const part = parent.parts[0]!;
    const view = clientProblemSet(set);

    expect(part.inputs[0]?.placeholder).toBe("输入数值");
    expect(parent.markdown).toContain(
      "A parent problem with \\_\\_\\_\\_\\_\\_.",
    );
    expect(parent.markdown).not.toContain("choice-slot");
    expect(set.markdown).toContain("Written personal work");
    expect(set.discussion.markdown).toContain("Value");
    expect(part.markdown).toContain("Written personal work");
    expect(part.markdown).toContain("（#n，输入数值）");
    expect(part.markdown).toContain("（#word）");
    expect(part.html).toContain("（#n，输入数值）");
    expect(JSON.stringify(set)).toContain("An explanation");

    expect(view).not.toHaveProperty("markdown");
    expect(view).not.toHaveProperty("discussionMarkdown");
    expect(view.questions[0]).not.toHaveProperty("markdown");
    expect(view.questions[0]).not.toHaveProperty("discussionMarkdown");
    expect(view.questions[0]?.parts[0]?.answers[0]).not.toHaveProperty(
      "markdown",
    );
    expect(view.questions[0]?.html).toContain("A parent problem");
    expect(view.questions[0]?.parts[0]?.answers[0]?.html).toContain(
      "An explanation",
    );

    expect(questionDiscussion(parent).source).toContain(
      "Written personal work",
    );
    expect(questionDiscussion(parent).references).toContain("An explanation");
    expect(problemSetDiscussion(set).source).toContain("Value");
    expect(problemSetDiscussion(set).references).toContain("An explanation");
  });
  it("serializes choice slots as escaped text without rewriting code fences", () => {
    const markdown = exportMarkdown(
      parseContent("A:choice-slot{}B\n\n```text\ncode______text\n```\n", true),
    );
    expect(markdown).toContain("A\\_\\_\\_\\_\\_\\_B");
    expect(markdown).toContain("code______text");
  });
  it("keeps between-question and within-question page boundaries in HTML, discussion and Markdown", async () => {
    const source = `## 题集

::problems{#pages}

::page{number="42"}

1. ::question{#one}

   First paragraph.

   ::page{number="43"}

   Continued paragraph.

::page{number="44"}

2. ::question{#two}

   Second question.
`;
    const { tree, sets } = await compile(source);
    const [first, second] = sets[0]!.questions;
    expect(first!.leadingPage).toBe("42");
    expect(first!.html).toContain('class="source-page">第43页');
    expect(first!.html).not.toContain("第42页");
    expect(first!.html).not.toContain("第44页");
    expect(second!.leadingPage).toBe("44");
    expect(second!.html).not.toContain('class="source-page"');
    expect(sets[0]!.blocks).toEqual([
      {
        type: "questions",
        ids: ["one", "two"],
      },
    ]);
    expect(first!.markdown).toContain("第42页");
    expect(first!.discussion.markdown).toContain("第42页");
    expect(exportMarkdown(tree)).toContain("第43页");
    await expect(
      compile(source.replace('number="42"', 'number=""')),
    ).rejects.toThrow("page number");
  });
  it("exports sequential list markers while preserving every original question and part number", () => {
    const tree = parseContent(
      `## 题集

::problems{#s}

4. ::question{#q4 number="4"}

   A question.

   3. ::part{#p3 number="3"}

      A part.

   4. ::part{#p7 number="7"}

      Another part.

5. ::question{#q9 number="9"}

   Another question.
`,
      true,
    );
    const md = exportMarkdown(tree);
    expect(md).toMatch(/^1\. +原题号：4/m);
    expect(md).toMatch(/^2\. +原题号：9/m);
    expect(md).toMatch(/^ +1\. +原题号：3/m);
    expect(md).toMatch(/^ +2\. +原题号：7/m);
  });
  it("omits the original number when the optional attribute is absent", async () => {
    const source =
      "## 题集\n\n::problems{#s}\n\n1. ::question{#q}\n\n   Text.\n";
    const { tree, sets } = await compile(source);
    expect(sets[0]?.questions[0]?.number).toBeUndefined();
    expect(exportMarkdown(tree)).not.toContain("原题号");
  });
  it("attaches problem sets to their heading and continues numbering across internal headings", async () => {
    const source = `## 集合

::problems{#logic}

1. ::question{#a number="1.8"}

   First.

### 化简

2. ::question{#b number="1.9"}

   Second.
`;
    const { sets } = await compile(source);
    const set = sets[0]!;
    expect(set.heading?.id).toBe("logic");
    expect(set.heading?.title.text).toBe("集合");
    expect(set.questions.map((question) => question.target)).toEqual([
      "logic/a",
      "logic/b",
    ]);
    expect(set.blocks.map((block) => block.type)).toEqual([
      "questions",
      "heading",
      "questions",
    ]);
    expect(set.markdown).toContain("## 集合");
    expect(set.markdown).toContain("### 化简");
    expect(set.markdown).toMatch(/^1\. +原题号：1\.8/m);
    expect(set.markdown).toMatch(/^2\. +原题号：1\.9/m);
    expect(set.discussion.markdown).toContain("### 化简");
  });
  it("ends problem sets before a semantic section wrapped for its own heading", async () => {
    const source = `## 试题

::section{#problems slot="task.problems"}

### 习题

::problems{#set-1}

1. ::question{#q}

   Text.

## 电子档案

::section{#archive slot="task.work"}

固定档案正文。
`;
    const tree = attachProblemSets(
      presentSections(parseContent(source, true), "task"),
    );
    const sets = await compileExercises(tree, renderSource);
    expect(sets[0]?.blocks.map((block) => block.type)).toEqual(["questions"]);
    expect(sets[0]?.markdown).not.toContain("电子档案");
    expect(stringifyContent(tree)).toContain("固定档案正文");
  });
  it("requires a heading before problem-set metadata and rejects the removed container form", async () => {
    await expect(
      compile("::problems{#s}\n\n1. ::question{#q}\n\n   Text.\n"),
    ).rejects.toThrow("immediately follow a heading");
    await expect(
      compile(":::problems{#s}\n\n1. ::question{#q}\n\n   Text.\n\n:::\n"),
    ).rejects.toThrow("heading followed by ::problems");
    await expect(
      compile(
        '## 集合\n\n::problems{#s source="旧题集"}\n\n1. ::question{#q}\n\n   Text.\n',
      ),
    ).rejects.toThrow("titles belong in the heading");
    await expect(
      compile(
        "## 集合\n\n::problems{#s}\n\n### 内部\n\n::problems{#nested}\n\n1. ::question{#q}\n\n   Text.\n",
      ),
    ).rejects.toThrow("cannot nest");
  });
  it("keeps scoped identities, original numbering, nearest-owner inputs and personal work", async () => {
    const { sets } = await compile(fixture);
    const parent = sets[0]!.questions[0]!;
    expect(parent.number).toBe("11");
    expect(parent.inputs).toHaveLength(0);
    expect(parent.parts.map((p) => p.target)).toEqual([
      "set/q1/p1",
      "set/q1/p2",
    ]);
    const first = parent.parts[0]!;
    expect(first.inputs.map((i) => i.id)).toEqual(["n", "word"]);
    expect(first.answers.map((a) => a.kind)).toEqual(["reference", "work"]);
    expect(first.answers[1]?.anchor).toBeTruthy();
    expect(exportMarkdown((await compile(fixture)).tree)).toContain(
      "set/q1/p1",
    );
    expect(first.discussion.markdown).not.toContain("An explanation");
    expect(first.discussion.markdown).toContain("Written personal work");
    expect(parent.leadingPage).toBe("42");
    expect(parent.html).not.toContain("42");
    expect(parent.parts[1]?.inputs[0]?.options[0]?.html).toContain("katex");
  });
  it("associates external reference keys and exports complete authored answers", async () => {
    const source =
      '## 题集\n\n::problems{#set}\n\n1. ::question{#q1}\n\n   :blank{#n type="number"}\n\n:::reference{for="set/q1"}\n::correct{blank="n" value="2"}\n\nA reference.\n:::\n';
    const { sets } = await compile(source);
    const q = sets[0]!.questions[0]!;
    expect(evaluateAnswer(q.inputs[0]!, "2")).toBe("correct");
    expect(q.markdown).toContain("A reference");
    expect(q.discussion.markdown).not.toContain("A reference");
  });
  it("exports compact answer keys without merging across explanation paragraphs", () => {
    const md = exportMarkdown(
      parseContent(
        `:::reference
::correct{input="choice" option="a"}
::correct{input="choice" option="c"}

选择这两项。

::correct{blank="later" value="2"}

另一空的解释。
:::`,
        true,
      ),
    );
    expect(md).not.toContain("参考解答");
    expect(md).toContain("答案：A、C");
    expect(md).not.toContain("choice:");
    expect(md).toMatch(
      /答案：A、C[\s\S]*选择这两项。[\s\S]*答案：2[\s\S]*另一空/,
    );
    const labeled = exportMarkdown(
      parseContent(":::reference\n**参考解答**\n\n原文解答。\n:::", true),
    );
    expect(labeled.match(/参考解答/g)).toHaveLength(1);
  });
  it("keeps identical work and references distinct and includes each linked answer once", async () => {
    const source = `## 题集

::problems{#s}

1. ::question{#q}

   A parent.

   1. ::part{#p}

      A child.

      ::::example
      :::work{for="s/q/p"}
      Embedded.
      :::
      ::::

:::work{for="s/q/p"}
Same text.
:::

:::reference{for="s/q/p"}
Same text.
:::
`;
    const { sets } = await compile(source);
    const parent = sets[0]!.questions[0]!;
    const part = parent.parts[0]!;
    expect(part.answers.map((answer) => answer.kind)).toEqual([
      "work",
      "work",
      "reference",
    ]);
    expect(part.markdown.match(/Embedded\./g)).toHaveLength(1);
    expect(parent.markdown.match(/Embedded\./g)).toHaveLength(1);
    expect(part.markdown.match(/Same text\./g)).toHaveLength(2);
    expect(parent.markdown.match(/Same text\./g)).toHaveLength(2);
    expect(part.markdown).toContain("我的作答（对应s/q/p）");
    expect(part.markdown).toContain("参考解答（对应s/q/p）");
  });
  it("does not treat explanatory nested lists or plain option-like text as inputs", async () => {
    const { sets } = await compile(
      "## 题集\n\n::problems{#s}\n\n* ::question{#q}\n\n  A. ordinary prose.\n\n  * Explanation one\n  * Explanation two\n",
    );
    expect(sets[0]?.ordered).toBe(false);
    const q = sets[0]!.questions[0]!;
    expect(q.parts).toHaveLength(0);
    expect(q.inputs[0]?.type).toBe("text");
    expect(q.html).toContain("ordinary prose");
    expect(q.html).toContain("Explanation two");
  });
  it("rejects duplicate identity, missing association and invalid answer keys", async () => {
    await expect(
      compile(fixture.replace("::part{#p2}", "::part{#p1}")),
    ).rejects.toThrow("Duplicate question");
    await expect(
      compile(fixture.replace('for="set/q1/p1"', 'for="set/missing"')),
    ).rejects.toThrow("Unknown authored answer");
    await expect(
      compile(fixture.replace('option="c"', 'option="z"')),
    ).rejects.toThrow("Unknown correct option");
    await expect(
      compile(fixture.replace('tolerance="0.01"', 'tolerance="-1"')),
    ).rejects.toThrow("tolerance");
    await expect(
      compile(fixture.replace('value="0.5"', 'value="1e999"')),
    ).rejects.toThrow("numeric answer");
  });
  it("keeps unlinked image archives while supporting repeated independently scaled regions", async () => {
    const input = `[sheet]: https://example.com/sheet.jpg\n\n::image-region{image="sheet" x="0" y="0" width="50" height="40" display-width="20rem"}\n\n::image-region{image="sheet" x="50" y="40" width="50" height="60" display-width="30rem"}`;
    const { tree, sets } = await compile(input);
    expect(sets).toHaveLength(0);
    const html = await renderSource(tree);
    expect(html.match(/data-learning-image-region/g)).toHaveLength(2);
    const md = exportMarkdown(tree);
    expect(md).not.toContain("::image-region");
    expect(md.match(/https:\/\/example.com\/sheet.jpg/g)).toHaveLength(2);
    await expect(
      compile(input.replace('width="50"', 'width="101"')),
    ).rejects.toThrow();
    await expect(
      compile(input.replace('image="sheet"', 'image="unknown"')),
    ).rejects.toThrow("Missing image reference");
  });
  it("namespaces repeated included problem sets and their local image references", async () => {
    const original: ContentSource = {
      file: "/root/concept.mdx",
      contentPath: "knowledge/maths/concept.mdx",
      private: false,
      data: {
        kind: "knowledge",
        lang: "zh-CN",
        title: "Concept",
      },
      body: `## Examples\n::section{#examples slot="knowledge.examples"}\n\n${fixture.replace(/slot="task.[^"]+"/g, "")}`,
    };
    const host: ContentSource = {
      file: "/root/host.mdx",
      contentPath: "articles/host.mdx",
      private: false,
      data: { kind: "article", lang: "zh-CN", title: "Host" },
      body: '::knowledge{path=maths/concept slot=examples}\n\n::include{src="/knowledge/maths/concept/" slot="knowledge.examples"}',
    };
    const tree = createSourceResolver([original, host]).resolve(host);
    const sets = await compileExercises(tree, renderSource);
    expect(sets.map((s) => s.id)).toEqual(["inc-1-set", "inc-2-set"]);
    expect(
      sets[0]?.questions[0]?.parts[0]?.answers.some((a) => a.kind === "work"),
    ).toBe(true);
  });
});
describe("rule assessment", () => {
  const field = (
    type: ResponseInput["type"],
    values: string[],
    extra = {},
  ): ResponseInput => ({
    id: "answer",
    type,
    options: [],
    rule: { values, tolerance: 0, ignoreCase: false, ...extra },
  });
  it("requires exact single and multiple-choice answers", () => {
    expect(evaluateAnswer(field("single", ["b"]), "b")).toBe("correct");
    expect(evaluateAnswer(field("single", ["b"]), "B")).toBe("incorrect");
    expect(evaluateAnswer(field("multiple", ["a", "c"]), ["c", "a"])).toBe(
      "correct",
    );
    expect(evaluateAnswer(field("multiple", ["a", "c"]), ["a"])).toBe(
      "incorrect",
    );
    expect(evaluateAnswer(field("multiple", ["a"]), ["a", "b"])).toBe(
      "incorrect",
    );
  });
  it("normalizes Unicode and whitespace without silently ignoring case or punctuation", () => {
    expect(evaluateAnswer(field("text", ["é"]), " e\u0301 ")).toBe("correct");
    expect(evaluateAnswer(field("text", ["Word"]), "word")).toBe("incorrect");
    expect(
      evaluateAnswer(field("text", ["Word"], { ignoreCase: true }), "word"),
    ).toBe("correct");
    expect(evaluateAnswer(field("text", ["Word"]), "Word.")).toBe("incorrect");
  });
  it("supports finite decimals, scientific notation and absolute tolerance boundaries", () => {
    expect(evaluateAnswer(field("number", ["0.5"]), "5e-1")).toBe("correct");
    expect(
      evaluateAnswer(field("number", ["0.5"], { tolerance: 0.01 }), "0.51"),
    ).toBe("correct");
    expect(
      evaluateAnswer(field("number", ["0.5"], { tolerance: 0.01 }), "0.511"),
    ).toBe("incorrect");
    for (const invalid of ["1/2", "Infinity", "1e999", "0x10", "0.5 garbage"])
      expect(evaluateAnswer(field("number", ["0.5"]), invalid)).toBe(
        "incorrect",
      );
  });
  it("distinguishes missing keys and unanswered items from incorrect answers", () => {
    expect(
      evaluateAnswer(
        { id: "open", type: "text", options: [] },
        "Some thoughts",
      ),
    ).toBe("ungraded");
    expect(evaluateAnswer(field("text", ["yes"]), "")).toBe("unanswered");
    expect(evaluateAnswer(field("multiple", ["a"]), [])).toBe("unanswered");
  });
});
