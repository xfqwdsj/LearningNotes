import { plainValue } from "@/lib/markdown/types";
import { describe, expect, it } from "vitest";
import { orderDocuments } from "@/lib/content/ordering";

const item = (title: string, path: string, order?: number) => ({
  ...(order === undefined ? {} : { order }),
  path,
  title: plainValue(title),
});

describe("content ordering", () => {
  it("uses explicit order before localized title order", () => {
    expect(
      orderDocuments(
        [
          item("安", "articles/an"),
          item("王", "articles/wang", 2),
          item("张", "articles/zhang", 1),
        ],
        "zh-CN",
      ).map(({ title }) => title.text),
    ).toEqual(["张", "王", "安"]);
  });

  it("uses the display language's natural collation for unordered items", () => {
    expect(
      orderDocuments(
        [
          item("王", "articles/wang"),
          item("第 10 章", "articles/10"),
          item("张", "articles/zhang"),
          item("第 2 章", "articles/2"),
          item("安", "articles/an"),
        ],
        "zh-CN",
      ).map(({ title }) => title.text),
    ).toEqual(["安", "第 2 章", "第 10 章", "王", "张"]);
  });

  it("uses the content path to make equal titles deterministic", () => {
    expect(
      orderDocuments(
        [item("同名文章", "articles/b"), item("同名文章", "articles/a")],
        "zh-CN",
      ).map(({ path }) => path),
    ).toEqual(["articles/a", "articles/b"]);
  });
});
