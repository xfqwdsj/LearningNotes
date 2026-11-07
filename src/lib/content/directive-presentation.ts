import {
  normalizeSingleLine,
  renderMarkdownSource,
} from "@/lib/markdown/render";
import { renderIcuMarkdownFragment } from "@/lib/markdown/icu";
import type { Properties } from "hast";
import type { PhrasingContent, Root, RootContent } from "mdast";
import type {
  ContainerDirective,
  LeafDirective,
  TextDirective,
} from "mdast-util-directive";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import { z } from "zod";
import type { ImageRegionData } from "./learning-types";
import { stringifyContent } from "./syntax";
import { createUiTranslator } from "@/i18n/translate";
import { demoCatalog, type DemoName } from "@/demos/catalog";
import { alertTypes, type AlertType } from "./github-alerts";
import {
  presentationNames,
  presentationTitle,
  proofTitleChildren,
} from "./presentation-blocks";
import { requireDisclosureIcon } from "./disclosure-icons";
import { defaultLocale } from "@/i18n/config";
import { formatBlankReference } from "./blank-presentation";
const t = createUiTranslator();
/** The localized source sentence wraps a Markdown title without allowing a nested link. */
export function sourceHintChildren(title: string): PhrasingContent[] {
  const fragment = renderIcuMarkdownFragment(
    String(t.raw("export.sourceTitle")),
    { title },
    { locale: defaultLocale, mode: "single-line", linkPolicy: "plain" },
  );
  const first = normalizeSingleLine(fragment.tree, {
    linkPolicy: "plain",
  }).children[0];
  return first?.type === "paragraph"
    ? first.children
    : [{ type: "text", value: fragment.markdown }];
}
export type Directive = ContainerDirective | LeafDirective | TextDirective;
export const isDirective = (node: RootContent): node is Directive =>
  node.type === "containerDirective" ||
  node.type === "leafDirective" ||
  node.type === "textDirective";
export function requirePageNumber(node: Directive): string {
  const number = node.attributes?.["number"]?.trim();
  if (!number) throw new Error("Page marker requires a page number");
  return number;
}
const rect = z
  .object({
    src: z
      .url()
      .refine(
        (value) => ["http:", "https:"].includes(new URL(value).protocol),
        "Image sources must use HTTP or HTTPS",
      ),
    alt: z.string(),
    x: z.coerce.number().min(0).max(100),
    y: z.coerce.number().min(0).max(100),
    width: z.coerce.number().positive().max(100),
    height: z.coerce.number().positive().max(100),
    displayWidth: z.string().regex(/^(?:\d+(?:\.\d+)?(?:rem|px|%)|auto)$/),
  })
  .refine(
    (r) => r.x + r.width <= 100 && r.y + r.height <= 100,
    "Crop rectangle exceeds source image",
  );
