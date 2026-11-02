import { isSection } from "./semantic";
import { normalizeHeadingLevels } from "./heading-levels";
import type { Root } from "mdast";
import { parseMarkdown, stringifyMarkdown } from "./compile";
import type { MarkdownFragment } from "@/lib/markdown/types";

const summaryMarker = /<!--\s*summary\s*-->/g;
const moreMarker = /<!--\s*more\s*-->/;
const metadataComments = /^(?:\s*<!--\s*(?:section:[\w-]+|summary)\s*-->\s*)+$/;

/** Explicit description, a marked section, more, then the first paragraph. */
export function selectSummary(
  tree: Root,
  description?: string,
): MarkdownFragment | undefined {
  const marked = tree.children.flatMap((node, index) =>
    node.type === "html"
      ? [...node.value.matchAll(summaryMarker)].map(() => index)
      : [],
  );
  if (marked.length > 1)
    throw new Error("Only one summary marker is allowed per document");
  let section: Root | undefined;
  if (marked[0] !== undefined) {
    let start = marked[0] - 1;
    while (start >= 0) {
      const node = tree.children[start];
      if (
        isSection(node) ||
        (node?.type === "html" && metadataComments.test(node.value))
      )
        start--;
      else break;
    }
    const heading = tree.children[start];
    if (heading?.type !== "heading")
      throw new Error("Summary marker must follow a heading");
    let end = start + 1;
    while (end < tree.children.length) {
      const node = tree.children[end];
      if (node?.type === "heading" && node.depth <= heading.depth) break;
      end++;
    }
    section = { type: "root", children: tree.children.slice(start + 1, end) };
  }
  let selected: Root;
  if (description !== undefined) selected = parseMarkdown(description);
  else if (section) selected = section;
  else {
    const more = tree.children.findIndex(
      (node) => node.type === "html" && moreMarker.test(node.value),
    );
    const first = tree.children.find((node) => node.type === "paragraph");
    if (more >= 0)
      selected = { type: "root", children: tree.children.slice(0, more) };
    else if (first) selected = { type: "root", children: [first] };
    else return undefined;
  }
  const normalized = normalizeHeadingLevels(selected, 3);
  return { markdown: stringifyMarkdown(normalized), tree: normalized };
}
