import type { Document } from "./types";

type OrderedContent = Pick<Document, "order" | "path" | "title">;

const collators = new Map<string, Intl.Collator>();

function contentCollator(locale: string): Intl.Collator {
  const canonical = Intl.getCanonicalLocales(locale)[0] ?? locale;
  let collator = collators.get(canonical);
  if (!collator) {
    collator = new Intl.Collator(canonical, { numeric: true });
    collators.set(canonical, collator);
  }
  return collator;
}

/**
 * Explicit metadata wins. Items without an order use the display language's
 * default collation, with numeric runs compared naturally.
 */
export function orderDocuments<T extends OrderedContent>(
  documents: readonly T[],
  locale: string,
): T[] {
  const collator = contentCollator(locale);
  return [...documents].sort(
    (left, right) =>
      (left.order ?? 1000) - (right.order ?? 1000) ||
      collator.compare(left.title.text, right.title.text) ||
      collator.compare(left.path, right.path),
  );
}
