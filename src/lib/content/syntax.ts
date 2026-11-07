import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMdx from "remark-mdx";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkDirective from "remark-directive";
import remarkStringify from "remark-stringify";
import type { Options as RemarkStringifyOptions } from "remark-stringify";
import type { Root } from "mdast";
import { remarkBracketMath } from "./bracket-math";

export function contentParser(mdx = false) {
  const parser = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkBracketMath)
    .use(remarkDirective);
  return mdx ? parser.use(remarkMdx) : parser;
}
export function parseContent(source: string, mdx = false): Root {
  return contentParser(mdx).parse(source);
}
export function stringifyContent(
  tree: Root,
  mdx = false,
  options?: Readonly<RemarkStringifyOptions>,
): string {
  const printer = unified()
    .use(remarkStringify, options)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkBracketMath)
    .use(remarkDirective);
  if (mdx) printer.use(remarkMdx);
  return printer.stringify(tree);
}

/** Parse phrasing content without interpreting a leading number or hash as a block. */
export function inlineContent(source: string): Root {
  const tree = parseContent(`a ${source}`);
  if (tree.children.length !== 1 || tree.children[0]?.type !== "paragraph")
    throw new Error("Only inline Markdown and math are supported here");
  const first = tree.children[0].children[0];
  if (first?.type !== "text") throw new Error("Invalid inline content");
  first.value = first.value.slice(2);
  if (!first.value) tree.children[0].children.shift();
  return tree;
}
