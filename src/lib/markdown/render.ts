import { bracketMathExtensions } from "@/lib/content/bracket-math";
import { toMarkdown } from "mdast-util-to-markdown";
import { fromMarkdown } from "mdast-util-from-markdown";
import { gfm } from "micromark-extension-gfm";
import { gfmFromMarkdown, gfmToMarkdown } from "mdast-util-gfm";
import { math } from "micromark-extension-math";
import { mathFromMarkdown, mathToMarkdown } from "mdast-util-math";
import { directive } from "micromark-extension-directive";
import {
  directiveFromMarkdown,
  directiveToMarkdown,
} from "mdast-util-directive";
import { fromHtml } from "hast-util-from-html";
import type { Root } from "mdast";
import { visit } from "unist-util-visit";
import { renderMathToHtml } from "@/lib/math";
import type { MarkdownFragment, MarkdownOptions, MarkdownValue } from "./types";
export type {
  LinkPolicy,
  MarkdownFragment,
  MarkdownMode,
  MarkdownValue,
} from "./types";
export const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ]!,
  );
export function parseMarkdownText(source: string): Root {
  const bracket = bracketMathExtensions();
  return fromMarkdown(source, {
    extensions: [gfm(), math(), directive(), bracket.syntax],
    mdastExtensions: [
      gfmFromMarkdown(),
      mathFromMarkdown(),
      directiveFromMarkdown(),
      bracket.mdast,
    ],
  });
}
/** Parse one independently authored Markdown value. Derived fragments reuse their existing AST. */
export function parseMarkdownFragment(markdown: string): MarkdownFragment {
  return { markdown, tree: prepareImageAlts(parseMarkdownText(markdown)) };
}
/** Serialize the resolved tree rather than concatenating independently parsed sources. */
export function stringifyMarkdownText(tree: Root): string {
  return toMarkdown(tree, {
    extensions: [gfmToMarkdown(), mathToMarkdown(), directiveToMarkdown()],
  }).trimEnd();
}
type Node = {
  type: string;
  data?: Record<string, unknown>;
  value?: string;
  children?: Node[];
  depth?: number;
  ordered?: boolean;
  start?: number | null;
  url?: string;
  identifier?: string;
  alt?: string | null;
  name?: string | null;
  attributes?: { name?: string; value?: unknown }[];
};
const textNode = (value: string): Node => ({ type: "text", value });
const join = (groups: Node[][], separator: string): Node[] =>
  groups.flatMap((group, index) =>
    index ? [textNode(separator), ...group] : group,
  );
