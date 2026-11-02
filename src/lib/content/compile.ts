import type { Root } from "mdast";
import { parseContent, stringifyContent } from "./syntax";
import { renderSource, type RenderOptions } from "./source-render";
import { semanticSections } from "./semantic";
import { sourceSections } from "./source-sections";
import type { Section } from "./types";
import { renderMarkdownSource } from "@/lib/markdown/render";
import type { MarkdownFragment } from "@/lib/markdown/types";
export const slugify = (value: string): string =>
  value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "");
/** Plain Markdown is an internal rendering/export format; authored documents are MDX. */
export const parseMarkdown = (source: string): Root => parseContent(source);
export const stringifyMarkdown = (tree: Root): string => stringifyContent(tree);
export const renderMarkdown = (source: string): Promise<string> =>
  renderSource(parseContent(source));
export const renderSummary = (
  fragment: MarkdownFragment,
  options: RenderOptions = {},
): Promise<string> =>
  renderSource(fragment.tree, { ...options, mode: "summary" });
export function extractSections(
  source: string,
): Omit<Section, "html" | "markdownUrl">[] {
  const tree = parseContent(source);
  semanticSections(tree);
  return sourceSections(tree).map(({ section }) => section);
}

/** Labels normalize invalid blocks rather than leaking their Markdown markers. */
export async function renderInlineMarkdown(source: string): Promise<string> {
  return renderMarkdownSource(source, {
    mode: "single-line",
    linkPolicy: "plain",
  }).html;
}
