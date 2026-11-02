import { requireTerm, termTitles, type Taxon } from "@/lib/content/taxonomy";
import { localizedValue } from "@/i18n/content";
import { createHash } from "node:crypto";
import { demoRecord } from "@/demos/catalog";
import {
  demoIds,
  type DemoId,
  type DemoIndex,
  type DemoManifest,
  type DemoList,
  type DemoRecord,
  type DemoReference,
} from "@/demos/types";
import type { Document } from "@/lib/content/types";
import { defaultLocale } from "@/i18n/config";
const demoPattern = /data-learning-demo="([^"]+)"/g;
const registeredDemos = new Set<string>(demoIds);
function mountedDemos(html: string): DemoId[] {
  return [
    ...new Set(
      [...html.matchAll(demoPattern)]
        .map((match) => match[1])
        .filter((id): id is DemoId => !!id && registeredDemos.has(id)),
    ),
  ];
}
export function documentDemos(
  doc: Pick<
    Document,
    "html" | "href" | "title" | "private" | "sections" | "kind"
  >,
): Record<string, DemoRecord> {
  return Object.fromEntries(
    mountedDemos(doc.html).map((id) => {
      const candidates = doc.sections.filter((section) =>
        section.html.includes(`data-learning-demo="${id}"`),
      );
      const section =
        candidates.find(
          (section) => section.slot === "knowledge.exploration",
        ) ?? candidates.sort((a, b) => a.depth - b.depth)[0];
      const reference: DemoReference = {
        title: doc.title,
        href: doc.href + (section ? `#${section.id}` : ""),
        private: doc.private,
      };
      return [
        id,
        doc.kind === "knowledge"
          ? demoRecord(id, [reference], reference)
          : demoRecord(id, [reference]),
      ];
    }),
  );
}
function validateKnowledgeDemoSources(
  documents: Document[],
): Map<DemoId, Document> {
  const owners = new Map<DemoId, Document>();
  const mounted = new Map<DemoId, Document[]>();
  for (const doc of documents) {
    const counts = new Map<DemoId, number>();
    for (const match of doc.html.matchAll(demoPattern)) {
      const id = match[1];
      if (!id || !registeredDemos.has(id)) continue;
      const demoId = id as DemoId;
      counts.set(demoId, (counts.get(demoId) ?? 0) + 1);
      mounted.set(demoId, [...(mounted.get(demoId) ?? []), doc]);
    }
    if (doc.kind === "knowledge") {
      for (const [id, count] of counts) {
        if (count > 1)
          throw new Error(
            `Demo "${id}" appears ${count} times in knowledge page ${doc.href}; each knowledge page may reference it only once.`,
          );
        const existing = owners.get(id);
        if (existing && existing.key !== doc.key)
          throw new Error(
            `Demo "${id}" has multiple knowledge sources: ${existing.href} and ${doc.href}.`,
          );
        owners.set(id, doc);
      }
    }
  }
  for (const [id, docs] of mounted)
    if (!owners.has(id))
      throw new Error(
        `Demo "${id}" is mounted outside a knowledge page and has no knowledge source: ${docs.map((doc) => doc.href).join(", ")}.`,
      );
  return owners;
}
export function demoAssets(
  documents: Document[],
  prefix: string,
  taxonomy: Taxon[],
  locale: string = defaultLocale,
): {
  manifest: DemoManifest;
  list: DemoList;
  catalog: DemoIndex;
  records: DemoRecord[];
  index: DemoIndex;
} {
  const titleCollator = new Intl.Collator(locale, {
    numeric: true,
    sensitivity: "base",
  });
  const visible = new Map<string, Document>();
  for (const doc of documents) {
    if (!visible.has(doc.key) || doc.private) visible.set(doc.key, doc);
  }
  const visibleDocuments = [...visible.values()];
  const owners = validateKnowledgeDemoSources(visibleDocuments);
  const referencesById = new Map<DemoId, Map<string, DemoReference>>();
  for (const doc of visibleDocuments) {
    for (const [id, record] of Object.entries(doc.demos ?? {}) as [
      DemoId,
      DemoRecord,
    ][]) {
      const references = referencesById.get(id) ?? new Map();
      for (const reference of [record.source, ...record.references])
        if (reference) references.set(reference.href, reference);
      referencesById.set(id, references);
    }
  }
  const digest = (value: unknown) =>
    createHash("sha256")
      .update(JSON.stringify(value))
      .digest("hex")
      .slice(0, 16);
  const records = demoIds
    .map((id) => {
      const all = [...(referencesById.get(id)?.values() ?? [])];
      const sourceDoc = owners.get(id);
      const source = sourceDoc?.demos?.[id]?.source;
      if (all.length && !source)
        throw new Error(`Demo "${id}" is missing its knowledge-page source.`);
      const references = all
        .filter((reference) => reference.href !== source?.href)
        .sort(
          (a, b) =>
            titleCollator.compare(a.title.text, b.title.text) ||
            a.href.localeCompare(b.href),
        );
      return demoRecord(id, references, source, locale);
    })
    .sort(
      (a, b) =>
        titleCollator.compare(a.title.text, b.title.text) ||
        a.id.localeCompare(b.id),
    );
  const list: DemoList = {
    version: 3,
    entries: records.map((record) => ({
      id: record.id,
      href: `${prefix}/demos/${record.id}/${digest(record)}.json`,
    })),
  };
  const catalog: DemoIndex = {
    version: 4,
    locale,
    count: records.length,
    entries: records.map((record, index) => ({
      id: record.id,
      title: record.title,
      description: record.description,
      subject: record.subject,
      subjectTitle: localizedValue(
        termTitles(requireTerm(taxonomy, record.subject)),
        locale,
      ),
      tags: record.tags,
      href: list.entries[index]!.href,
    })),
  };
  const manifest: DemoManifest = {
    version: 5,
    count: records.length,
    locales: {
      [locale]: {
        index: `${prefix}/demos/ids/${digest(list)}.json`,
        catalog: `${prefix}/demos/catalogs/${digest(catalog)}.json`,
      },
    },
  };
  return {
    manifest,
    list,
    catalog,
    records,
    index: catalog,
  };
}
