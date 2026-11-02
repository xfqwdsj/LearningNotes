import { plainValue } from "@/lib/markdown/types";
import type { MarkdownValue } from "@/lib/markdown/types";
import { relatedBrowseLinks, type BrowseLink } from "./browse";
import { defaultContentLocale } from "@/i18n/config";
import { findTerm, taxonHref, termText, taxonomyLabels } from "./taxonomy";
import type { DemoRecord } from "@/demos/types";
import { contentLocalePrefix } from "@/i18n/config";
import {
  contentRoute,
  localizedDirectories,
  localizedHref,
  preferredDocuments,
} from "./localization";
import { getLabels } from "@/i18n/labels";
import { createUiTranslator } from "@/i18n/translate";
import { orderDocuments } from "./ordering";
const t = createUiTranslator();
const { taskLabels } = getLabels(t);
import type { Catalog, Document } from "./types";
import { stripBasePath } from "@/lib/site-path";

export interface Crumb {
  label: string | MarkdownValue;
  href: string;
}
export interface CollectionCard {
  destination?: string;
  iconSvg?: string | undefined;
  title: string | MarkdownValue;
  description: string | MarkdownValue;
  href: string;
  count: number;
}
export interface Listing {
  related?: BrowseLink[];
  cardGroups?: { title: string | MarkdownValue; cards: CollectionCard[] }[];
  intro?: { html: string; demos: Record<string, DemoRecord>; lang: string };
  title: string | MarkdownValue;
  description: string | MarkdownValue;
  crumbs: Crumb[];
  cards: CollectionCard[];
  documents: Document[];
  parent: Crumb;
}
const collections = {
  courses: {
    title: t("navigation.courses"),
    description: t("collections.courses.description"),
    kind: "course-note",
  },
  knowledge: {
    title: t("common.knowledge"),
    description: t("collections.knowledge.description"),
    kind: "knowledge",
  },
  tasks: {
    title: t("common.tasks"),
    description: t("collections.tasks.description"),
    kind: "task",
  },
  articles: {
    title: t("common.articlesAndNotes"),
    description: t("collections.articles.description"),
    kind: "article",
  },
} as const;
type Collection = keyof typeof collections;
/** Explicit directory metadata wins; empty content roots use the shared collection registry. */
function navigationDirectories(catalog: Catalog, locale: string) {
  const directories = localizedDirectories(catalog, locale);
  const existing = new Set(directories.map((directory) => directory.path));
  return [
    ...Object.entries(collections)
      .filter(([path]) => !existing.has(path))
      .map(([path, definition]) => ({
        path,
        title: plainValue(definition.title),
        description: plainValue(definition.description),
        lang: locale,
      })),
    ...directories,
  ];
}

export const localHref = (href: string): string =>
  stripBasePath(href, "/private");
