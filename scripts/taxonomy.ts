import { renderMarkdownSource } from "@/lib/markdown/render";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { LucideIcon } from "lucide-react";
import { z } from "zod";
import { defaultContentLocale } from "@/i18n/config";
import {
  requireTerm,
  taxonKey,
  termText,
  type Taxon,
} from "@/lib/content/taxonomy";
import type { Directory } from "@/lib/content/types";
import type { ContentSource } from "@/lib/content/source-resolver";

export interface TermSource extends ContentSource {
  term: {
    subject: string;
    id: string;
    kind: "subject" | "course";
    icon?: string;
    order?: number;
    description: string;
  };
}
export interface RawDirectory {
  path: string;
  lang: string;
  title?: string;
  description?: string;
  order?: number;
}
export const directoryMetadata = z
  .object({
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    order: z.number().optional(),
    icon: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .optional(),
  })
  .strict();
const iconCache = new Map<string, Promise<string>>();
export function iconSvg(name: string): Promise<string> {
  let result = iconCache.get(name);
  if (!result) {
    result = (async () => {
      try {
        const iconModule = (await import(`lucide-react/icons/${name}`)) as {
          default: LucideIcon;
        };
        return renderToStaticMarkup(
          createElement(iconModule.default, { size: 24, "aria-hidden": true }),
        );
      } catch (error) {
        throw new Error(`Unknown Lucide icon: ${name}`, { cause: error });
      }
    })();
    iconCache.set(name, result);
  }
  return result;
}
export async function buildTaxonomy(sources: TermSource[]): Promise<Taxon[]> {
  const terms = new Map<string, Taxon>();
  const seen = new Set<string>();
  const ordered = [...sources].sort(
    (a, b) =>
      Number(a.private) - Number(b.private) ||
      Number(a.data.lang !== defaultContentLocale) -
        Number(b.data.lang !== defaultContentLocale) ||
      a.file.localeCompare(b.file),
  );
  for (const source of ordered) {
    const key = taxonKey(source.term);
    const identity = `${source.private}/${key}/${source.data.lang}`;
    if (seen.has(identity))
      throw new Error(`Duplicate taxonomy identity: ${identity}`);
    seen.add(identity);
    const previous = terms.get(key);
    const name = source.term.icon ?? previous?.icon ?? "book-open";
    if (
      previous &&
      source.data.lang !== defaultContentLocale &&
      source.term.icon &&
      name !== previous.icon
    )
      throw new Error(`Translated taxonomy icon differs: ${key}`);
    if (
      previous &&
      source.data.lang !== defaultContentLocale &&
      source.term.order !== undefined &&
      source.term.order !== previous.order
    )
      throw new Error(`Translated taxonomy order differs: ${key}`);
    terms.set(key, {
      kind: source.term.kind,
      id: source.term.id,
      subject: source.term.subject,
      icon: name,
      iconSvg: await iconSvg(name),
      order: source.term.order ?? previous?.order ?? 1000,
      private: source.private,
      labels: {
        ...previous?.labels,
        [source.data.lang]: {
          title: renderMarkdownSource(source.data.title, {
            mode: "single-line",
            linkPolicy: "plain",
          }),
          description: renderMarkdownSource(source.term.description, {
            mode: "summary",
          }),
        },
      },
    });
  }
  const result = [...terms.values()];
  for (const term of result) {
    if (!term.labels[defaultContentLocale])
      throw new Error(
        `Missing default taxonomy translation: ${taxonKey(term)}`,
      );
    if (term.kind === "course") requireTerm(result, term.subject);
  }
  return result.sort(
    (a, b) =>
      a.order - b.order ||
      taxonKey(a).localeCompare(taxonKey(b), "en", { numeric: true }),
  );
}
export function directoryTermPath(
  directory: string,
): [string, string?] | undefined {
  const [collection, subject, course, ...rest] = directory.split("/");
  if (
    !subject ||
    rest.length ||
    !["courses", "knowledge", "tasks"].includes(collection ?? "")
  )
    return undefined;
  if (!course) return [subject];
  if (collection === "courses" || collection === "tasks")
    return [subject, course];
  return undefined;
}
export function resolveDirectories(
  directories: RawDirectory[],
  terms: Taxon[],
): Directory[] {
  return directories.map((dir) => {
    const identity = directoryTermPath(dir.path);
    const term = identity ? requireTerm(terms, ...identity) : undefined;
    if (term && dir.title)
      throw new Error(
        `Directory title belongs in subjects metadata: ${dir.path}`,
      );
    const text = term ? termText(term, dir.lang) : undefined;
    const title =
      text?.title ??
      (dir.title
        ? renderMarkdownSource(dir.title, {
            mode: "single-line",
            linkPolicy: "plain",
          })
        : undefined);
    const description = dir.description
      ? renderMarkdownSource(dir.description, { mode: "summary" })
      : text?.description;
    if (!title || !description)
      throw new Error(`Missing directory description: ${dir.path}`);
    const order = dir.order ?? term?.order;
    return {
      path: dir.path,
      lang: dir.lang,
      title,
      description,
      ...(order === undefined ? {} : { order }),
      ...(term ? { iconSvg: term.iconSvg } : {}),
    };
  });
}
