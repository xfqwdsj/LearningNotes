import { plainValue, plainText } from "@/lib/markdown/types";
import { relatedBrowseLinks, contentCollections } from "@/lib/content/browse";
import { describe, it, expect } from "vitest";
import { readFixtureCatalog } from "./fixtures/generated";
import {
  getDocumentNavigation,
  getListing,
  getStaticRoutes,
} from "@/lib/content/navigation";
const catalog = readFixtureCatalog("vitest", "public");
describe("hierarchical browsing", () => {
  it("localizes an empty knowledge root without a physical directory entry", () => {
    const listing = getListing(
      { ...catalog, documents: [], directories: [] },
      "knowledge",
    );
    expect(plainText(listing!.title)).toBe("知识点");
    expect(listing?.crumbs.at(-1)).toEqual({
      label: plainValue("知识点"),
      href: "/knowledge/",
    });
  });
  it("uses explicit root metadata consistently for page titles and breadcrumbs", () => {
    for (const path of ["courses", "knowledge", "tasks", "articles"]) {
      const listing = getListing(
        {
          ...catalog,
          documents: [],
          directories: [
            {
              path,
              title: plainValue("Custom root"),
              description: plainValue("Custom description"),
            },
          ],
        },
        path,
      );
      expect(plainText(listing!.title)).toBe("Custom root");
      expect(listing?.crumbs.at(-1)?.label).toBe(listing?.title);
      expect(plainText(listing!.description)).toBe("Custom description");
    }
  });
  it("shows subjects before courses and courses before chapters", () => {
    const root = getListing(catalog, "courses");
    expect(root?.documents).toHaveLength(0);
    expect(root?.cards.map((card) => card.href)).toContain("/courses/maths/");
    const subject = getListing(catalog, "courses/maths");
    expect(subject?.parent.href).toBe("/courses/");
    expect(subject?.cards[0]?.href).toBe("/courses/maths/higher-mathematics/");
    expect(subject?.cards.map((card) => card.href)).not.toContain(
      "/courses/maths/supplement/",
    );
    const course = getListing(catalog, "courses/maths/higher-mathematics");
    expect(course?.parent.href).toBe("/courses/maths/");
    expect(course?.documents.length).toBeGreaterThan(0);
  });
  it("orders unordered articles by display language while preserving explicit order", () => {
    const article = catalog.documents.find((doc) => doc.kind === "article");
    if (!article) throw new Error("Missing article");
    const articleWithoutOrder = structuredClone(article);
    delete articleWithoutOrder.order;
    const makeArticle = (
      key: string,
      title: string,
      path: string,
      order?: number,
    ) => ({
      ...articleWithoutOrder,
      key,
      title: plainValue(title),
      path,
      href: `/${path}/`,
      ...(order === undefined ? {} : { order }),
    });
    const documents = [
      makeArticle("wang", "王", "articles/wang"),
      makeArticle("ten", "第 10 章", "articles/ten"),
      makeArticle("zhang", "张", "articles/zhang", 1),
      makeArticle("two", "第 2 章", "articles/two"),
      makeArticle("an", "安", "articles/an"),
    ];
    const articleCatalog = { ...catalog, documents };
    const expected = ["张", "安", "第 2 章", "第 10 章", "王"];
    expect(
      getListing(articleCatalog, "articles")?.documents.map(
        ({ title }) => title.text,
      ),
    ).toEqual(expected);
    expect(
      getDocumentNavigation(documents[0]!, articleCatalog).siblings.map(
        ({ title }) => title.text,
      ),
    ).toEqual(expected);
  });
  it("returns readers to their own collection without mixing content kinds", () => {
    const note = catalog.documents.find(
      (doc) => doc.path === "courses/maths/higher-mathematics/11.1",
    );
    if (!note) throw new Error("Missing note");
    expect(getDocumentNavigation(note, catalog).parent.href).toBe(
      "/courses/maths/higher-mathematics/",
    );
    const article = catalog.documents.find((doc) => doc.kind === "article");
    if (!article) throw new Error("Missing article");
    const navigation = getDocumentNavigation(article, catalog);
    expect(navigation.parent.href).toBe("/articles/");
    expect(navigation.siblings.every((doc) => doc.kind === "article")).toBe(
      true,
    );
  });
  it("exports intermediate hierarchy routes and complete mathematical summaries", () => {
    expect(getStaticRoutes(catalog)).toContain("courses/maths");
    const math = catalog.documents.find(
      (doc) => doc.path === "courses/maths/higher-mathematics/5.4",
    );
    expect(math?.description.html).toContain("katex");
  });
});

describe("parallel browsing views", () => {
  it("keeps four direct content entries and separates subject reading from real parents", () => {
    expect(contentCollections.map((item) => item.href)).toEqual([
      "/courses/",
      "/knowledge/",
      "/tasks/",
      "/articles/",
    ]);
    const subject = getListing(catalog, "subjects/maths")!;
    expect(subject.cardGroups?.map((group) => group.title)).toEqual([
      "内容入口",
      "课程概览",
    ]);
    expect(subject.cardGroups?.[0]?.cards.map((card) => card.href)).toContain(
      "/courses/maths/",
    );
    expect(subject.cardGroups?.[1]?.cards.map((card) => card.href)).toContain(
      "/subjects/maths/higher-mathematics/",
    );
    expect(
      getListing(catalog, "courses/maths/higher-mathematics")?.parent.href,
    ).toBe("/courses/maths/");
    expect(
      relatedBrowseLinks(catalog, "courses/maths").map((link) => link.href),
    ).toEqual(["/subjects/maths/"]);
    expect(
      relatedBrowseLinks(catalog, "courses/maths/higher-mathematics/1.5").map(
        (link) => link.href,
      ),
    ).toEqual(["/subjects/maths/", "/subjects/maths/higher-mathematics/"]);
    expect(
      relatedBrowseLinks(
        catalog,
        "knowledge/maths/multivariable-calculus/implicit-function-theorem",
      ).map((link) => link.href),
    ).toEqual(["/subjects/maths/"]);
    expect(
      relatedBrowseLinks(catalog, "courses").map((link) => link.href),
    ).toEqual(["/subjects/"]);
  });
});
