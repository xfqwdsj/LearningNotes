import type { MarkdownValue } from "@/lib/markdown/types";
import { localizedValue } from "@/i18n/content";
import { defaultContentLocale } from "@/i18n/config";
import type { DemoRecord } from "@/demos/types";

export interface TermText {
  title: MarkdownValue;
  description: MarkdownValue;
  html?: string;
  markdown?: string;
  text?: string;
  demos?: Record<string, DemoRecord>;
}
export interface Taxon {
  kind: "subject" | "course";
  id: string;
  subject: string;
  icon: string;
  iconSvg: string;
  order: number;
  private: boolean;
  labels: Record<string, TermText>;
}
export const taxonKey = (term: Pick<Taxon, "kind" | "subject" | "id">) =>
  `${term.kind}/${term.subject}/${term.id}`;
export const taxonHref = (term: Pick<Taxon, "kind" | "subject" | "id">) =>
  `/subjects/${term.subject}${term.kind === "course" ? `/${term.id}` : ""}/`;
export function termText(term: Taxon, locale = defaultContentLocale): TermText {
  return localizedValue(term.labels, locale);
}
export function findTerm(
  terms: Taxon[],
  subject: string,
  course?: string,
): Taxon | undefined {
  return terms.find(
    (term) =>
      term.subject === subject &&
      (course
        ? term.kind === "course" && term.id === course
        : term.kind === "subject"),
  );
}
export function requireTerm(
  terms: Taxon[],
  subject: string,
  course?: string,
): Taxon {
  const term = findTerm(terms, subject, course);
  if (!term)
    throw new Error(
      `Undefined taxonomy: ${subject}${course ? `/${course}` : ""}`,
    );
  return term;
}
export const termTitles = (term: Taxon): Record<string, MarkdownValue> =>
  Object.fromEntries(
    Object.entries(term.labels).map(([lang, text]) => [lang, text.title]),
  );
export function localizedTitle(
  titles: Record<string, MarkdownValue>,
  locale: string,
): MarkdownValue {
  return localizedValue(titles, locale);
}
export function taxonomyLabels(terms: Taxon[], locale = defaultContentLocale) {
  return {
    subjectLabels: Object.fromEntries(
      terms
        .filter((term) => term.kind === "subject")
        .map((term) => [term.id, termText(term, locale).title]),
    ),
    courseLabels: Object.fromEntries(
      terms
        .filter((term) => term.kind === "course")
        .map((term) => [
          `${term.subject}/${term.id}`,
          termText(term, locale).title,
        ]),
    ),
  };
}
export function mergeTaxonomy(
  publicTerms: Taxon[],
  privateTerms: Taxon[],
): Taxon[] {
  const merged = new Map(publicTerms.map((term) => [taxonKey(term), term]));
  for (const term of privateTerms) {
    const previous = merged.get(taxonKey(term));
    merged.set(taxonKey(term), {
      ...term,
      labels: { ...previous?.labels, ...term.labels },
    });
  }
  return [...merged.values()].sort(
    (a, b) =>
      a.order - b.order ||
      taxonKey(a).localeCompare(taxonKey(b), "en", { numeric: true }),
  );
}
