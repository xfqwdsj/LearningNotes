import { renderIcuMarkdown, type IcuValues } from "@/lib/markdown/icu";
import {
  isMarkdownValue,
  type MarkdownValue,
  type MarkdownOptions,
} from "@/lib/markdown/types";
import { MarkdownText } from "./markdown-text";
export function IcuMarkdownText({
  template,
  values,
  locale,
  value,
  ...options
}: MarkdownOptions & {
  template?: string;
  values?: IcuValues;
  locale?: string;
  value?: MarkdownValue | string;
}) {
  const prepared = isMarkdownValue(value)
    ? value
    : renderIcuMarkdown(template ?? value ?? "", values, {
        ...options,
        ...(locale ? { locale } : {}),
      });
  return (
    <MarkdownText
      value={prepared}
      as={options.mode && options.mode !== "single-line" ? "div" : "span"}
    />
  );
}
