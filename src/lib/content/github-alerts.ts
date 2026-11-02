import type { Root } from "mdast";
import type { ContainerDirective } from "mdast-util-directive";
import { visit } from "unist-util-visit";

export const alertTypes = [
  "note",
  "tip",
  "important",
  "warning",
  "caution",
] as const;
export type AlertType = (typeof alertTypes)[number];

const marker =
  /^\[!(note|tip|important|warning|caution)](?:[ \t]*\r?\n?[ \t]*)?/i;

/**
 * GitHub alert syntax is a blockquote whose first paragraph starts with
 * `[!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]` or `[!CAUTION]`.
 * The AST transform is only applied at render time so exported Markdown keeps
 * the original GitHub syntax.
 */
export function remarkGithubAlerts() {
  return (tree: Root) => {
    visit(tree, "blockquote", (node, index, parent) => {
      if (index === undefined || parent === undefined) return;
      const first = node.children[0];
      if (first?.type !== "paragraph") return;
      const text = first.children[0];
      if (text?.type !== "text") return;
      const match = marker.exec(text.value);
      if (!match) return;

      const type = match[1]!.toLowerCase() as AlertType;
      text.value = text.value.slice(match[0].length);
      if (first.children[0]?.type === "break") first.children.shift();
      if (!text.value) first.children.shift();
      if (!first.children.length) node.children.shift();

      parent.children[index] = {
        type: "containerDirective",
        name: "alert",
        attributes: { type },
        children: node.children,
      } as ContainerDirective;
    });
  };
}
