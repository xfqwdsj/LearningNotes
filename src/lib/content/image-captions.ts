import type {
  Root,
  Image,
  Definition,
  Blockquote,
  PhrasingContent,
} from "mdast";
import type { LeafDirective } from "mdast-util-directive";
import { SKIP, visit } from "unist-util-visit";
import {
  parseMarkdownText,
  normalizeSingleLine,
  markdownPlainText,
} from "@/lib/markdown/render";

declare module "mdast" {
  interface ImageData {
    altPrepared?: boolean;
  }
  interface ImageReferenceData {
    altPrepared?: boolean;
  }
}
export type ImageCaptionMode = "alt" | "none";
export function captionSettings(node: LeafDirective) {
  const attributes = node.attributes ?? {};
  if (Object.keys(attributes).some((key) => key !== "mode"))
    throw new Error("caption only accepts mode");
  const mode = attributes["mode"] ?? (node.children.length ? "custom" : "alt");
  if (!["none", "alt", "custom"].includes(mode))
    throw new Error("Invalid caption mode");
  if (mode === "custom" ? !node.children.length : node.children.length > 0)
    throw new Error("Only a custom caption accepts inline content");
  return { mode, content: node.children };
}
/** Per-image marker > Markdown title > article default (alt inheritance). */
export function remarkImageCaptions(mode: ImageCaptionMode = "alt") {
  return (tree: Root) => {
    const definitions = new Map<string, Definition>();
    visit(tree, "definition", (node) => {
      definitions.set(node.identifier.toLowerCase(), node);
    });
    visit(tree, "paragraph", (node, index, parent) => {
      if (!parent || index === undefined || !node.children.length) return;
      if (parent.type === "mdxJsxFlowElement" && parent.name === "figure")
        return;
      if (
        !node.children.every(
          (child) =>
            child.type === "image" ||
            child.type === "imageReference" ||
            (child.type === "text" && !child.value.trim()),
        )
      )
        return;
      const images = node.children.flatMap((child): Image[] => {
        if (child.type === "image") return [child];
        if (child.type !== "imageReference") return [];
        const definition = definitions.get(child.identifier.toLowerCase());
        return definition
          ? [
              {
                type: "image",
                url: definition.url,
                title: definition.title ?? null,
                alt: child.alt ?? "",
                ...(child.data ? { data: child.data } : {}),
              },
            ]
          : [];
      });
      if (!images.length) return;
      const next = parent.children[index + 1];
      const marker =
        next?.type === "leafDirective" && next.name === "caption"
          ? next
          : undefined;
      if (marker && images.length !== 1)
        throw new Error(
          "caption must follow a paragraph containing exactly one image",
        );
      const settings = marker ? captionSettings(marker) : undefined;
      const figures: Blockquote[] = images.map((image) => {
        const inheritedMode =
          image.data?.hProperties?.["data-image-caption"] ?? mode;
        const text = image.title || (inheritedMode === "none" ? "" : image.alt);
        const custom =
          settings?.mode === "custom" ? settings.content : undefined;
        const value =
          settings?.mode === "none"
            ? ""
            : settings?.mode === "alt"
              ? image.alt
              : text;
        const valueTree = value ? parseMarkdownText(value) : undefined;
        const altTree =
          value === image.alt && valueTree
            ? valueTree
            : parseMarkdownText(image.alt ?? "");
        const content: PhrasingContent[] =
          custom ??
          (valueTree
            ? (
                normalizeSingleLine(valueTree).children[0] as {
                  children: PhrasingContent[];
                }
              ).children
            : []);
        image.alt = markdownPlainText(altTree);
        image.data = { ...image.data, altPrepared: true };
        image.title = null;
        return {
          type: "blockquote",
          data: {
            hName: "figure",
            hProperties: { className: ["content-figure"] },
          },
          children: [
            { type: "paragraph", children: [image] },
            ...(content.length
              ? [
                  {
                    type: "paragraph" as const,
                    data: { hName: "figcaption" },
                    children: content,
                  },
                ]
              : []),
          ],
        };
      });
      parent.children.splice(index, marker ? 2 : 1, ...(figures as never[]));
      return [SKIP, index + figures.length];
    });
    visit(tree, "leafDirective", (node) => {
      if (node.name === "caption")
        throw new Error("caption must immediately follow a standalone image");
    });
  };
}
