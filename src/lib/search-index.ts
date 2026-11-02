import { isMarkdownValue, type MarkdownValue } from "@/lib/markdown/types";
import type { SearchDocument } from "./content/types";

const isTitles = (value: unknown): value is Record<string, MarkdownValue> =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value) &&
  Object.values(value).every(isMarkdownValue);

const isReferences = (value: unknown): boolean =>
  value === undefined ||
  (Array.isArray(value) &&
    value.every(
      (reference: unknown) =>
        typeof reference === "object" &&
        reference !== null &&
        "href" in reference &&
        typeof reference.href === "string" &&
        reference.href.startsWith("/") &&
        "title" in reference &&
        isMarkdownValue(reference.title) &&
        (!("section" in reference) || isMarkdownValue(reference.section)) &&
        (!("sourceSection" in reference) ||
          isMarkdownValue(reference.sourceSection)),
    ));

export async function fetchSearchIndex(
  base: string,
): Promise<SearchDocument[]> {
  const response = await fetch(`${base}/search.json`, {
    credentials: "same-origin",
    headers: { "X-Requested-With": "XMLHttpRequest" },
    redirect: "error",
    cache: base ? "no-store" : "default",
  });
  if (!response.ok || !response.headers.get("content-type")?.includes("json"))
    throw new Error("Search unavailable");
  const data: unknown = await response.json();
  if (
    !Array.isArray(data) ||
    !data.every(
      (doc: unknown) =>
        typeof doc === "object" &&
        doc !== null &&
        "version" in doc &&
        doc.version === 2 &&
        "subjectTitles" in doc &&
        isTitles(doc.subjectTitles) &&
        "courseTitles" in doc &&
        isTitles(doc.courseTitles) &&
        "title" in doc &&
        isMarkdownValue(doc.title) &&
        "description" in doc &&
        isMarkdownValue(doc.description) &&
        "href" in doc &&
        typeof doc.href === "string" &&
        isReferences("references" in doc ? doc.references : undefined) &&
        doc.href.startsWith(base ? "/private/" : "/") &&
        (Boolean(base) || !doc.href.startsWith("/private/")),
    )
  )
    throw new Error("Invalid search index");
  return data as SearchDocument[];
}
