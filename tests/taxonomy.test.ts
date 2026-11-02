import { describe, expect, it } from "vitest";
import { readFixtureCatalog, readFixtureJson } from "./fixtures/generated";
import {
  buildTaxonomy,
  resolveDirectories,
  type TermSource,
} from "../scripts/taxonomy";
import {
  findTerm,
  localizedTitle,
  requireTerm,
  taxonHref,
  termText,
  termTitles,
} from "@/lib/content/taxonomy";
import {
  getListing,
  getDocumentNavigation,
  getStaticRoutes,
} from "@/lib/content/navigation";
const source = (
  subject: string,
  id?: string,
  locale = "zh-CN",
  privateContent = false,
): TermSource => {
  const contentPath = `subjects/${subject}${id ? `/${id}` : ""}/_index.mdx`;
  const sourceRoot = `/${privateContent ? "private" : "public"}/${locale}`;
  return {
    file: `${sourceRoot}/${contentPath}`,
    contentPath,
    body: "",
    private: privateContent,
    data: {
      kind: "article",
      lang: locale,
      title: `${subject}-${id ?? "subject"}-${locale}`,
    },
    term: {
      kind: id ? "course" : "subject",
      subject,
      id: id ?? subject,
      description: "A description",
      icon: "sigma",
      order: 1,
    },
  };
};
describe("content-defined subjects and courses", () => {
  it("adds arbitrary identities without a UI message map and scopes course IDs by subject", async () => {
    const terms = await buildTaxonomy([
      source("astronomy", "intro"),
      source("astronomy"),
      source("linguistics"),
      source("linguistics", "intro"),
    ]);
    expect(termText(requireTerm(terms, "astronomy", "intro")).title.text).toBe(
      "astronomy-intro-zh-CN",
    );
    expect(
      termText(requireTerm(terms, "linguistics", "intro")).title.text,
    ).toBe("linguistics-intro-zh-CN");
    expect(requireTerm(terms, "astronomy").iconSvg).toContain("<svg");
    expect(taxonHref(requireTerm(terms, "astronomy", "intro"))).toBe(
      "/subjects/astronomy/intro/",
    );
    const dirs = resolveDirectories(
      [{ path: "courses/astronomy/intro", lang: "zh-CN" }],
      terms,
    );
    expect(dirs[0]?.title.text).toBe("astronomy-intro-zh-CN");
    expect(dirs[0]?.order).toBe(1);
    expect(() =>
      resolveDirectories(
        [{ path: "courses/astronomy/intro", lang: "zh-CN", title: "Copy" }],
        terms,
      ),
    ).toThrow("subjects metadata");
    expect(() => requireTerm(terms, "unknown")).toThrow("Undefined taxonomy");
  });
  it("resolves translations deterministically and isolates public definitions", async () => {
    const original = source("astronomy");
    const translation = source("astronomy", undefined, "en");
    const privateTerm = source("astronomy", "private-course", "zh-CN", true);
    const terms = await buildTaxonomy([translation, original, privateTerm]);
    expect(termText(requireTerm(terms, "astronomy"), "en-US").title.text).toBe(
      "astronomy-subject-en",
    );
    expect(
      localizedTitle(termTitles(requireTerm(terms, "astronomy")), "fr").text,
    ).toBe(original.data.title);
    expect(
      findTerm(await buildTaxonomy([original]), "astronomy", "private-course"),
    ).toBeUndefined();
    await expect(buildTaxonomy([original, original])).rejects.toThrow(
      "Duplicate taxonomy",
    );
    await expect(buildTaxonomy([translation])).rejects.toThrow(
      "default taxonomy",
    );
    await expect(buildTaxonomy([source("unknown", "intro")])).rejects.toThrow(
      "Undefined taxonomy",
    );
    await expect(
      buildTaxonomy([
        {
          ...original,
          term: { ...original.term, icon: "not-a-real-lucide-icon" },
        },
      ]),
    ).rejects.toThrow("Unknown Lucide icon");
    await expect(
      buildTaxonomy([
        original,
        { ...translation, term: { ...translation.term, icon: "cpu" } },
      ]),
    ).rejects.toThrow("icon differs");
  });
  it("provides dedicated reading entries while keeping article breadcrumbs on real collection paths", () => {
    const catalog = readFixtureCatalog("vitest", "public");
    const course = getListing(catalog, "subjects/maths/higher-mathematics");
    expect(course?.intro?.html).toContain("示例课程介绍");
    expect(course?.cards.map((card) => card.href)).toContain(
      "/courses/maths/higher-mathematics/",
    );
    expect(
      getListing(catalog, "subjects/maths")?.cards.map((card) => card.href),
    ).toContain("/subjects/maths/higher-mathematics/");
    const doc = catalog.documents.find(
      (doc) => doc.course === "higher-mathematics",
    )!;
    expect(
      getDocumentNavigation(doc, catalog).crumbs.map((crumb) => crumb.href),
    ).toContain("/courses/maths/higher-mathematics/");
    expect(getStaticRoutes(catalog)).toContain(
      "subjects/maths/higher-mathematics",
    );
    expect(getStaticRoutes(catalog)).toContain("courses/maths");
    const index = readFixtureJson<{
      terms: {
        subject: string;
        labels: Record<string, { title: string; html?: string }>;
      }[];
    }>("vitest", "public/assets/taxonomy.json");
    expect(index.terms.some((term) => term.subject === "english")).toBe(true);
    expect(
      index.terms.every((term) =>
        Object.values(term.labels).every((label) => label.html === undefined),
      ),
    ).toBe(true);
  });
});
