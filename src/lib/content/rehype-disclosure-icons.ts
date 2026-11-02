import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Icon } from "lucide-react";
import dynamicIconImports from "lucide-react/dynamicIconImports";
import { fromHtml } from "hast-util-from-html";
import type { Element, Root as HtmlRoot } from "hast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import {
  requireDisclosureIcon,
  type DisclosureIconName,
} from "./disclosure-icons";

const iconMarkup = new Map<DisclosureIconName, Promise<string>>();

async function iconSvg(name: DisclosureIconName): Promise<string> {
  const cached = iconMarkup.get(name);
  if (cached) return cached;
  const markup = dynamicIconImports[name]().then((module) => {
    if (!module.__iconData)
      throw new Error(`Lucide icon has no render data: ${name}`);
    return renderToStaticMarkup(
      createElement(Icon, {
        icon: module.__iconData,
        "aria-hidden": true,
      }),
    );
  });
  iconMarkup.set(name, markup);
  return markup;
}

/** Resolve Lucide disclosure icons to static SVG before HTML serialization. */
export const rehypeDisclosureIcons: Plugin<[], HtmlRoot> =
  () => async (tree) => {
    const disclosures: Element[] = [];
    visit(tree, "element", (node) => {
      if (
        node.tagName === "details" &&
        node.properties["data-disclosure-icon"] !== undefined
      )
        disclosures.push(node);
    });
    await Promise.all(
      disclosures.map(async (details) => {
        const name = requireDisclosureIcon(
          String(details.properties["data-disclosure-icon"]),
        );
        delete details.properties["data-disclosure-icon"];
        const summary = details.children.find(
          (child): child is Element =>
            child.type === "element" && child.tagName === "summary",
        );
        if (!summary)
          throw new Error(
            `Disclosure icon requires a summary: ${String(name)}`,
          );
        const fragment = fromHtml(await iconSvg(name), { fragment: true });
        const svg = fragment.children.find(
          (child): child is Element =>
            child.type === "element" && child.tagName === "svg",
        );
        if (!svg)
          throw new Error(`Unable to render Lucide icon: ${String(name)}`);
        summary.children.unshift({
          type: "element",
          tagName: "span",
          properties: {
            className: ["content-disclosure-icon-slot"],
            "data-disclosure-icon-slot": "",
          },
          children: [{ ...svg, properties: { ...svg.properties } }],
        });
      }),
    );
  };
