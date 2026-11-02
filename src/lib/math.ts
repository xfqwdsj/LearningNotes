import { renderToString, type KatexOptions } from "katex";
export const katexOptions = {
  throwOnError: false,
  strict: "ignore",
  output: "htmlAndMathml",
} satisfies KatexOptions;
export function renderMathToHtml(source: string, displayMode = false) {
  return renderToString(source, { ...katexOptions, displayMode });
}
