import type { Root, RootContent } from "mdast";
import type { ContainerDirective } from "mdast-util-directive";
import { toString } from "mdast-util-to-string";
import { isSection, requireId, semanticSections } from "./semantic";

declare module "mdast-util-directive" {
  interface ContainerDirectiveData {
    attachedProblems?: boolean;
    attachedDefaultQuestions?: boolean;
    omittedHeading?: boolean;
  }
}

function semanticHeadingDepth(node: RootContent): number | undefined {
  if (node.type !== "containerDirective" || node.name !== "semantic")
    return undefined;
  const heading = node.children[0];
  return heading?.type === "heading" ? heading.depth : undefined;
}

/** A marked heading owns all following content until its next sibling or ancestor heading. */
export function attachProblemSets(tree: Root): Root {
  let defaultBlockIndex = 0;
  if (
    tree.children.some(
      (node, index) =>
        node.type === "heading" && isSection(tree.children[index + 1]),
    )
  )
    semanticSections(tree);
  const attach = (
    nodes: RootContent[],
    preserveFirstHeadingId = false,
  ): RootContent[] => {
    const result: RootContent[] = [];
    for (let index = 0; index < nodes.length; index++) {
      const node = nodes[index]!;
      const next = nodes[index + 1];
      const sectionMarker = isSection(next) ? next : undefined;
      const markerIndex = sectionMarker ? index + 2 : index + 1;
      const marker = nodes[markerIndex];
      if (node.type === "leafDirective" && node.name === "problems")
        throw new Error(
          "Problem set metadata must immediately follow a heading",
        );
      if (node.type === "containerDirective" && node.name === "problems") {
        if (!node.data?.["attachedProblems"])
          throw new Error(
            "Problem sets must use a heading followed by ::problems metadata",
          );
        result.push(node);
        continue;
      }
      if (
        node.type === "containerDirective" &&
        node.name === "default-questions"
      ) {
        if (!node.data?.["attachedDefaultQuestions"])
          throw new Error(
            "The default question group is generated from standalone question lists",
          );
        result.push(node);
        continue;
      }
      if (
        node.type === "heading" &&
        marker?.type === "leafDirective" &&
        marker.name === "problems"
      ) {
        const id = requireId(marker.attributes?.["id"], "problem set");
        if (Object.keys(marker.attributes ?? {}).some((key) => key !== "id"))
          throw new Error(
            "Problem set titles belong in the heading; only an ID is accepted in metadata",
          );
        const keepSectionId = Boolean(
          sectionMarker ||
          node.data?.hProperties?.["data-learning-slot"] ||
          (preserveFirstHeadingId && index === 0),
        );
        node.data = {
          ...node.data,
          hProperties: {
            ...node.data?.hProperties,
            ...(!keepSectionId ? { id } : {}),
          },
        };
        let end = markerIndex + 1;
        while (end < nodes.length) {
          const next = nodes[end]!;
          if (next.type === "heading" && next.depth <= node.depth) break;
          const boundaryDepth = semanticHeadingDepth(next);
          if (boundaryDepth !== undefined && boundaryDepth <= node.depth) break;
          if (next.type === "leafDirective" && next.name === "problems")
            throw new Error(
              "Problem sets cannot nest; use an unmarked subheading for internal blocks",
            );
          end++;
        }
        result.push({
          type: "containerDirective",
          name: "problems",
          attributes: { id, source: toString(node) },
          data: { attachedProblems: true },
          children: [
            node,
            ...nodes.slice(markerIndex + 1, end),
          ] as ContainerDirective["children"],
        });
        index = end - 1;
      } else if (
        node.type === "list" &&
        node.children.some((item) => {
          const first = item.children[0];
          return first?.type === "leafDirective" && first.name === "question";
        })
      ) {
        const id = requireId(
          `default-block-${defaultBlockIndex++}`,
          "default question block",
        );
        result.push({
          type: "containerDirective",
          name: "default-questions",
          attributes: { id },
          data: { attachedDefaultQuestions: true },
          children: [node],
        });
      } else {
        if ("children" in node && node.type !== "heading") {
          const ownsSectionHeading =
            node.type === "containerDirective" &&
            node.name === "semantic" &&
            Boolean(node.attributes?.["slot"]);
          node.children = attach(
            node.children as RootContent[],
            ownsSectionHeading,
          ) as typeof node.children;
        }
        result.push(node);
      }
    }
    return result;
  };
  tree.children = attach(tree.children);
  return tree;
}