export function imageRegion(
  node: Directive,
  definitions: Map<string, string>,
): ImageRegionData {
  const a = node.attributes ?? {};
  const src = a["image"]
    ? definitions.get(a["image"].toLowerCase())
    : undefined;
  if (!src) throw new Error(`Missing image reference: ${a["image"]}`);
  return rect.parse({
    src,
    alt: renderMarkdownSource(a["alt"] ?? "").text,
    x: a["x"] ?? 0,
    y: a["y"] ?? 0,
    width: a["width"] ?? 100,
    height: a["height"] ?? 100,
    displayWidth: a["display-width"] ?? "100%",
  });
}
export const remarkDirectivePresentation: Plugin<[], Root> = () => (tree) => {
  const definitions = new Map<string, string>();
  visit(tree, "definition", (node) => {
    definitions.set(node.identifier.toLowerCase(), node.url);
  });
  const transform = (nodes: RootContent[]): RootContent[] =>
    nodes.flatMap((node) => {
      if (!isDirective(node)) {
        if ("children" in node)
          node.children = transform(
            node.children as RootContent[],
          ) as typeof node.children;
        return [node];
      }
      if (
        node.type === "textDirective" &&
        !["option", "blank", "choice-slot", ...presentationNames].includes(
          node.name,
        )
      ) {
        const value = stringifyContent({
          type: "root",
          children: [{ type: "paragraph", children: [node] }],
        }).trim();
        return [{ type: "text", value }];
      }
      const a = node.attributes ?? {};
      let tag = "div";
      const properties: Properties = {};
      let children = node.children as RootContent[];
      switch (node.name) {
        case "example":
        case "proof":
        case "disclosure":
        case "steps": {
          const title = presentationTitle(node);
          tag = ["proof", "disclosure"].includes(node.name)
            ? "details"
            : node.name === "example"
              ? "section"
              : "div";
          properties.className = [`mdx-${node.name}`];
          if (node.name === "disclosure")
            properties["data-disclosure-icon"] = requireDisclosureIcon(
              a["icon"],
            );
          if (node.name === "steps") {
            const list = children[0];
            if (list?.type === "list") {
              list.spread = true;
              list.data = {
                ...list.data,
                hProperties: { ...list.data?.hProperties, role: "list" },
              };
              list.children.forEach((item) => {
                item.spread = true;
                item.children.unshift({
                  type: "paragraph",
                  data: {
                    hName: "span",
                    hProperties: {
                      className: ["step-number"],
                      ariaHidden: "true",
                    },
                  },
                  children: [],
                });
              });
            }
          }
          if (node.name === "proof") {
            children = [
              {
                type: "paragraph",
                data: {
                  hName: "summary",
                  hProperties: {
                    className: ["presentation-block-title"],
                  },
                },
                children: proofTitleChildren(title),
              },
              ...children,
            ];
          } else if (title) {
            title.data = {
              hName: node.name === "disclosure" ? "summary" : "p",
              hProperties: {
                className: ["presentation-block-title"],
                ...(!a["title"]?.trim() ? { lang: defaultLocale } : {}),
              },
            };
            children = [title, ...children];
          }
          break;
        }
        case "section":
        case "correct":
          return [];
        case "alert": {
          const type = alertTypes.includes(a["type"] as AlertType)
            ? (a["type"] as AlertType)
            : "note";
          const labels = {
            note: "alerts.note",
            tip: "alerts.tip",
            important: "alerts.important",
            warning: "alerts.warning",
            caution: "alerts.caution",
          } as const;
          tag = "aside";
          properties.className = ["mdx-alert", `mdx-alert-${type}`];
          properties["data-alert"] = type;
          children = [
            {
              type: "paragraph",
              data: {
                hName: "p",
                hProperties: { className: ["mdx-alert-title"] },
              },
              children: [{ type: "text", value: t(labels[type]) }],
            },
            ...children,
          ];
          break;
        }
        case "semantic":
          tag = "section";
          properties.className = ["semantic-section"];
          properties["data-slot"] = a["slot"];
          properties["data-owner"] = a["owner"];
          break;
        case "inclusion":
          tag = "section";
          properties.className = ["content-inclusion"];
          properties.id = a["id"] ?? undefined;
          properties.lang = a["lang"] ?? undefined;
          properties["data-source"] = a["source"];
          break;
        case "problems":
          tag = "section";
          properties["data-learning-problem-set"] = a["id"];
          break;
        case "default-questions":
          tag = "section";
          properties["data-learning-default-questions"] = a["id"];
          break;
        case "question":
        case "part":
          return [];
        case "demo": {
          if (!a["name"] || !(a["name"] in demoCatalog))
            throw new Error(`Unknown demo: ${a["name"]}`);
          properties["data-learning-demo"] = a["name"];
          break;
        }
        case "page": {
          const page = requirePageNumber(node);
          tag = "span";
          properties.className = ["source-page"];
          children = [
            {
              type: "text",
              value: t("learning.page", { page }),
            },
          ];
          break;
        }
        case "image-region":
          tag = "figure";
          properties["data-learning-image-region"] = JSON.stringify(
            imageRegion(node, definitions),
          );
          break;
        case "work":
          tag = "section";
          properties.className = ["authored-work"];
          properties["data-answer-for"] = a["for"];
          properties.id = a["id"] ?? undefined;
          break;
        case "reference":
          tag = "details";
          properties.className = ["reference-answer"];
          properties.id = a["id"] ?? undefined;
          break;
        case "choices":
          tag = "div";
          properties.className = ["question-choices"];
          break;
        case "option":
          tag = "span";
          properties.className = ["question-option-label"];
          break;
        case "blank":
          tag = "span";
          properties.className = ["question-blank-placeholder"];
          properties["data-learning-blank"] = a["id"];
          children = [
            {
              type: "text",
              value: formatBlankReference(
                t("learning.blankPlaceholder"),
                a["id"] ?? "",
                a["placeholder"],
                {
                  withHint: (values) =>
                    t("learning.blankWithIdAndHint", values),
                  withoutHint: (values) => t("learning.blankWithId", values),
                },
              ),
            },
          ];
          break;
        case "choice-slot":
          tag = "span";
          properties.className = ["question-choice-slot"];
          properties.role = "img";
          properties["aria-label"] = t("learning.choiceSlot");
          properties["data-learning-choice-slot"] = "true";
          children = [];
          break;
        default:
          throw new Error(`Unknown content directive: ${node.name}`);
      }
      if (node.name !== "image-region") children = transform(children);
      if (node.name === "reference")
        children.unshift({
          type: "paragraph",
          data: { hName: "summary" },
          children: [{ type: "text", value: t("learning.reference") }],
        });
      if (node.name === "inclusion" && a["source"])
        children.push({
          type: "paragraph",
          data: { hProperties: { className: ["inclusion-source"] } },
          children: [
            {
              type: "link",
              url: a["source"],
              children: sourceHintChildren(a["title"] ?? ""),
            },
          ],
        });
      if (node.name === "demo") {
        const demo = demoCatalog[a["name"] as DemoName];
        if (!demo) throw new Error("Missing demo");
      }
      return [
        {
          ...node,
          children,
          data: { ...node.data, hName: tag, hProperties: properties },
        } as RootContent,
      ];
    });
  tree.children = transform(tree.children);
};
