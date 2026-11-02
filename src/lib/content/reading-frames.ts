import type { Root } from "hast";
import type { Plugin } from "unified";
import { SKIP, visit } from "unist-util-visit";

// Give each rendered math or code block a stable reading-layout wrapper.
export const rehypeReadingFrames: Plugin<[], Root> = () => (tree) => {
  visit(tree, "element", (node, index, parent) => {
    if (index === undefined || !parent) return;
    if (node.tagName === "img") {
      node.properties.loading = "lazy";
      node.properties.decoding = "async";
      if (!(parent?.type === "element" && parent.tagName === "a"))
        node.properties["data-image-zoom"] = "";
    }
    const classes = node.properties.className?.toString() ?? "";
    const frame = classes.includes("katex-display")
      ? "math-display-frame"
      : classes.includes("expressive-code")
        ? "code-display-frame"
        : undefined;
    if (!frame) return;
    parent.children[index] = {
      type: "element",
      tagName: frame === "code-display-frame" ? "div" : "span",
      properties: { className: [frame] },
      children: [node],
    };
    return SKIP;
  });
};
