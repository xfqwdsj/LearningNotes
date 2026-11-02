import { renderMarkdownValue, markdownPlainText } from "@/lib/markdown/render";
import type { Root, RootContent } from "mdast";
import { toString } from "mdast-util-to-string";
import { headingSlug } from "./semantic";
import {
  createExportFragment,
  exportContent,
  stringifyExportedTree,
} from "./content-export";
import type { Section } from "./types";

export function sourceSections(tree: Root): {
  section: Omit<Section, "html" | "markdownUrl">;
  tree: Root;
}[] {
  const result: {
    section: Omit<Section, "html" | "markdownUrl">;
    tree: Root;
  }[] = [];
  const used = new Set<string>();
  const definitions: RootContent[] = [];
  const gather = (nodes: RootContent[]) => {
    for (const n of nodes) {
      if (n.type === "definition") definitions.push(n);
      if ("children" in n) gather(n.children as RootContent[]);
    }
  };
  gather(tree.children);
  function scan(nodes: RootContent[], origin?: string) {
    for (let index = 0; index < nodes.length; index++) {
      const node = nodes[index]!;
      if (node.type === "heading") {
        const base = String(
          node.data?.hProperties?.id ?? headingSlug(toString(node)),
        );
        let id = base;
        let n = 1;
        while (used.has(id)) id = `${base}-${n++}`;
        used.add(id);
        node.data = {
          ...node.data,
          hProperties: { ...node.data?.hProperties, id },
        };
        let end = index + 1;
        while (end < nodes.length) {
          const next = nodes[end];
          if (next?.type === "heading" && next.depth <= node.depth) break;
          end++;
        }
        const body = nodes.slice(index, end);
        const fragment: Root = {
          type: "root",
          children: [...body, ...definitions],
        };
        const markdown = createExportFragment(fragment).markdown;
        const title = createExportFragment({
          type: "root",
          children: [{ type: "paragraph", children: node.children }],
        });
        const summaryExport = exportContent({
          type: "root",
          children: body.slice(1),
        });
        const more = summaryExport.children.findIndex(
          (child) =>
            child.type === "html" && /<!--\s*more\s*-->/.test(child.value),
        );
        const summaryTree: Root = {
          type: "root",
          children: (more >= 0
            ? summaryExport.children.slice(0, more)
            : summaryExport.children
          ).filter(
            (child) =>
              child.type !== "html" || !/<!--.*?-->/s.test(child.value),
          ),
        };
        let length = 0;
        summaryTree.children = summaryTree.children.filter((node) => {
          if (length >= 280) return false;
          length += markdownPlainText({
            type: "root",
            children: [node],
          }).length;
          return true;
        });
        result.push({
          section: {
            id,
            title: renderMarkdownValue(
              { markdown: title.markdown.trim(), tree: title.tree },
              {
                mode: "single-line",
                linkPolicy: "plain",
              },
            ),
            depth: node.depth,
            summary: renderMarkdownValue(
              {
                markdown: stringifyExportedTree(summaryTree).trim(),
                tree: summaryTree,
              },
              { mode: "summary" },
            ),
            markdown,
            text: markdownPlainText(fragment),
            ...(node.data?.hProperties?.["data-learning-slot"]
              ? { slot: String(node.data.hProperties["data-learning-slot"]) }
              : {}),
            ...(origin ? { origin } : {}),
          },
          tree: fragment,
        });
      }
      if ("children" in node && node.type !== "heading") {
        const a =
          node.type === "containerDirective" ? node.attributes : undefined;
        scan(node.children as RootContent[], a?.["source"] ?? origin);
      }
    }
  }
  scan(tree.children);
  return result;
}
