import { describe, expect, it } from "vitest";
import { fromHtml } from "hast-util-from-html";
import { visit } from "unist-util-visit";
import { parseContent } from "@/lib/content/syntax";
import { renderSource } from "@/lib/content/source-render";
import {
  renderMarkdown,
  renderSummary,
  renderInlineMarkdown,
} from "@/lib/content/compile";
import { exportMarkdown } from "@/lib/content/content-export";
import { parseMarkdownFragment } from "@/lib/markdown/render";
const captions = (html: string) => {
  const values: string[] = [];
  visit(fromHtml(html, { fragment: true }), "element", (node) => {
    if (node.tagName === "figcaption")
      values.push(
        node.children
          .map((child) => (child.type === "text" ? child.value : child.type))
          .join(""),
      );
  });
  return values;
};
describe("one server rendering contract", () => {
  it("shares mathematical HTML across sources, summaries, and labels", async () => {
    const source = "Limit $\\lim_{x\\to0} f(x)$";
    for (const html of await Promise.all([
      renderMarkdown(source),
      renderSource(parseContent(source, true)),
      renderSummary(parseMarkdownFragment(source)),
      renderInlineMarkdown(source),
    ])) {
      expect(html).toContain('class="katex"');
      expect(html).toContain('encoding="application/x-tex"');
      expect(html).not.toContain("katex-error");
    }
    expect(
      await renderInlineMarkdown("1. [Title](https://example.com) $x^2$"),
    ).not.toMatch(/<a[\s>]/);
    await expect(
      renderInlineMarkdown(
        '<img src="https://example.com/a.png" alt="Diagram" />',
      ),
    ).resolves.toBe("Diagram");
  });
  it("renders static native MDX without executing expressions", async () => {
    const html = await renderSource(
      parseContent(
        '<figure><img src="https://example.com/a.png" alt="Diagram" /><figcaption>Custom $x^2$</figcaption></figure>',
        true,
      ),
    );
    expect(html).toContain("<figure>");
    expect(html).toContain("<figcaption>");
    expect(html).toContain('class="katex"');
    expect(html).toContain('data-image-zoom=""');
    expect(html).not.toContain("image-zoom-trigger");
    await expect(renderSource(parseContent("{1+1}", true))).rejects.toThrow(
      "Only summary",
    );
    await expect(
      renderSource(parseContent('<span onClick="bad">Text</span>', true)),
    ).rejects.toThrow("static text");
  });
});
describe("per-image captions", () => {
  it("inherits alt by default and lets Markdown titles customize one image", async () => {
    const html = await renderMarkdown(
      '![Inherited](https://example.com/a.png)\n\n![Alt](https://example.com/b.png "Custom title")',
    );
    expect(captions(html)).toEqual(["Inherited", "Custom title"]);
    expect(html).not.toContain('title="Custom title"');
  });
  it("supports all three modes independently within one page", async () => {
    const body =
      '![Hidden](https://example.com/a.png)\n\n::caption{mode="none"}\n\n![Inherited](https://example.com/b.png "Ignored title")\n\n::caption{mode="alt"}\n\n![Alt](https://example.com/c.png)\n\n::caption[Custom **caption** and $x^2$]';
    const tree = parseContent(body, true),
      html = await renderSource(tree, { imageCaptions: "none" });
    expect(captions(html)).toHaveLength(2);
    expect(captions(html)[0]).toBe("Inherited");
    expect(html).toContain('class="katex"');
    expect(html).not.toContain("::caption");
    const markdown = exportMarkdown(tree);
    expect(markdown).not.toContain("::caption");
    expect(markdown).toContain("Custom");
    expect(markdown).toContain("$x^2$");
  });
  it("validates attachment and resolves reference-style Markdown images", async () => {
    expect(
      captions(
        await renderMarkdown(
          '[scan]: https://example.com/a.png "Reference caption"\n\n![Alt][scan]',
        ),
      ),
    ).toEqual(["Reference caption"]);
    await expect(
      renderMarkdown('Text.\n\n::caption{mode="none"}'),
    ).rejects.toThrow("immediately follow");
    await expect(
      renderMarkdown(
        '![Alt](https://example.com/a.png)\n\n::caption[Text]{mode="none"}',
      ),
    ).rejects.toThrow("Only a custom");
  });
});
