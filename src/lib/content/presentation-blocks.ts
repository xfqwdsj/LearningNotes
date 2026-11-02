import type { Paragraph, PhrasingContent, Root, Strong } from "mdast";
import type {
  ContainerDirective,
  LeafDirective,
  TextDirective,
} from "mdast-util-directive";
import { visit } from "unist-util-visit";
import { parseMarkdownText, normalizeSingleLine } from "@/lib/markdown/render";
import { createUiTranslator } from "@/i18n/translate";
import { defaultLocale } from "@/i18n/config";
import { requireDisclosureIcon } from "./disclosure-icons";

declare module "mdast-util-directive" {
  interface ContainerDirectiveData {
    presentationTitleSource?: string;
    presentationTitleTree?: Paragraph;
  }
}

const t = createUiTranslator();
export const presentationNames = [
  "example",
  "proof",
  "disclosure",
  "steps",
] as const;

/** The fixed proof label is semantic content, not merely bold styling. */
export function proofPresentationLabel(): Strong {
  return {
    type: "strong",
    data: {
      hProperties: {
        className: ["content-disclosure-kind"],
        "data-disclosure-kind": "proof",
        lang: defaultLocale,
      },
    },
    children: [{ type: "text", value: t("callout.proof") }],
  };
}

export function proofTitleChildren(title?: Paragraph): PhrasingContent[] {
  const label = proofPresentationLabel();
  return title
    ? [label, { type: "text", value: " " }, ...title.children]
    : [label];
}

export function preparePresentationTitles(tree: Root): void {
  visit(tree, "containerDirective", (node) => {
    if (
      presentationNames.includes(
        node.name as (typeof presentationNames)[number],
      )
    )
      presentationTitle(node);
  });
}

/** Validate author containers and share their readable title with HTML and Markdown. */
export function presentationTitle(
  node: ContainerDirective | LeafDirective | TextDirective,
): Paragraph | undefined {
  if (node.type !== "containerDirective")
    throw new Error(`${node.name} requires a container directive`);
  const attributes = node.attributes ?? {};
  const allowed =
    node.name === "steps"
      ? []
      : node.name === "disclosure"
        ? ["icon", "title"]
        : ["title"];
  if (Object.keys(attributes).some((key) => !allowed.includes(key)))
    throw new Error(`Unsupported ${node.name} attribute`);
  if (node.name === "steps") {
    if (
      node.children.length !== 1 ||
      node.children[0]?.type !== "list" ||
      !node.children[0].ordered
    )
      throw new Error("steps requires one ordered Markdown list");
    return undefined;
  }
  const rawTitle = attributes["title"]?.trim() ?? "";
  if (node.name === "disclosure") {
    requireDisclosureIcon(attributes["icon"]);
    if (!rawTitle) throw new Error("disclosure requires a title");
  }
  // Proof uses the fixed label plus an optional subtitle. An absent title is
  // valid there, unlike the generic disclosure container.
  if (node.name === "proof" && !rawTitle) return undefined;
  const title =
    rawTitle ||
    t(node.name === "example" ? "callout.example" : "callout.proof");
  if (
    node.data?.presentationTitleSource === title &&
    node.data.presentationTitleTree
  )
    return node.data.presentationTitleTree;
  const normalized = normalizeSingleLine(parseMarkdownText(title), {
    linkPolicy: "plain",
  }).children[0]!;
  if (normalized.type !== "paragraph")
    throw new Error("Presentation titles must normalize to a paragraph");
  node.data = {
    ...node.data,
    presentationTitleSource: title,
    presentationTitleTree: normalized,
  };
  return normalized;
}
