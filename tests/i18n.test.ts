import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import ts from "typescript";
import { locales, resolveUiLocale } from "@/i18n/config";
import { createUiFormatter, createUiTranslator } from "@/i18n/translate";

describe("localization resources", () => {
  it("ships Chinese only and falls back without fabricating translations", () => {
    expect(locales).toEqual(["zh-CN"]);
    expect(resolveUiLocale("en")).toBe("zh-CN");
    expect(createUiTranslator("en")("common.home")).toBe("首页");
  });
  it("formats complete messages and dates with the configured locale", () => {
    const t = createUiTranslator();
    expect(t("common.readingCount", { count: 1234 })).toBe("1,234篇");
    expect(t("navigation.backTo", { title: "数学" })).toBe("返回数学");
    expect(
      t("discussion.prompt", {
        title: "连续性",
        links: "LINK\n",
        source: "BODY",
      }),
    ).toContain("LINK\nBODY");
    expect(
      createUiFormatter().dateTime(new Date("2026-10-28T23:00:00Z"), {
        dateStyle: "medium",
      }),
    ).toBe("2026年10月29日");
    expect(t("demoUi.refresh")).toBe("换一个演示");
  });
  it("keeps Chinese UI literals in the catalog rather than source components", () => {
    const violations: string[] = [];
    for (const file of readdirSync("src", {
      recursive: true,
      encoding: "utf8",
    }).filter((entry) => /\.tsx?$/.test(entry))) {
      const source = ts.createSourceFile(
        file,
        readFileSync(path.join("src", file), "utf8"),
        ts.ScriptTarget.Latest,
        true,
        file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
      );
      const visit = (node: ts.Node) => {
        if (
          (ts.isStringLiteralLike(node) ||
            ts.isJsxText(node) ||
            ts.isTemplateExpression(node)) &&
          /\p{Script=Han}/u.test(node.getText(source))
        )
          violations.push(
            `${file}:${source.getLineAndCharacterOfPosition(node.getStart()).line + 1}`,
          );
        ts.forEachChild(node, visit);
      };
      visit(source);
    }
    expect(violations).toEqual([]);
  });
});
