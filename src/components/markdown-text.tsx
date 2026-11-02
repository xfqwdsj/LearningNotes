import type { MarkdownValue } from "@/lib/markdown/types";
/** Prepared content only: this component never parses Markdown in the browser. */
export function MarkdownText({
  value,
  className,
  as: Tag = "span",
}: {
  value: MarkdownValue | string;
  className?: string | undefined;
  as?: "span" | "div";
}) {
  if (typeof value === "string")
    return <Tag className={className}>{value}</Tag>;
  return (
    <Tag
      className={className}
      dangerouslySetInnerHTML={{ __html: value.html }}
    />
  );
}
