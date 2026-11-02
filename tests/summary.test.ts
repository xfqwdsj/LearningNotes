import { describe, expect, it } from "vitest";
import { selectSummary } from "@/lib/content/summary";
import {
  extractSections,
  parseMarkdown,
  renderSummary,
} from "@/lib/content/compile";
import { readableMdx } from "@/lib/content/export-mdx";

describe("uniform document summaries", () => {
  it("uses explicit descriptions first", () => {
    expect(
      selectSummary(
        parseMarkdown("## Archive\n\n<!-- summary -->\n\nSelected.\n"),
        "Explicit $x^2$.",
      )?.markdown,
    ).toContain("Explicit $x^2$");
  });
  it("preserves every paragraph and soft break before more", async () => {
    const source = selectSummary(
      parseMarkdown(
        "First line\nSecond line\n\nAnother paragraph.\n\n<!-- more -->\n\nHidden from the summary.",
      ),
    );
    const html = await renderSummary(source!);
    expect(html).toMatch(/<br\s*\/?>/);
    expect(html).toContain("Another paragraph.");
    expect(html).not.toContain("Hidden from");
  });
  it("omits the selected heading, normalizes descendants and preserves section IDs", async () => {
    const markdown =
      "## Original title\n\n::section{#definition}\n\n<!-- summary -->\n\nLine one\nLine two\n\n#### Child $x^2$\n\n![Preview](https://example.com/preview.png)\n\n##### Nested\n\nDetails.\n\n## Outside\n\nNot included.";
    const source = selectSummary(parseMarkdown(markdown))!;
    const html = await renderSummary(source);
    expect(html).not.toContain("Original title");
    expect(html).not.toContain("Not included");
    expect(html).toContain("<h3>Child");
    expect(html).toContain("<h4>Nested");
    expect(html).not.toMatch(/<h[1-6] id=/);
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('class="katex"');
    expect(extractSections(markdown)[0]?.id).toBe("definition");
  });
  it("shares the marker contract with MDX exports", () => {
    const md = readableMdx(
      "## Attachment\n\n{/* summary */}\n\nPreview text.\n",
    );
    expect(selectSummary(parseMarkdown(md))?.markdown).toContain(
      "Preview text.",
    );
    expect(selectSummary(parseMarkdown(md))?.markdown).not.toContain(
      "## Attachment",
    );
  });
  it("rejects ambiguous or misplaced markers", () => {
    expect(() =>
      selectSummary(
        parseMarkdown(
          "## One\n\n<!-- summary -->\n\nA\n\n## Two\n\n<!-- summary -->\n\nB",
        ),
      ),
    ).toThrow("one summary");
    expect(() =>
      selectSummary(parseMarkdown("Text.\n\n<!-- summary -->")),
    ).toThrow("follow a heading");
  });
  it("keeps a complete mathematical first paragraph without a marker", async () => {
    const source = selectSummary(
      parseMarkdown(
        "## Section\n\nA complete $\\frac{x}{1+x^2}$ expression.\n\nAnother paragraph.",
      ),
    );
    expect(await renderSummary(source!)).toContain('class="katex"');
    expect(source?.markdown).not.toContain("Another paragraph");
  });
});
