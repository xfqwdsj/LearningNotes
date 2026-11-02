import { describe, expect, it } from "vitest";
import { parseFrontMatter } from "@/lib/content/front-matter";

describe("YAML content metadata", () => {
  it("preserves metadata and the exact body, including BOM and CRLF input", () => {
    const result = parseFrontMatter(
      "\uFEFF---\r\ntitle: Example\r\ntags: [one, two]\r\n---\r\n\r\nBody $x^2$.\r\n",
    );
    expect(result.data).toEqual({ title: "Example", tags: ["one", "two"] });
    expect(result.content).toBe("\r\nBody $x^2$.\r\n");
    expect(parseFrontMatter("Body without metadata").content).toBe(
      "Body without metadata",
    );
  });
  it("rejects executable engines, duplicate keys, custom tags and malformed metadata", () => {
    for (const source of [
      '---js\n({title: "do not execute"})\n---\nBody',
      "---\ntitle: One\ntitle: Two\n---\nBody",
      "---\ntitle: !custom Example\n---\nBody",
      "---\n- one\n- two\n---\nBody",
      "---\ntitle: Incomplete\n",
    ])
      expect(() => parseFrontMatter(source)).toThrow();
  });
});
