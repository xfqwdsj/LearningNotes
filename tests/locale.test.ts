import { it, expect } from "vitest";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { prepare } from "../scripts/prepare";
import {
  getListing,
  getDocumentNavigation,
  getStaticRoutes,
} from "@/lib/content/navigation";
import {
  preferredDocuments,
  documentTranslations,
} from "@/lib/content/localization";
import type { Catalog } from "@/lib/content/types";
it("builds linked language variants with stable slugs", async () => {
  const temp = mkdtempSync(path.join(tmpdir(), "learning-locale-"));
  try {
    for (const folder of [
      "content",
      "content/knowledge",
      "content/knowledge/maths",
      "content/en",
      "content/en/knowledge",
      "content/en/knowledge/maths",
      "content/courses",
      "content/courses/maths",
      "content/courses/maths/calculus",
      "content/en/courses",
      "content/en/courses/maths",
      "content/en/courses/maths/calculus",
      "content/tasks",
      "content/tasks/maths",
      "content/tasks/maths/calculus",
      "content/tasks/maths/calculus/exercise",
      "content/en/tasks",
      "content/en/tasks/maths",
      "content/en/tasks/maths/calculus",
      "content/en/tasks/maths/calculus/exercise",
      "content/articles",
      "content/en/articles",
      "content/courses/cs",
      "content/courses/cs/basis",
    ]) {
      mkdirSync(path.join(temp, folder), { recursive: true });
      writeFileSync(
        path.join(temp, folder, "_index.mdx"),
        "---\ntitle: Index\ndescription: Test classification\n---\n",
      );
    }
    for (const [relative, title] of [
      ["subjects/maths", "数学"],
      ["subjects/maths/calculus", "微积分"],
      ["subjects/cs", "计算机科学"],
      ["subjects/cs/basis", "基础"],
      ["subjects/general", "通识"],
      ["en/subjects/maths", "Mathematics"],
      ["en/subjects/maths/calculus", "Calculus"],
    ]) {
      const directory = path.join(temp, "content", relative!);
      mkdirSync(directory, { recursive: true });
      writeFileSync(
        path.join(directory, "_index.mdx"),
        `---\ntitle: ${title}\ndescription: Test classification\n---\n`,
      );
    }
    for (const relative of [
      "courses/maths",
      "courses/maths/calculus",
      "courses/cs",
      "courses/cs/basis",
      "tasks/maths",
      "tasks/maths/calculus",
      "knowledge/maths",
      "en/courses/maths",
      "en/courses/maths/calculus",
      "en/tasks/maths",
      "en/tasks/maths/calculus",
      "en/knowledge/maths",
    ])
      writeFileSync(
        path.join(temp, "content", relative, "_index.mdx"),
        "---\n{}\n---\n",
      );
    writeFileSync(
      path.join(temp, "content/knowledge/maths/continuity.mdx"),
      "---\ntitle: 连续性\n---\n\n## 定义\n\n连续性定义。\n",
    );
    writeFileSync(
      path.join(temp, "content/en/knowledge/maths/continuity.mdx"),
      "---\ntitle: Continuity $f(x)$\n---\n\n## Definition $x^2$\n\nA definition.\n",
    );
    for (const relative of [
      "courses/maths/calculus/introduction",
      "tasks/maths/calculus/exercise/01",
      "articles/study",
    ])
      for (const locale of ["", "en/"])
        writeFileSync(
          path.join(temp, `content/${locale}${relative}.mdx`),
          `---\ntitle: ${locale ? "Translation" : "原文"}\n---\n\nA body.\n`,
        );
    writeFileSync(
      path.join(temp, "content/courses/cs/basis/start.mdx"),
      "---\ntitle: 只有中文\n---\n正文。\n",
    );
    await prepare({
      outputDirectory: path.join(temp, ".generated"),
      publicContentDirectory: path.join(temp, "content"),
      privateContentDirectory: path.join(temp, "private/content"),
    });
    const catalog = JSON.parse(
      readFileSync(path.join(temp, ".generated/public/catalog.json"), "utf8"),
    ) as Catalog;
    expect(catalog.documents).toHaveLength(9);
    expect(new Set(catalog.documents.map((doc) => doc.key)).size).toBe(9);
    for (const doc of catalog.documents.filter((doc) => doc.lang === "en")) {
      expect(documentTranslations(doc, catalog)).toHaveLength(2);
      expect(doc.path).not.toMatch(/^en\//);
      expect(getDocumentNavigation(doc, catalog).parent.href).toMatch(
        /^\/en\//,
      );
    }
    expect(preferredDocuments(catalog)).toHaveLength(5);
    expect(
      preferredDocuments(catalog, "en-US").filter((doc) => doc.lang === "en"),
    ).toHaveLength(4);
    expect(getListing(catalog, "en/courses/cs/basis")?.documents[0]?.href).toBe(
      "/courses/cs/basis/start/",
    );
    expect(getStaticRoutes(catalog)).toContain("en/courses/cs/basis");
    expect(
      getListing(catalog, "en/tasks/maths/calculus/exercise")?.documents[0]
        ?.href,
    ).toBe("/en/tasks/maths/calculus/exercise/01/");
    const search = JSON.parse(
      readFileSync(
        path.join(temp, ".generated/public/assets/search.json"),
        "utf8",
      ),
    ) as { lang: string }[];
    expect(search.some((doc) => doc.lang === "en")).toBe(true);
    const english = catalog.documents.find(
      (doc) => doc.lang === "en" && doc.kind === "knowledge",
    );
    expect(english?.title.html).toContain('class="katex"');
    expect(english?.sections[0]?.title.html).toContain('class="katex"');
    expect(catalog.documents.map((doc) => doc.href)).toEqual(
      expect.arrayContaining([
        "/knowledge/maths/continuity/",
        "/en/knowledge/maths/continuity/",
      ]),
    );
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});
