import { plainValue } from "@/lib/markdown/types";
import { describe, expect, it } from "vitest";
import { readFixtureCatalog, readFixtureJson } from "./fixtures/generated";
import { demoAssets as buildDemoAssets } from "../scripts/demo-assets";
import { mergeHomeCatalogs } from "@/lib/content/home-catalog";
import { demoRecord } from "@/demos/catalog";
import { demoIds } from "@/demos/types";
import {
  demoLocations,
  isDemoIndex,
  isDemoList,
  isDemoRecord,
} from "@/demos/types";
import type { Catalog } from "@/lib/content/types";
const catalog = (scope: "public" | "private") =>
  readFixtureCatalog("vitest", scope);
const demoAssets = (documents: Catalog["documents"], prefix: string) =>
  buildDemoAssets(
    documents,
    prefix,
    catalog(prefix ? "private" : "public").taxonomy,
  );
describe("demo publishing", () => {
  it("publishes a tiny bootstrap and independent records with discoverable links", () => {
    const result = demoAssets(catalog("public").documents, "");
    expect(result.manifest.count).toBe(demoIds.length);
    expect(JSON.stringify(result.manifest).length).toBeLessThan(220);
    expect(JSON.stringify(result.manifest)).not.toContain("messages");
    expect(isDemoList(result.list, "")).toBe(true);
    expect(isDemoIndex(result.catalog, "")).toBe(true);
    expect(result.manifest.locales["zh-CN"]!.catalog).toMatch(
      /^\/demos\/catalogs\/[a-f0-9]{16}\.json$/,
    );
    const titles = result.catalog.entries.map((entry) => entry.title.text);
    expect(titles).toEqual(
      [...titles].sort((a, b) =>
        a.localeCompare(b, "zh-CN", {
          numeric: true,
          sensitivity: "base",
        }),
      ),
    );
    expect(JSON.stringify(result.list)).not.toContain("messages");
    for (const record of result.records) {
      expect(isDemoRecord(record)).toBe(true);
      expect(record.source).toBeDefined();
      expect(record.source?.href).toBe(demoLocations(record)[0]?.href);
      expect(record.references).not.toContainEqual(record.source);
      expect(demoLocations(record).length).toBeGreaterThan(0);
      expect(JSON.stringify(record)).not.toContain("importPath");
    }
    expect(demoAssets(catalog("public").documents, "").manifest).toEqual(
      result.manifest,
    );
    const index = readFixtureJson("vitest", "public/assets/demos/index.json");
    expect(index).toEqual(result.catalog);
  });
  it("keeps private references out of public records while merging them on the private site", () => {
    const publicDocs = catalog("public").documents;
    const privateCopy = {
      ...publicDocs.find((doc) => doc.demos?.["continuity"])!,
      private: true,
      href: "/private/example/",
      demos: {
        continuity: demoRecord("continuity", [], {
          title: plainValue("Private example"),
          href: "/private/example/#exploration",
          private: true,
        }),
      },
    };
    const publicResult = demoAssets(publicDocs, "");
    const privateResult = demoAssets([...publicDocs, privateCopy], "/private");
    expect(JSON.stringify(publicResult)).not.toContain("Private example");
    expect(JSON.stringify(privateResult)).toContain("Private example");
    expect(privateResult.manifest.locales["zh-CN"]!.index).toMatch(
      /^\/private\/demos\//,
    );
    expect(privateResult.manifest.locales["zh-CN"]!.catalog).toMatch(
      /^\/private\/demos\/catalogs\//,
    );
    expect(publicResult.manifest.locales["zh-CN"]!.index).not.toBe(
      privateResult.manifest.locales["zh-CN"]!.index,
    );
    expect(isDemoList(privateResult.list, "/private")).toBe(true);
    expect(isDemoList(privateResult.list, "")).toBe(false);
    expect(
      isDemoList(
        {
          version: 3,
          entries: [publicResult.list.entries[0], publicResult.list.entries[0]],
        },
        "",
      ),
    ).toBe(false);
    expect(
      isDemoList(
        {
          version: 3,
          entries: [{ id: "bayes", href: "https://untrusted.test/data.json" }],
        },
        "",
      ),
    ).toBe(false);
    const entry = (result: ReturnType<typeof demoAssets>, id: string) =>
      result.list.entries.find((item) => item.id === id)!.href;
    const changedPublic = demoAssets(
      publicDocs.map((doc) =>
        doc.key === privateCopy.key ? { ...privateCopy, private: false } : doc,
      ),
      "",
    );
    expect(entry(changedPublic, "continuity")).not.toBe(
      entry(publicResult, "continuity"),
    );
    expect(entry(changedPublic, "bayes")).toBe(entry(publicResult, "bayes"));
  });
  it("rejects unsupported component IDs and malformed localized payloads", () => {
    expect(
      isDemoRecord({ ...demoRecord("continuity"), id: "arbitrary-import" }),
    ).toBe(false);
    expect(
      isDemoRecord({ ...demoRecord("continuity"), messages: { bad: 1 } }),
    ).toBe(false);
    expect(
      isDemoRecord({ ...demoRecord("continuity"), locale: "invalid_locale" }),
    ).toBe(false);
  });
  it("rejects duplicate or competing knowledge-page demo sources", () => {
    const documents = catalog("public").documents;
    const source = documents.find(
      (doc) => doc.kind === "knowledge" && doc.demos?.["continuity"],
    )!;
    expect(() =>
      demoAssets(
        documents.map((doc) =>
          doc.key === source.key
            ? {
                ...source,
                html: `${source.html}<div data-learning-demo="continuity"></div>`,
              }
            : doc,
        ),
        "",
      ),
    ).toThrow(/appears 2 times/);
    expect(() =>
      demoAssets(
        [
          ...documents,
          {
            ...source,
            key: `${source.key}-duplicate`,
            href: "/knowledge/duplicate/",
          },
        ],
        "",
      ),
    ).toThrow(/multiple knowledge sources/);
  });
});
describe("home scope merging", () => {
  it("preserves public content, privately overrides duplicate identities, and leaves source catalogs unchanged", () => {
    const publicCatalog = catalog("public");
    const original = publicCatalog.documents[0]!;
    const replacement = {
      ...original,
      private: true,
      href: `/private${original.href}`,
    };
    const privateCatalog: Catalog = {
      version: 2,
      documents: [replacement],
      directories: [],
      taxonomy: [],
    };
    const result = mergeHomeCatalogs(publicCatalog, privateCatalog);
    expect(result.documents).toHaveLength(publicCatalog.documents.length);
    expect(result.documents.find((doc) => doc.key === original.key)).toEqual(
      replacement,
    );
    expect(publicCatalog.documents[0]?.private).toBe(false);
    expect(mergeHomeCatalogs(publicCatalog)).toBe(publicCatalog);
    expect(
      mergeHomeCatalogs(
        { version: 2, documents: [], directories: [], taxonomy: [] },
        privateCatalog,
      ).documents,
    ).toEqual([replacement]);
  });
});
