import { mergeTaxonomy } from "./taxonomy";
import { defaultContentLocale } from "@/i18n/config";
import type { Catalog } from "./types";
/** Scope is excluded from identity so a private variant can override its public counterpart on home only. */
export function mergeHomeCatalogs(
  publicCatalog: Catalog,
  privateCatalog?: Catalog,
): Catalog {
  if (!privateCatalog) return publicCatalog;
  const documents = new Map(
    publicCatalog.documents.map((doc) => [doc.key, doc]),
  );
  for (const doc of privateCatalog.documents) documents.set(doc.key, doc);
  const directories = new Map(
    publicCatalog.directories.map((dir) => [
      `${dir.lang ?? defaultContentLocale}/${dir.path}`,
      dir,
    ]),
  );
  for (const dir of privateCatalog.directories)
    directories.set(`${dir.lang ?? defaultContentLocale}/${dir.path}`, dir);
  return {
    version: 2,
    taxonomy: mergeTaxonomy(publicCatalog.taxonomy, privateCatalog.taxonomy),
    documents: [...documents.values()],
    directories: [...directories.values()],
  };
}