export function directoryTitle(
  catalog: Catalog,
  directory: string,
  fallback: string | MarkdownValue,
): string | MarkdownValue {
  return (
    catalog.directories.find((item) => item.path === directory)?.title ??
    fallback
  );
}
export function getDocumentNavigation(
  doc: Document,
  catalog: Catalog,
): { crumbs: Crumb[]; parent: Crumb; siblings: Document[] } {
  catalog = {
    ...catalog,
    directories: navigationDirectories(catalog, doc.lang),
  };
  const { subjectLabels, courseLabels } = taxonomyLabels(
    catalog.taxonomy,
    doc.lang,
  );
  const home = { label: t("common.home"), href: "/" };
  let crumbs: Crumb[];
  if (doc.kind === "article")
    crumbs = [
      home,
      {
        label: directoryTitle(catalog, "articles", collections.articles.title),
        href: "/articles/",
      },
    ];
  else {
    const category =
      doc.kind === "course-note"
        ? "courses"
        : doc.kind === "task"
          ? "tasks"
          : "knowledge";
    crumbs = [
      home,
      {
        label: directoryTitle(catalog, category, collections[category].title),
        href: `/${category}/`,
      },
      {
        label: subjectLabels[doc.subject] ?? doc.subject,
        href: `/${category}/${doc.subject}/`,
      },
    ];
    if (doc.kind === "knowledge") {
      const folders = doc.path.split("/").slice(2, -1);
      for (let i = 0; i < folders.length; i++) {
        const folder = `knowledge/${doc.subject}/${folders.slice(0, i + 1).join("/")}`;
        crumbs.push({
          label: directoryTitle(catalog, folder, folders[i]!),
          href: `/${folder}/`,
        });
      }
    }
    if (doc.course)
      crumbs.push({
        label: directoryTitle(
          catalog,
          `${category}/${doc.subject}/${doc.course}`,
          courseLabels[`${doc.subject}/${doc.course}`] ?? doc.course,
        ),
        href: `/${category}/${doc.subject}/${doc.course}/`,
      });
    if (doc.taskType)
      crumbs.push({
        label: taskLabels[doc.taskType],
        href: `/tasks/${doc.subject}/${doc.course}/${doc.taskType}/`,
      });
  }
  return {
    crumbs: [
      ...crumbs.map((crumb) => ({
        ...crumb,
        href: localizedHref(crumb.href, doc.lang),
      })),
      { label: doc.title, href: localHref(doc.href) },
    ],
    parent: {
      ...(crumbs.at(-1) ?? home),
      href: localizedHref((crumbs.at(-1) ?? home).href, doc.lang),
    },
    siblings: orderDocuments(
      preferredDocuments(catalog, doc.lang).filter(
        (item) =>
          item.kind === doc.kind &&
          (doc.kind !== "knowledge" ||
            item.path.split("/").slice(0, -1).join("/") ===
              doc.path.split("/").slice(0, -1).join("/")) &&
          item.subject === doc.subject &&
          item.course === doc.course &&
          item.taskType === doc.taskType,
      ),
      doc.lang,
    ),
  };
}
export function getListing(
  catalog: Catalog,
  route: string,
): Listing | undefined {
  const localized = contentRoute(route, catalog);
  const listing = getListingForLocale(
    {
      ...catalog,
      documents: preferredDocuments(catalog, localized.locale),
      directories: navigationDirectories(catalog, localized.locale),
    },
    localized.path,
    localized.locale,
  );
  if (!listing) return undefined;
  const link = (href: string) => localizedHref(href, localized.locale);
  return {
    ...listing,
    related: relatedBrowseLinks(catalog, route),
    ...(listing.cardGroups
      ? {
          cardGroups: listing.cardGroups.map((group) => ({
            ...group,
            cards: group.cards.map((item) => ({
              ...item,
              href: link(item.href),
            })),
          })),
        }
      : {}),
    crumbs: listing.crumbs.map((item) => ({ ...item, href: link(item.href) })),
    parent: { ...listing.parent, href: link(listing.parent.href) },
    cards: listing.cards.map((item) => ({ ...item, href: link(item.href) })),
  };
}
function getListingForLocale(
  catalog: Catalog,
  route: string,
  locale = defaultContentLocale,
): Listing | undefined {
  const { subjectLabels, courseLabels } = taxonomyLabels(
    catalog.taxonomy,
    locale,
  );
  const [category, subject, course, taskType] = route.split("/");
  const home = { label: t("common.home"), href: "/" };
  if (category === "subjects") {
    if (!subject)
      return {
        title: t("navigation.subjects"),
        description: t("navigation.subjectsDescription"),
        crumbs: [home, { label: t("navigation.subjects"), href: "/subjects/" }],
        parent: home,
        documents: [],
        cards: catalog.taxonomy
          .filter((term) => term.kind === "subject")
          .map((term) => term.id)
          .map((id) => ({
            title: subjectLabels[id] ?? id,
            description: findTerm(catalog.taxonomy, id)
              ? termText(findTerm(catalog.taxonomy, id)!, locale).description
              : t("navigation.subjectContents"),
            iconSvg: findTerm(catalog.taxonomy, id)?.iconSvg,
            href: `/subjects/${id}/`,
            count: catalog.documents.filter((doc) => doc.subject === id).length,
          })),
      };
    const term = findTerm(catalog.taxonomy, subject, course);
    if (!term || taskType) return undefined;
    const text = termText(term, locale);
    const docs = catalog.documents.filter(
      (doc) => doc.subject === subject && (!course || doc.course === course),
    );
    const subjectTitle = subjectLabels[subject] ?? subject;
    const crumbs = [
      home,
      { label: t("navigation.subjects"), href: "/subjects/" },
      { label: subjectTitle, href: `/subjects/${subject}/` },
    ];
    if (course) crumbs.push({ label: text.title, href: taxonHref(term) });
    const contentCards: CollectionCard[] = (
      Object.keys(collections) as Collection[]
    ).flatMap((key) => {
      const selected = docs.filter((doc) => doc.kind === collections[key].kind);
      if (!selected.length) return [];
      return [
        {
          title: collections[key].title,
          description: collections[key].description,
          destination: t("navigation.openCollection", {
            collection: collections[key].title,
          }),
          href:
            key === "articles"
              ? "/articles/"
              : `/${key}/${subject}${course && (key === "courses" || key === "tasks") ? `/${course}` : ""}/`,
          count: selected.length,
        },
      ];
    });
    const courseCards = !course
      ? catalog.taxonomy
          .filter(
            (candidate) =>
              candidate.kind === "course" && candidate.subject === subject,
          )
          .map((candidate) => ({
            title: termText(candidate, locale).title,
            description: termText(candidate, locale).description,
            href: taxonHref(candidate),
            iconSvg: candidate.iconSvg,
            count: docs.filter((doc) => doc.course === candidate.id).length,
            destination: t("navigation.openCourseOverview"),
          }))
      : [];
    const cards = [...contentCards, ...courseCards];
    const cardGroups = [
      { title: t("navigation.subjectContentViews"), cards: contentCards },
      ...(!course
        ? [{ title: t("navigation.courseOverviews"), cards: courseCards }]
        : []),
    ].filter((group) => group.cards.length > 0);
    return {
      title: text.title,
      description: text.description,
      crumbs,
      parent: crumbs.at(-2) ?? home,
      documents: [],
      cards,
      cardGroups,
      ...(text.html
        ? {
            intro: {
              html: text.html,
              demos: text.demos ?? {},
              lang:
                Object.entries(term.labels).find(
                  ([, label]) => label === text,
                )?.[0] ?? defaultContentLocale,
            },
          }
        : {}),
    };
  }
  if (category === "knowledge") {
    const directory = catalog.directories.find((dir) => dir.path === route);
    if (!directory) return undefined;
    const folders = route.split("/");
    const crumbs = [
      home,
      ...folders.map((_, index) => {
        const folder = folders.slice(0, index + 1).join("/");
        return {
          label: directoryTitle(catalog, folder, folders[index]!),
          href: `/${folder}/`,
        };
      }),
    ];
    const children = catalog.directories
      .filter((dir) => dir.path.split("/").slice(0, -1).join("/") === route)
      .sort(
        (a, b) =>
          (a.order ?? 1000) - (b.order ?? 1000) ||
          a.path.localeCompare(b.path, "en", { numeric: true }),
      );
    return {
      title: directory.title,
      description: directory.description,
      crumbs,
      parent: crumbs.at(-2) ?? home,
      cards: children.map((child) => ({
        title: child.title,
        description: child.description,
        href: `/${child.path}/`,
        iconSvg: child.iconSvg,
        count: catalog.documents.filter(
          (doc) =>
            doc.kind === "knowledge" && doc.path.startsWith(`${child.path}/`),
        ).length,
      })),
      documents: orderDocuments(
        catalog.documents.filter(
          (doc) =>
            doc.kind === "knowledge" &&
            doc.path.split("/").slice(0, -1).join("/") === route,
        ),
        locale,
      ),
    };
  }
  if (!category || !(category in collections)) return undefined;
  const key = category as Collection;
  const definition = collections[key];
  const documents = catalog.documents.filter(
    (doc) =>
      doc.kind === definition.kind &&
      (!subject || doc.subject === subject) &&
      (!course || doc.course === course) &&
      (!taskType || doc.taskType === taskType),
  );
  if ((subject || course || taskType) && !documents.length) return undefined;
  const crumbs: Crumb[] = [
    home,
    {
      label: directoryTitle(catalog, category, definition.title),
      href: `/${category}/`,
    },
  ];
  if (subject)
    crumbs.push({
      label: subjectLabels[subject] ?? subject,
      href: `/${category}/${subject}/`,
    });
  if (course)
    crumbs.push({
      label: directoryTitle(
        catalog,
        `${category}/${subject}/${course}`,
        courseLabels[`${subject}/${course}`] ?? course,
      ),
      href: `/${category}/${subject}/${course}/`,
    });
  if (taskType)
    crumbs.push({
      label: taskLabels[taskType as keyof typeof taskLabels] ?? taskType,
      href: `/${category}/${subject}/${course}/${taskType}/`,
    });
  let cards: CollectionCard[] = [];
  if (key !== "articles" && !subject)
    cards = [...new Set(documents.map((doc) => doc.subject))].map((id) => ({
      title: subjectLabels[id] ?? id,
      iconSvg: findTerm(catalog.taxonomy, id)?.iconSvg,
      description: t("navigation.subjectCollection", {
        subject: subjectLabels[id]?.text ?? id,
        collection: definition.title,
      }),
      href: `/${category}/${id}/`,
      count: documents.filter((doc) => doc.subject === id).length,
    }));
  else if ((key === "courses" || key === "tasks") && subject && !course)
    cards = [...new Set(documents.map((doc) => doc.course))].map((id) => ({
      title: directoryTitle(
        catalog,
        `${category}/${subject}/${id}`,
        courseLabels[`${subject}/${id}`] ?? id,
      ),
      description:
        catalog.directories.find(
          (dir) => dir.path === `${category}/${subject}/${id}`,
        )?.description ?? t("navigation.courseReading"),
      href: `/${category}/${subject}/${id}/`,
      iconSvg: findTerm(catalog.taxonomy, subject, id)?.iconSvg,
      count: documents.filter((doc) => doc.course === id).length,
    }));
  else if (key === "tasks" && course && !taskType)
    cards = [
      ...new Set(
        documents.flatMap((doc) => (doc.taskType ? [doc.taskType] : [])),
      ),
    ].map((id) => ({
      title: taskLabels[id],
      description: t("navigation.taskReading"),
      href: `/tasks/${subject}/${course}/${id}/`,
      count: documents.filter((doc) => doc.taskType === id).length,
    }));
  return {
    title: crumbs.at(-1)?.label ?? definition.title,
    description:
      catalog.directories.find((directory) => directory.path === route)
        ?.description ??
      (course
        ? key === "courses"
          ? t("navigation.courseReading")
          : t("navigation.taskReading")
        : definition.description),
    crumbs,
    parent: crumbs.at(-2) ?? home,
    cards,
    documents: cards.length ? [] : orderDocuments(documents, locale),
  };
}
export function getStaticRoutes(catalog: Catalog): string[] {
  const routes = new Set(["subjects", ...Object.keys(collections)]);
  for (const term of catalog.taxonomy)
    for (const locale of Object.keys(term.labels))
      routes.add(
        `${contentLocalePrefix(locale)}${taxonHref(term)}`.replace(
          /^\/|\/$/g,
          "",
        ),
      );
  for (const directory of catalog.directories)
    if (
      directory.path === "knowledge" ||
      directory.path.startsWith("knowledge/")
    )
      routes.add(
        `${contentLocalePrefix(directory.lang ?? defaultContentLocale)}/${directory.path}`.replace(
          /^\//,
          "",
        ),
      );
  for (const doc of catalog.documents) {
    const parts = doc.path.split("/");
    const depth = parts.length - 1;
    for (let i = 1; i <= depth; i++)
      routes.add(
        `${contentLocalePrefix(doc.lang)}/${parts.slice(0, i).join("/")}`.replace(
          /^\//,
          "",
        ),
      );
    routes.add(localHref(doc.href).replace(/^\/|\/$/g, ""));
    routes.add(
      `${contentLocalePrefix(doc.lang)}/subjects/${doc.subject}`.replace(
        /^\//,
        "",
      ),
    );
    for (const collection of ["subjects", ...Object.keys(collections)])
      routes.add(
        `${contentLocalePrefix(doc.lang)}/${collection}`.replace(/^\//, ""),
      );
    for (const crumb of getDocumentNavigation(doc, catalog).crumbs)
      if (crumb.href !== "/") routes.add(crumb.href.replace(/^\/|\/$/g, ""));
  }
  // Every translated collection also needs the hierarchy of fallback content.
  const listingRoutes = [...routes]
    .map((route) => contentRoute(route, catalog).path)
    .filter((route) => getListing(catalog, route) !== undefined);
  for (const locale of new Set([
    ...catalog.documents.map((doc) => doc.lang),
    ...catalog.taxonomy.flatMap((term) => Object.keys(term.labels)),
  ]))
    for (const route of listingRoutes)
      routes.add(`${contentLocalePrefix(locale)}/${route}`.replace(/^\//, ""));
  return [...routes];
}
