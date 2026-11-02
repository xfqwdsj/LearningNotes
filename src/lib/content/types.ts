import type { MarkdownValue } from "@/lib/markdown/types";
import type { Taxon } from "./taxonomy";
import type { DemoRecord } from "@/demos/types";
import type { ProblemSetData } from "./learning-types";

export type ContentKind = "knowledge" | "course-note" | "task" | "article";
export type TaskType = "exercise" | "exam" | "quiz" | "assignment";
/** One place where a section is included, addressed by a stable host anchor. */
export interface ReferenceLocation {
  href: string;
  title: MarkdownValue;
  section?: MarkdownValue;
  sourceSection?: MarkdownValue;
}
export interface Section {
  slot?: string;
  origin?: string;
  references?: ReferenceLocation[];
  id: string;
  title: MarkdownValue;
  depth: number;
  summary: MarkdownValue;
  markdown: string;
  text: string;
  html: string;
  markdownUrl: string;
}
export interface Document {
  order?: number;
  key: string;
  title: MarkdownValue;
  description: MarkdownValue;
  kind: ContentKind;
  subject: string;
  course: string;
  subjectTitles: Record<string, MarkdownValue>;
  courseTitles: Record<string, MarkdownValue>;
  lang: string;
  slug: string;
  path: string;
  href: string;
  markdownUrl: string;
  private: boolean;
  taskType?: TaskType;
  id?: string;
  tags: MarkdownValue[];
  createdAt?: string;
  updatedAt?: string;
  showDates: boolean;
  markdown: string;
  text: string;
  html: string;
  sections: Section[];
  references?: ReferenceLocation[];
  problemSets?: ProblemSetData[];
  demos?: Record<string, DemoRecord>;
  readingMinutes: number;
}
export interface Directory {
  iconSvg?: string;
  lang?: string;
  order?: number;
  path: string;
  title: MarkdownValue;
  description: MarkdownValue;
}
export interface Catalog {
  version: 2;
  taxonomy: Taxon[];
  documents: Document[];
  directories: Directory[];
}
export type SearchDocument = Pick<
  Document,
  | "key"
  | "title"
  | "description"
  | "kind"
  | "subject"
  | "course"
  | "subjectTitles"
  | "courseTitles"
  | "href"
  | "private"
  | "lang"
  | "taskType"
  | "id"
> & {
  version: 2;
  text: string;
  references?: ReferenceLocation[];
};
