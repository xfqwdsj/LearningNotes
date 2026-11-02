import type { DemoIndexEntry } from "@/demos/types";
import { cn } from "@/lib/utils";
import { MarkdownText } from "./markdown-text";
/** The same prepared metadata is used in catalog rows and the selected demo. */
export function DemoMetadata({
  entry,
  tagLimit,
  className,
}: {
  entry: Pick<DemoIndexEntry, "subjectTitle" | "tags">;
  tagLimit?: number;
  className?: string;
}) {
  const tags =
    tagLimit === undefined ? entry.tags : entry.tags.slice(0, tagLimit);
  return (
    <span className={cn("demo-metadata", className)}>
      <MarkdownText
        value={entry.subjectTitle}
        className="demo-metadata-subject"
      />
      {tags.length > 0 && <span aria-hidden="true">/</span>}
      {tags.map((tag, index) => (
        <span className="demo-metadata-tag" key={`${index}:${tag.markdown}`}>
          {index > 0 && <span aria-hidden="true"> · </span>}
          <MarkdownText value={tag} />
        </span>
      ))}
    </span>
  );
}
