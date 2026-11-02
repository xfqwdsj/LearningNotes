import { contentFallbacks } from "@/i18n/content";
export { contentFallbacks } from "@/i18n/content";
import {
  canonicalContentLocale,
  contentLocalePrefix,
  defaultContentLocale,
} from "@/i18n/config";
import type { Catalog, Directory, Document } from "./types";
const collections = new Set([
  "knowledge",
  "courses",
  "tasks",
  "articles",
  "subjects",
]);
export function localizedContentPath(relative: string): {
  path: string;
  locale: string;
} {
  const [first = "", ...rest] = relative.split("/");
  if (collections.has(first) || first === "_index.mdx")
    return { path: relative, locale: defaultContentLocale };
  if (!/^[a-z]{2,3}(?:-[a-zA-Z0-9]{2,8})*$/.test(first))
    throw new Error(`Invalid content locale directory: ${first}`);
  return { path: rest.join("/"), locale: canonicalContentLocale(first) };
}
export function translationIdentity(doc: Document): string {
  return `${doc.private ? "private" : "public"}/${doc.kind}/${doc.path}`;
}
export function documentTranslations(
  doc: Document,
  catalog: Catalog,
): Document[] {
  return catalog.documents.filter(
    (item) => translationIdentity(item) === translationIdentity(doc),
  );
}
export function preferredDocuments(
  catalog: Catalog,
  locale: string = defaultContentLocale,
): Document[] {
  const result = new Map<string, Document>();
  const fallback = contentFallbacks(locale);
  const rank = (lang: string) => {
    const index = fallback.indexOf(lang);
    return index < 0 ? fallback.length : index;
  };
  for (const doc of catalog.documents) {
    const id = translationIdentity(doc);
    const previous = result.get(id);
    if (!previous || rank(doc.lang) < rank(previous.lang)) result.set(id, doc);
  }
  return [...result.values()];
}
export function localizedDirectories(
  catalog: Catalog,
  locale: string,
): Directory[] {
  const result = new Map<string, Directory>();
  const fallback = contentFallbacks(locale);
  for (const lang of [...fallback].reverse()) {
    for (const dir of catalog.directories)
      if ((dir.lang ?? defaultContentLocale) === lang)
        result.set(dir.path, dir);
  }
  return [...result.values()];
}
export function contentRoute(
  route: string,
  catalog: Catalog,
): { path: string; locale: string } {
  const [first = "", ...rest] = route.split("/");
  const translated =
    catalog.documents.some(
      (doc) => doc.lang !== defaultContentLocale && doc.lang === first,
    ) ||
    (first !== defaultContentLocale &&
      catalog.taxonomy.some((term) => Object.hasOwn(term.labels, first)));
  return translated
    ? { path: rest.join("/"), locale: first }
    : { path: route, locale: defaultContentLocale };
}
export function localizedHref(href: string, locale: string): string {
  return href === "/" ? href : `${contentLocalePrefix(locale)}${href}`;
}
export function languageName(
  locale: string,
  displayLocale: string = locale,
): string {
  return (
    new Intl.DisplayNames([displayLocale], { type: "language" }).of(locale) ??
    locale
  );
}
