import { describe, it, expect } from "vitest";
import { readFixtureCatalog } from "./fixtures/generated";
import { contentFallbacks, selectTranslation } from "@/i18n/content";
import { prepareDemoDefinition } from "@/demos/definition";
import { demoCatalog, demoRecord } from "@/demos/catalog";
import { demoResources, isDemoIndex } from "@/demos/types";
import { demoAssets } from "../scripts/demo-assets";
import { createContentFormatter } from "@/i18n/format";
import { renderIcuMarkdown } from "@/lib/markdown/icu";
const source = {
  subject: "maths",
  locales: {
    "zh-CN": {
      title: "中文 $x$",
      description: "中文描述",
      tags: ["$t$ 分布"],
      messages: { value: "中文 {value}" },
    },
    en: {
      title: "English $x$",
      description: "English description",
      tags: ["$t$ distribution"],
      messages: { value: "English {value}" },
    },
  },
};
describe("build-time and runtime localization contract", () => {
  it("uses canonical exact, base language, then the required default", () => {
    expect(contentFallbacks("en-us")).toEqual(["en-US", "en", "zh-CN"]);
    expect(
      selectTranslation(
        { "zh-CN": "中文", en: "English", "en-US": "US" },
        "en-us",
      ),
    ).toEqual({ locale: "en-US", value: "US" });
    expect(
      selectTranslation({ "zh-CN": "中文", en: "English" }, "en-GB").value,
    ).toBe("English");
    expect(
      selectTranslation({ "zh-CN": "中文", en: "English" }, "fr").value,
    ).toBe("中文");
    expect(() => selectTranslation({ en: "English" }, "en")).toThrow(/default/);
  });
  it("compiles translated tags and validates message keys and ICU arguments", () => {
    const prepared = prepareDemoDefinition(source);
    expect(prepared.translations["en"]?.tags[0]?.html).toContain(
      'class="katex"',
    );
    expect(() =>
      prepareDemoDefinition({ ...source, locales: { en: source.locales.en } }),
    ).toThrow(/default/);
    expect(() =>
      prepareDemoDefinition({
        ...source,
        locales: {
          ...source.locales,
          en: { ...source.locales.en, messages: { other: "wrong" } },
        },
      }),
    ).toThrow(/keys/);
    expect(() =>
      prepareDemoDefinition({
        ...source,
        locales: {
          ...source.locales,
          en: { ...source.locales.en, messages: { value: "{wrong}" } },
        },
      }),
    ).toThrow(/arguments/);
  });
  it("generates already localized catalogs, subject titles and matching details per language", () => {
    const catalog = readFixtureCatalog("vitest", "public");
    const term = catalog.taxonomy.find(
      (term) => term.kind === "subject" && term.id === "maths",
    )!;
    term.labels["en"] = {
      ...term.labels["zh-CN"]!,
      title: {
        markdown: "Mathematics",
        text: "Mathematics",
        html: "Mathematics",
      },
    };
    const translations = demoCatalog.normal.translations;
    translations["en"] = prepareDemoDefinition(source).translations["en"]!;
    try {
      const english = demoAssets(
        catalog.documents,
        "",
        catalog.taxonomy,
        "en-GB",
      );
      const entry = english.catalog.entries.find(
        (entry) => entry.id === "normal",
      )!;
      const detail = english.records.find((record) => record.id === "normal")!;
      expect(entry.title.text).toBe("English x");
      expect(entry.subjectTitle.text).toBe("Mathematics");
      expect(entry.tags[0]?.html).toContain("katex");
      expect(detail.title).toEqual(entry.title);
      expect(detail.locale).toBe("en");
      expect(detail.messages).toEqual(source.locales.en.messages);
      expect(isDemoIndex(english.catalog, "")).toBe(true);
      const chinese = demoAssets(catalog.documents, "", catalog.taxonomy);
      const manifest = {
        ...chinese.manifest,
        locales: { ...chinese.manifest.locales, ...english.manifest.locales },
      };
      expect(demoResources(manifest, "en-GB")).toBe(
        english.manifest.locales["en-GB"],
      );
      expect(demoResources(manifest, "fr")).toBe(
        chinese.manifest.locales["zh-CN"],
      );
      expect(demoRecord("normal", [], undefined, "en-US").title.text).toBe(
        "English x",
      );
    } finally {
      delete translations["en"];
    }
  });
  it("prepares article summaries with mathematical symbols as formulas", () => {
    const catalog = readFixtureCatalog("vitest", "public");
    for (const path of [
      "knowledge/maths/integrals/gamma-function",
      "knowledge/maths/statistics/f-distribution",
      "knowledge/maths/statistics/t-distribution",
      "knowledge/maths/statistics/p-value",
      "knowledge/maths/statistics/variance-ratio-confidence-interval",
    ]) {
      const doc = catalog.documents.find((doc) => doc.path === path)!;
      expect(doc.description.markdown).toContain("$");
      expect(doc.description.html).toContain('class="katex"');
    }
  });
  it("uses the same configured time zone for runtime ICU and formatter dates", () => {
    const value = new Date("2026-10-28T23:00:00Z");
    expect(
      renderIcuMarkdown(
        "{value, date, ::yyyyMMdd}",
        { value },
        { locale: "en" },
      ).text,
    ).toContain("29");
    expect(
      createContentFormatter("en").dateTime(value, { day: "numeric" }),
    ).toBe("29");
  });
});
