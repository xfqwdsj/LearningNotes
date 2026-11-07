import { captionSettings } from "./image-captions";
import type { Blockquote, Root, RootContent, Text } from "mdast";
import { toString } from "mdast-util-to-string";
import {
  isDirective,
  imageRegion,
  sourceHintChildren,
} from "./directive-presentation";
import { attachProblemSets } from "./problem-sets";
import {
  presentationNames,
  presentationTitle,
  proofTitleChildren,
} from "./presentation-blocks";
import { stringifyContent, parseContent } from "./syntax";
import { createUiTranslator } from "@/i18n/translate";
import { demoCatalog, type DemoName } from "@/demos/catalog";
import type { MarkdownFragment } from "@/lib/markdown/types";
import { formatBlankReference } from "./blank-presentation";
declare module "mdast" {
  interface Data {
    markdownLiteral?: string;
  }
}
const t = createUiTranslator();
const paragraph = (value: string): RootContent => ({
  type: "paragraph",
  children: [{ type: "text", value }],
});
const githubAlertMarker =
  /^(\[!(?:NOTE|TIP|IMPORTANT|WARNING|CAUTION)])(?=\s|$)/i;
const markdownLiteral = (value: string, markdown = value): Text => ({
  type: "text",
  value,
  data: { markdownLiteral: markdown },
});
function tagGithubAlert(blockquote: Blockquote) {
  const first = blockquote.children[0];
  if (first?.type !== "paragraph") return;
  const text = first.children[0];
  if (text?.type !== "text") return;
  const match = githubAlertMarker.exec(text.value);
  if (!match) return;
  const marker = match[1]!;
  const rest = text.value.slice(marker.length);
  blockquote.children[0] = {
    ...first,
    children: [
      markdownLiteral(marker),
      ...(rest ? [{ ...text, value: rest }] : []),
      ...first.children.slice(1),
    ],
  };
}
export function exportContent(tree: Root): Root {
  tree = attachProblemSets(structuredClone(tree));
  const definitions = new Map<string, string>();
  function definitionsIn(node: Root | RootContent) {
    if (node.type === "definition")
      definitions.set(node.identifier.toLowerCase(), node.url);
    if ("children" in node)
      node.children.forEach((child) => definitionsIn(child as RootContent));
  }
  definitionsIn(tree);
  function convert(nodes: RootContent[]): RootContent[] {
    const keyOutput = new Map<RootContent, RootContent[]>();
    for (let index = 0; index < nodes.length; index++) {
      const first = nodes[index]!;
      if (!isDirective(first) || first.name !== "correct") continue;
      const answers = new Map<string, string[]>();
      // Merge consecutive declarations only: explanatory paragraphs retain their order.
      while (index < nodes.length) {
        const node = nodes[index]!;
        if (!isDirective(node) || node.name !== "correct") break;
        const a = node.attributes ?? {};
        const input = a["blank"] ?? a["input"] ?? "";
        const values = answers.get(input) ?? [];
        const value = a["option"]?.toUpperCase() ?? a["value"] ?? "";
        if (!values.includes(value)) values.push(value);
        answers.set(input, values);
        keyOutput.set(node, []);
        index++;
      }
      index--;
      keyOutput.set(
        first,
        [...answers].map(([input, values]) =>
          paragraph(
            t("learning.correctExport", {
              answer: `${input && answers.size > 1 ? `${input}: ` : ""}${values.join(t("learning.answerSeparator"))}`,
            }),
          ),
        ),
      );
    }
    return nodes.flatMap((node) => {
      if (node.type === "mdxjsEsm" || node.type === "definition") return [];
      if (node.type === "imageReference" || node.type === "linkReference") {
        const url = definitions.get(node.identifier.toLowerCase());
        if (!url)
          throw new Error(`Missing Markdown reference: ${node.identifier}`);
        return node.type === "imageReference"
          ? [{ type: "image", url, alt: node.alt ?? "", title: null }]
          : [
              {
                type: "link",
                url,
                children: convert(node.children) as typeof node.children,
              },
            ];
      }
      if (
        node.type === "mdxFlowExpression" ||
        node.type === "mdxTextExpression"
      ) {
        const marker = /^\/\*\s*(summary|more)\s*\*\/$/.exec(
          node.value.trim(),
        )?.[1];
        return marker ? [{ type: "html", value: `<!-- ${marker} -->` }] : [];
      }
      if (
        node.type === "mdxJsxFlowElement" ||
        node.type === "mdxJsxTextElement"
      ) {
        const title = node.attributes["find"](
          (a) => a["type"] === "mdxJsxAttribute" && a["name"] === "title",
        );
        const label =
          title && "value" in title && typeof title.value === "string"
            ? title.value
            : node.name;
        return [
          ...(label ? [paragraph(label)] : []),
          ...convert(node.children as RootContent[]),
        ];
      }
      if (isDirective(node)) {
        if (
          node.type === "textDirective" &&
          !["option", "blank", "choice-slot", ...presentationNames].includes(
            node.name,
          )
        )
          return [
            {
              type: "text",
              value: stringifyContent({
                type: "root",
                children: [{ type: "paragraph", children: [node] }],
              }).trim(),
            },
          ];
        const a = node.attributes ?? {};
        switch (node.name) {
          case "example":
          case "disclosure": {
            const title = presentationTitle(node);
            return [
              ...(title
                ? [
                    {
                      ...title,
                      children:
                        node.name === "example"
                          ? [
                              {
                                type: "strong" as const,
                                children: title.children,
                              },
                            ]
                          : title.children,
                    },
                  ]
                : []),
              ...convert(node.children as RootContent[]),
            ];
          }
          case "proof": {
            const title = presentationTitle(node);
            return [
              {
                type: "paragraph" as const,
                children: proofTitleChildren(title),
              },
              ...convert(node.children as RootContent[]),
            ];
          }
          case "steps":
            presentationTitle(node);
            return convert(node.children as RootContent[]);
          case "section":
            return [];
          case "question":
          case "part":
            return a["number"]
              ? [
                  paragraph(
                    t("learning.originalNumber", { number: a["number"] }),
                  ),
                ]
              : [];
          case "blank":
            return [
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
          case "choice-slot": {
            const placeholder = t("learning.blankPlaceholder");
            return [
              markdownLiteral(placeholder, placeholder.replaceAll("_", "\\_")),
            ];
          }
          case "option":
            return [
              ...(node.children.length
                ? convert(node.children as RootContent[])
                : [{ type: "text" as const, value: a["id"] ?? "" }]),
              { type: "text", value: ". " },
            ];
          case "correct":
            return keyOutput.get(node) ?? [];
          case "page":
            return [paragraph(t("learning.page", { page: a["number"] ?? "" }))];
          case "image-region": {
            const r = imageRegion(node, definitions);
            return [
              {
                type: "paragraph",
                children: [
                  {
                    type: "image",
                    url: r.src,
                    alt: r.alt || t("learning.imageRegion"),
                    title: null,
                  },
                ],
              },
              paragraph(
                t("learning.cropExport", {
                  x: r.x,
                  y: r.y,
                  width: r.width,
                  height: r.height,
                  display: r.displayWidth,
                }),
              ),
            ];
          }
          case "caption": {
            if (node.type !== "leafDirective")
              throw new Error("caption requires a leaf directive");
            const caption = captionSettings(node);
            return caption.mode === "custom"
              ? [
                  {
                    type: "paragraph",
                    children: [{ type: "emphasis", children: caption.content }],
                  },
                ]
              : [];
          }
          case "demo": {
            const info = demoCatalog[a["name"] as DemoName];
            return [
              paragraph(
                info
                  ? t("export.demo", {
                      title: info.title.markdown,
                      description: info.description.markdown,
                    })
                  : t("export.interactive"),
              ),
            ];
          }
          case "inclusion":
            return [
              ...convert(node.children as RootContent[]),
              ...(a["source"]
                ? [
                    {
                      type: "paragraph" as const,
                      children: [
                        {
                          type: "link" as const,
                          url: a["source"],
                          children: sourceHintChildren(a["title"] ?? ""),
                        },
                      ],
                    },
                  ]
                : []),
            ];
          case "problems": {
            let ordinal = 1;
            return (node.children as RootContent[]).flatMap((child) => {
              const converted = convert([child]);
              if (
                child.type === "list" &&
                child.ordered &&
                child.children.some(
                  (item) =>
                    item.children[0]?.type === "leafDirective" &&
                    item.children[0].name === "question",
                )
              ) {
                const list = converted.find((item) => item.type === "list");
                if (list?.type === "list") {
                  list.start = ordinal;
                  ordinal += list.children.length;
                }
              }
              return converted;
            });
          }
          case "default-questions":
            return convert(node.children as RootContent[]);
          case "work":
          case "reference": {
            const label = t(
              node.name === "work" ? "learning.work" : "learning.reference",
            );
            const children = convert(node.children as RootContent[]);
            const first = children[0];
            const alreadyLabeled =
              first &&
              (first.type === "heading" || first.type === "paragraph") &&
              toString(first).trim() === label;
            const hasAnswerKeys =
              node.name === "reference" &&
              (node.children as RootContent[]).some(
                (child) => isDirective(child) && child.name === "correct",
              );
            return [
              ...(!a["for"] && (alreadyLabeled || hasAnswerKeys)
                ? []
                : [
                    paragraph(
                      a["for"]
                        ? t("learning.associatedAnswer", {
                            label,
                            target: a["for"],
                          })
                        : label,
                    ),
                  ]),
              ...children,
            ];
          }
          case "semantic":
          case "choices":
            return convert(node.children as RootContent[]);
          default:
            throw new Error(`Unresolved export directive: ${node.name}`);
        }
      }
      const copy = structuredClone(node);
      if (copy.type === "blockquote") tagGithubAlert(copy);
      if (copy.type === "list" && copy.ordered) copy.start = 1;
      if ("children" in copy)
        copy.children = convert(
          copy.children as RootContent[],
        ) as typeof copy.children;
      return [copy];
    });
  }
  return { type: "root", children: convert(tree.children) };
}
export function stringifyExportedTree(tree: Root): string {
  return stringifyContent(tree, false, {
    handlers: {
      text(node, parent, state, info) {
        const markdown = node.data?.["markdownLiteral"];
        if (typeof markdown === "string") return markdown;
        const siblings = parent ? parent.children : [];
        const index = state.indexStack.at(-1) ?? 0;
        return state.safe(node.value, {
          ...info,
          afterNode: siblings[index + 1],
          beforeNode: siblings[index - 1],
        });
      },
    },
  });
}
export function createExportFragment(tree: Root): MarkdownFragment {
  const exported = exportContent(tree);
  return { markdown: stringifyExportedTree(exported), tree: exported };
}
export function exportMarkdown(tree: Root): string {
  return createExportFragment(tree).markdown;
}
export function readableMdx(source: string): string {
  return exportMarkdown(parseContent(source, true));
}
