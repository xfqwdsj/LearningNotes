import type { MarkdownValue } from "@/lib/markdown/types";
import { stripBasePath } from "@/lib/site-path";
import { contentRoute, localizedHref } from "./localization";
import { findTerm, taxonHref, termText } from "./taxonomy";
import type { Catalog } from "./types";
export const contentCollections = [
  {
    id: "courses",
    kind: "course-note",
    titleKey: "common.courses",
    descriptionKey: "home.courseDescription",
    href: "/courses/",
  },
  {
    id: "knowledge",
    kind: "knowledge",
    titleKey: "common.knowledge",
    descriptionKey: "home.knowledgeDescription",
    href: "/knowledge/",
  },
  {
    id: "tasks",
    kind: "task",
    titleKey: "common.tasks",
    descriptionKey: "home.taskDescription",
    href: "/tasks/",
  },
  {
    id: "articles",
    kind: "article",
    titleKey: "common.articles",
    descriptionKey: "home.articleDescription",
    href: "/articles/",
  },
] as const;
export interface BrowseLink {
  href: string;
  title: string | MarkdownValue;
  kind: "subject" | "course" | "subjects";
}
export function relatedBrowseLinks(
  catalog: Catalog,
  route: string,
): BrowseLink[] {
  const localized = contentRoute(
    stripBasePath(route, "/private").replace(/^\/|\/$/g, ""),
    catalog,
  );
  const [category, routeSubject, routeCourse] = localized.path.split("/");
  const document = catalog.documents.find((doc) => doc.path === localized.path);
  const subject = document?.subject ?? routeSubject;
  const course = document?.course ?? routeCourse;
  if (
    category === "subjects" ||
    !contentCollections.some((item) => item.id === category)
  )
    return [];
  if (!subject)
    return [
      {
        href: localizedHref("/subjects/", localized.locale),
        title: "",
        kind: "subjects",
      },
    ];
  const terms = [
    findTerm(catalog.taxonomy, subject),
    ...(course && (category === "courses" || category === "tasks")
      ? [findTerm(catalog.taxonomy, subject, course)]
      : []),
  ];
  return terms.flatMap((term) =>
    term
      ? [
          {
            href: localizedHref(taxonHref(term), localized.locale),
            title: termText(term, localized.locale).title,
            kind: term.kind,
          },
        ]
      : [],
  );
}
