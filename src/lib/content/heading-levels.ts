import { visit } from "unist-util-visit";
import type { Root, Heading } from "mdast";

/** Rebase a fragment without changing its source tree or relative heading hierarchy. */
export function normalizeHeadingLevels(
  tree: Root,
  firstDepth: Heading["depth"],
): Root {
  const result = structuredClone(tree);
  let shallowest = 6;
  visit(result, "heading", (node) => {
    shallowest = Math.min(shallowest, node.depth);
  });
  visit(result, "heading", (node) => {
    node.depth = Math.min(
      6,
      firstDepth + node.depth - shallowest,
    ) as Heading["depth"];
  });
  return result;
}
