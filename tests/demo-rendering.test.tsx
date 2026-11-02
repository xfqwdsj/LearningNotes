import { fromHtml } from "hast-util-from-html";
import { visit } from "unist-util-visit";
import { describe, expect, it } from "vitest";
import { readdirSync } from "node:fs";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { demoRecord } from "@/demos/catalog";
import { demoIds, type DemoComponentProps } from "@/demos/types";

describe("every demo's default render", () => {
  it.each(demoIds)("renders %s without missing ICU arguments", async (id) => {
    expect(readdirSync("src/demos")).toContain(`${id}-demo.tsx`);
    const demoModule = (await import(`../src/demos/${id}-demo.tsx`)) as {
      default: ComponentType<DemoComponentProps>;
    };
    const record = demoRecord(id);
    const html = renderToStaticMarkup(
      createElement(demoModule.default, record),
    );
    expect(html).not.toContain("LNATOM");
    const tree = fromHtml(html, { fragment: true });
    const malformed: string[] = [];
    const text = (node: {
      type: string;
      value?: string;
      tagName?: string;
      properties?: { className?: unknown };
      children?: unknown[];
    }): string => {
      const classes = node.properties?.className;
      if (
        (Array.isArray(classes) && classes.includes("katex")) ||
        node.tagName === "code"
      )
        return "";
      return node.type === "text"
        ? (node.value ?? "")
        : (node.children ?? [])
            .map((child) => text(child as Parameters<typeof text>[0]))
            .join("");
    };
    visit(tree, "element", (node) => {
      const classes = node.properties.className;
      if (
        Array.isArray(classes) &&
        classes.includes("demo-range") &&
        text(node).includes("$")
      )
        malformed.push(text(node));
      if (Array.isArray(classes) && classes.includes("katex-error"))
        malformed.push(text(node));
    });
    expect(malformed).toEqual([]);
    expect(html).toContain("interactive-demo");
  });
});
