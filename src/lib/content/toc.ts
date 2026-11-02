import type { MarkdownValue } from "@/lib/markdown/types";
import type { Section } from "./types";

export interface TocSection {
  id: string;
  title: MarkdownValue;
  depth: number;
}

export function tocSections(
  sections: Pick<Section, "id" | "title" | "depth">[],
): TocSection[] {
  return sections.map(({ id, title, depth }) => ({
    id,
    title,
    depth,
  }));
}
