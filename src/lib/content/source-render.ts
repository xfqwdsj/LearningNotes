import { renderMarkdownSource } from "@/lib/markdown/render";
import { katexOptions } from "@/lib/math";
import { unified } from "unified";
import remarkBreaks from "remark-breaks";
import remarkRehype, { type Options as RehypeOptions } from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeKatex from "rehype-katex";
import rehypeExpressiveCode from "rehype-expressive-code";
import { fromHtml } from "hast-util-from-html";
import { visit } from "unist-util-visit";
import type { Root, RootContent, PhrasingContent } from "mdast";
import type { Element, Root as HtmlRoot } from "hast";
import { remarkImageCaptions, type ImageCaptionMode } from "./image-captions";
import { remarkDirectivePresentation } from "./directive-presentation";
import { remarkGithubAlerts } from "./github-alerts";
import { codeBlockOptions } from "./code-blocks";
import { rehypeReadingFrames } from "./reading-frames";
import { rehypeDisclosureIcons } from "./rehype-disclosure-icons";
export interface RenderOptions {
  mode?: "document" | "summary" | "inline";
  imageCaptions?: ImageCaptionMode;
}
const nativeTags = new Set(
  "a abbr b br code del details div em figure figcaption hr i img kbd li mark ol p q s small span strong sub summary sup table tbody td th thead tr u ul".split(
    " ",
  ),
);
const handlers: NonNullable<RehypeOptions["handlers"]> = {
  mdxJsxFlowElement: nativeElement,
  mdxJsxTextElement: nativeElement,
  mdxFlowExpression: () => [],
  mdxTextExpression: () => [],
  mdxjsEsm: () => {
    throw new Error("Resolve content and demo imports before rendering");
  },
  html: (_state, node) => {
    if (node.type !== "html") return [];
    const tree = fromHtml(node.value, { fragment: true });
    visit(tree, "element", (element) => {
      if (element.tagName === "img")
        element.properties.alt = renderMarkdownSource(
          String(element.properties.alt ?? ""),
        ).text;
      if (
        !nativeTags.has(element.tagName) ||
        Object.keys(element.properties).some((key) => /^on/i.test(key))
      )
        throw new Error("Unsupported HTML in learning content");
    });
    return tree.children.filter(
      (child) =>
        child.type === "element" ||
        child.type === "text" ||
        child.type === "comment",
    );
  },
};
type RenderHandler = NonNullable<
  NonNullable<RehypeOptions["handlers"]>["mdxJsxFlowElement"]
>;
function nativeElement(
  ...[state, rawNode]: Parameters<RenderHandler>
): ReturnType<RenderHandler> {
  const node = rawNode as Extract<
    RootContent | PhrasingContent,
    { type: "mdxJsxFlowElement" | "mdxJsxTextElement" }
  >;
  if (node.type !== "mdxJsxFlowElement" && node.type !== "mdxJsxTextElement")
    throw new Error("Invalid native MDX element");
  if (node.name === null) return state.all(node);
  if (!nativeTags.has(node.name))
    throw new Error(`Unsupported MDX component: ${node.name}`);
  const properties: Element["properties"] = {};
  for (const attribute of node.attributes) {
    if (
      attribute.type !== "mdxJsxAttribute" ||
      /^on/i.test(attribute.name) ||
      (attribute.value !== null && typeof attribute.value !== "string")
    )
      throw new Error(
        "MDX attributes must be static text; spread, handlers and expressions are unsupported",
      );
    properties[attribute.name] =
      node.name === "img" && attribute.name === "alt"
        ? renderMarkdownSource(String(attribute.value ?? "")).text
        : (attribute.value ?? true);
  }
  return {
    type: "element" as const,
    tagName: node.name,
    properties,
    children: state.all(node),
  };
}
const summaryPresentation = () => (tree: HtmlRoot) => {
  visit(tree, "element", (node) => {
    if (/^h[1-6]$/.test(node.tagName)) delete node.properties.id;
  });
};
/** Shared, non-executing MD/MDX AST to HTML renderer. Demo imports are resolved to registered mounts. */
export async function renderSource(
  tree: Root,
  { mode = "document", imageCaptions = "alt" }: RenderOptions = {},
): Promise<string> {
  const copy = structuredClone(tree);
  visit(copy, "html", (node, index, parent) => {
    if (
      /^\s*<!--[\s\S]*-->\s*$/.test(node.value) &&
      parent &&
      index !== undefined
    ) {
      parent.children.splice(index, 1);
      return index;
    }
    return undefined;
  });
  visit(copy, (node) => {
    if (
      (node.type === "mdxFlowExpression" ||
        node.type === "mdxTextExpression") &&
      !/^\/\*[\s\S]*\*\/$/.test(node.value.trim())
    )
      throw new Error(
        "Only summary and more comment expressions are allowed in learning content",
      );
  });
  const processor = unified();
  if (mode === "summary") processor.use(remarkBreaks);
  processor
    .use(remarkImageCaptions, imageCaptions)
    .use(remarkGithubAlerts)
    .use(remarkDirectivePresentation);
  const renderer = processor
    .use(remarkRehype, { handlers })
    .use(rehypeDisclosureIcons)
    .use(rehypeKatex, katexOptions)
    .use(rehypeExpressiveCode, codeBlockOptions)
    .use(rehypeReadingFrames);
  if (mode === "summary") renderer.use(summaryPresentation);
  renderer.use(rehypeStringify);
  const html = await renderer.run(copy);
  return String(renderer.stringify(html));
}
