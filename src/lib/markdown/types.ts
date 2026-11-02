import type { Root } from "mdast";

export type MarkdownMode = "block" | "summary" | "single-line";
export type LinkPolicy = "preserve" | "plain";
/** One independently authored Markdown value and its reusable AST. */
export interface MarkdownFragment {
  markdown: string;
  tree: Root;
}
export interface MarkdownValue {
  markdown: string;
  text: string;
  html: string;
}
export interface MarkdownOptions {
  mode?: MarkdownMode;
  linkPolicy?: LinkPolicy;
}
export function isMarkdownValue(value: unknown): value is MarkdownValue {
  return (
    !!value &&
    typeof value === "object" &&
    ["markdown", "text", "html"].every(
      (key) => typeof (value as Record<string, unknown>)[key] === "string",
    )
  );
}

export const plainText = (value: MarkdownValue | string): string =>
  typeof value === "string" ? value : value.text;
export const plainValue = (text: string): MarkdownValue => ({
  markdown: text,
  text,
  html: text.replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ]!,
  ),
});
