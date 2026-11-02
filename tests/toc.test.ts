import { plainValue } from "@/lib/markdown/types";
import { describe, expect, it } from "vitest";
import { tocSections } from "@/lib/content/toc";
import type { Section } from "@/lib/content/types";

describe("table of contents projection", () => {
  it("serializes only the fields used by the client navigation", () => {
    const sections = [
      {
        id: "definition",
        title: plainValue("定义"),
        depth: 2,
        summary: plainValue("sum"),
        markdown: "# long markdown",
        text: "long markdown",
        html: '<h2 id="definition">定义</h2>',
        markdownUrl: "/definition.md",
        references: [{ href: "/source/", title: plainValue("source") }],
      },
    ] as Section[];

    expect(tocSections(sections)).toEqual([
      {
        id: "definition",
        title: plainValue("定义"),
        depth: 2,
      },
    ]);
  });
});