function htmlNodes(source: string): Node[] {
  const convert = (
    node: ReturnType<typeof fromHtml>["children"][number],
  ): Node[] => {
    if (node.type === "text") return [textNode(node.value)];
    if (node.type !== "element" || ["script", "style"].includes(node.tagName))
      return [];
    if (node.tagName === "img")
      return [textNode(String(node.properties.alt ?? ""))];
    if (node.tagName === "br") return [textNode(" ")];
    const children = node.children.flatMap(convert);
    if (/^h[1-6]$/.test(node.tagName) || ["b", "strong"].includes(node.tagName))
      return [{ type: "strong", children }, textNode(" ")];
    if (["code", "pre"].includes(node.tagName))
      return [{ type: "inlineCode", value: plainNodes(children) }];
    if (["i", "em", "del", "s"].includes(node.tagName))
      return [
        {
          type:
            node.tagName === "i"
              ? "emphasis"
              : node.tagName === "em"
                ? "emphasis"
                : "delete",
          children,
        },
      ];
    return [
      ...children,
      ...(["p", "div", "li", "tr", "table", "blockquote"].includes(node.tagName)
        ? [textNode(" ")]
        : []),
    ];
  };
  return fromHtml(source, { fragment: true }).children.flatMap(convert);
}
/** One semantic compression pass shared by build-time fields and runtime ICU messages. */
export function normalizeSingleLine(
  tree: Root,
  { linkPolicy = "preserve" }: MarkdownOptions = {},
): Root {
  const definitions = new Map<string, Node>();
  function gather(node: Node) {
    if (node.type === "definition") definitions.set(node.identifier!, node);
    node.children?.forEach(gather);
  }
  gather(tree as Node);
  function childrenOf(nodes: Node[]): Node[] {
    const result: Node[] = [];
    for (let index = 0; index < nodes.length; index++) {
      const node = nodes[index]!;
      const opening =
        node.type === "html"
          ? /^<([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>$/.exec(node.value ?? "")
          : null;
      if (opening && !/\/>$/.test(node.value ?? "")) {
        const name = opening[1]!.toLowerCase();
        let depth = 1,
          end = index + 1;
        for (; end < nodes.length; end++) {
          const next = nodes[end]!;
          if (next.type !== "html") continue;
          if (new RegExp(`^<${name}\\b[^>]*>$`, "i").test(next.value ?? ""))
            depth++;
          if (
            new RegExp(`^</${name}\\s*>$`, "i").test(next.value ?? "") &&
            --depth === 0
          )
            break;
        }
        if (end < nodes.length) {
          const children = childrenOf(nodes.slice(index + 1, end));
          if (["script", "style"].includes(name)) {
            index = end;
            continue;
          }
          const type =
            /^h[1-6]$/.test(name) || ["strong", "b"].includes(name)
              ? "strong"
              : ["em", "i"].includes(name)
                ? "emphasis"
                : ["del", "s"].includes(name)
                  ? "delete"
                  : undefined;
          result.push(
            ...(type
              ? [{ type, children }]
              : ["code", "pre"].includes(name)
                ? [{ type: "inlineCode", value: plainNodes(children) }]
                : children),
          );
          if (["div", "p", "li"].includes(name)) result.push(textNode(" "));
          index = end;
          continue;
        }
      }
      result.push(...inline(node));
    }
    return result;
  }
  function inline(node: Node): Node[] {
    const children = () => childrenOf(node.children ?? []);
    switch (node.type) {
      case "root":
        return join(
          (node.children ?? [])
            .filter((n) => n.type !== "definition")
            .map(inline),
          " ",
        );
      case "heading":
        return [{ type: "strong", children: children() }];
      case "text":
        return [textNode((node.value ?? "").replace(/\s+/g, " "))];
      case "paragraph":
      case "blockquote":
      case "listItem":
        return join(
          node.type === "paragraph"
            ? [children()]
            : (node.children ?? []).map(inline),
          node.type === "paragraph" ? "" : " ",
        );
      case "break":
      case "thematicBreak":
        return [textNode(" ")];
      case "code":
      case "inlineCode":
        return [
          {
            type: "inlineCode",
            value: (node.value ?? "").replace(/\s+/g, " "),
          },
        ];
      case "math":
      case "inlineMath":
        return [
          {
            type: "inlineMath",
            value: node.value ?? "",
            data: {
              hName: "code",
              hProperties: { className: ["language-math", "math-inline"] },
              hChildren: [
                {
                  type: "text",
                  value: node.value ?? "",
                },
              ],
            },
          },
        ];
      case "list":
        return join(
          (node.children ?? []).map((item, index) => [
            textNode(node.ordered ? `${(node.start ?? 1) + index}. ` : "• "),
            ...inline(item),
          ]),
          "；",
        );
      case "table":
        return join(
          (node.children ?? []).map((row) =>
            join((row.children ?? []).map(inline), " · "),
          ),
          "；",
        );
      case "image":
      case "imageReference":
        return node.alt
          ? node.data?.["altPrepared"]
            ? [textNode(node.alt)]
            : (parseMarkdownText(node.alt).children as Node[]).flatMap(inline)
          : [];
      case "link":
      case "linkReference": {
        const url = node.url ?? definitions.get(node.identifier!)?.url;
        return linkPolicy === "plain" || !url
          ? children()
          : [{ type: "link", url, children: children() }];
      }
      case "html":
        return htmlNodes(node.value ?? "");
      case "mdxJsxFlowElement":
      case "mdxJsxTextElement": {
        if (node.name === "img")
          return [
            textNode(
              String(
                node.attributes?.find((a) => a.name === "alt")?.value ?? "",
              ),
            ),
          ];
        return /^h[1-6]$/.test(node.name ?? "")
          ? [{ type: "strong", children: children() }]
          : children();
      }
      case "strong":
      case "emphasis":
      case "delete":
        return [{ type: node.type, children: children() }];
      case "definition":
      case "footnoteDefinition":
      case "mdxjsEsm":
      case "mdxFlowExpression":
      case "mdxTextExpression":
        return [];
      default:
        return node.children ? join(node.children.map(inline), " ") : [];
    }
  }
  return {
    type: "root",
    children: [
      { type: "paragraph", children: inline(tree as Node) as never[] },
    ],
  };
}
function plainNodes(nodes: Node[]): string {
  return nodes
    .map((node) =>
      node.children
        ? plainNodes(node.children)
        : (node.alt ?? node.value ?? ""),
    )
    .join("");
}
export function markdownPlainText(tree: Root): string {
  return plainNodes(
    normalizeSingleLine(tree, { linkPolicy: "plain" }).children as Node[],
  )
    .replace(/\s+/g, " ")
    .trim();
}
export function prepareImageAlts(tree: Root): Root {
  visit(tree, "image", (node) => {
    if (node.data?.altPrepared) return;
    node.alt = markdownPlainText(parseMarkdownText(node.alt ?? ""));
    node.data = { ...node.data, altPrepared: true };
  });
  visit(tree, "imageReference", (node) => {
    if (node.data?.altPrepared) return;
    node.alt = markdownPlainText(parseMarkdownText(node.alt ?? ""));
    node.data = { ...node.data, altPrepared: true };
  });
  return tree;
}
function safeUrl(url: string): string {
  return /^(?:https?:|mailto:|tel:|\/|#|\.?\.?\/)/i.test(url) ||
    !/^[\s\S]*:/.test(url)
    ? escapeHtml(url)
    : "";
}
/** Small synchronous renderer for prepared labels and dynamic demo text. No server plugins. */
export function renderMarkdownTree(
  tree: Root,
  options: MarkdownOptions = {},
): string {
  const mode = options.mode ?? "single-line";
  const normalized =
    mode === "single-line" ? normalizeSingleLine(tree, options) : tree;
  function render(node: Node): string {
    const children = () => (node.children ?? []).map(render).join("");
    const tag = (name: string) => `<${name}>${children()}</${name}>`;
    switch (node.type) {
      case "root":
        return children();
      case "paragraph":
        return mode === "single-line" ? children() : tag("p");
      case "text":
        return mode === "summary"
          ? escapeHtml(node.value ?? "").replace(/\n/g, "<br>")
          : escapeHtml(node.value ?? "");
      case "strong":
        return tag("strong");
      case "emphasis":
        return tag("em");
      case "delete":
        return tag("del");
      case "heading":
        return tag(`h${node.depth ?? 2}`);
      case "inlineMath":
      case "math":
        return renderMathToHtml(node.value ?? "", node.type === "math");
      case "inlineCode":
        return `<code>${escapeHtml(node.value ?? "")}</code>`;
      case "code":
        return `<pre><code>${escapeHtml(node.value ?? "")}</code></pre>`;
      case "break":
        return "<br>";
      case "thematicBreak":
        return "<hr>";
      case "link":
        return options.linkPolicy === "plain"
          ? children()
          : `<a href="${safeUrl(node.url ?? "")}">${children()}</a>`;
      case "image":
        return `<img src="${safeUrl(node.url ?? "")}" alt="${escapeHtml(
          node.data?.["altPrepared"]
            ? (node.alt ?? "")
            : markdownPlainText(parseMarkdownText(node.alt ?? "")),
        )}">`;
      case "list":
        return tag(node.ordered ? "ol" : "ul");
      case "listItem":
        return tag("li");
      case "blockquote":
        return tag("blockquote");
      case "table":
        return tag("table");
      case "tableRow":
        return tag("tr");
      case "tableCell":
        return tag("td");
      case "html":
        return htmlNodes(node.value ?? "")
          .map(render)
          .join("");
      case "definition":
        return "";
      default:
        if (node.children) return children();
        throw new Error(`Unsupported Markdown node: ${node.type}`);
    }
  }
  return render(normalized as Node).trim();
}
export function renderMarkdownValue(
  fragment: MarkdownFragment,
  options: MarkdownOptions = {},
): MarkdownValue {
  return {
    markdown: fragment.markdown,
    text: markdownPlainText(fragment.tree),
    html: renderMarkdownTree(fragment.tree, options),
  };
}
/** Entry for one independently authored Markdown string; derived content uses renderMarkdownValue. */
export function renderMarkdownSource(
  markdown: string,
  options: MarkdownOptions = {},
): MarkdownValue {
  return renderMarkdownValue(parseMarkdownFragment(markdown), options);
}
