import type { Root, RootContent, Heading } from "mdast";
import type { ContainerDirective, LeafDirective } from "mdast-util-directive";
import { visit } from "unist-util-visit";
import type { ContentKind } from "./types";

export const slots = {
  knowledge: ["definition", "properties", "proof", "examples", "exploration"],
  task: [
    "problems",
    "constraints",
    "work",
    "reference",
    "feedback",
    "correction",
    "errata",
    "attachments",
  ],
} as const;
export type SemanticSlot = {
  [Owner in keyof typeof slots]: `${Owner}.${(typeof slots)[Owner][number]}`;
}[keyof typeof slots];
export const stableId = /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/;
export function isSemanticSlot(
  value: string | null | undefined,
): value is SemanticSlot {
  if (!value) return false;
  const parts = value.split(".");
  if (parts.length !== 2) return false;
  const [owner, name] = parts;
  return (
    Boolean(owner && name) &&
    Object.hasOwn(slots, owner!) &&
    (slots[owner as keyof typeof slots] as readonly string[]).includes(name!)
  );
}
export function requireId(
  value: string | null | undefined,
  context: string,
): string {
  if (!value || !stableId.test(value))
    throw new Error(`Invalid or missing ${context} ID: ${value}`);
  return value;
}
export const headingSlug = (value: string): string =>
  value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "");
export interface SemanticSection {
  id: string;
  heading: Heading;
  nodes: RootContent[];
  slot?: string;
}
export function isSection(
  node: RootContent | undefined,
): node is LeafDirective & { name: "section" } {
  return node?.type === "leafDirective" && node.name === "section";
}
export function semanticSections(
  tree: Root,
  kind?: ContentKind,
): SemanticSection[] {
  const sections: SemanticSection[] = [];
  const used = new Set<string>();
  const usedSlots = new Set<string>();
  const slugs = new Map<string, number>();
  tree.children.forEach((node, index) => {
    if (isSection(node) && tree.children[index - 1]?.type !== "heading")
      throw new Error("Section metadata must immediately follow a heading");
    if (node.type !== "heading") return;
    const text = stringifyHeading(node);
    const base = headingSlug(text);
    const count = slugs.get(base) ?? 0;
    slugs.set(base, count + 1);
    const marker = tree.children[index + 1];
    const attrs =
      isSection(marker) ||
      (marker?.type === "leafDirective" && marker.name === "problems")
        ? (marker.attributes ?? {})
        : {};
    const id = attrs["id"]
      ? requireId(attrs["id"], "section")
      : String(
          node.data?.hProperties?.id ?? (count ? `${base}-${count}` : base),
        );
    if (used.has(id)) throw new Error(`Duplicate section ID: ${id}`);
    used.add(id);
    const slot = attrs["slot"];
    if (slot) {
      if (!isSemanticSlot(slot) || (kind && slot.split(".")[0] !== kind))
        throw new Error(
          `Invalid semantic slot ${slot} for ${kind ?? "content"}`,
        );
      if (usedSlots.has(slot))
        throw new Error(`Duplicate semantic slot: ${slot}`);
      usedSlots.add(slot);
    }
    node.data = {
      ...node.data,
      hProperties: {
        ...node.data?.hProperties,
        id,
        ...(slot ? { "data-learning-slot": slot } : {}),
      },
    };
    let end = index + 1;
    while (end < tree.children.length) {
      const next = tree.children[end];
      if (next?.type === "heading" && next.depth <= node.depth) break;
      end++;
    }
    const body = tree.children.slice(index + 2, end);
    if (
      slot === "knowledge.proof" &&
      body.length === 1 &&
      body[0]?.type === "containerDirective" &&
      body[0].name === "proof"
    )
      throw new Error(
        "knowledge.proof sections must contain the proof directly instead of wrapping it in one proof block",
      );
    sections.push({
      id,
      heading: node,
      nodes: tree.children.slice(index, end),
      ...(slot ? { slot } : {}),
    });
  });
  return sections;
}
function stringifyHeading(heading: Heading): string {
  let text = "";
  visit(heading, (node) => {
    if ("value" in node && typeof node.value === "string") text += node.value;
  });
  return text;
}
export function presentSections(tree: Root, kind: ContentKind): Root {
  semanticSections(tree, kind);
  const startsProblemSet = (nodes: RootContent[], index: number): boolean => {
    const node = nodes[index];
    if (node?.type !== "heading") return false;
    const marker = nodes[index + 1];
    if (marker?.type === "leafDirective" && marker.name === "problems")
      return true;
    const problemMarker = nodes[index + 2];
    return (
      isSection(marker) &&
      problemMarker?.type === "leafDirective" &&
      problemMarker.name === "problems"
    );
  };
  const wrap = (nodes: RootContent[]): RootContent[] => {
    const result: RootContent[] = [];
    for (let i = 0; i < nodes.length; i++) {
      const heading = nodes[i];
      const marker = nodes[i + 1];
      if (
        heading?.type === "heading" &&
        isSection(marker) &&
        marker.attributes?.["slot"]
      ) {
        let end = i + 2;
        while (end < nodes.length) {
          const n = nodes[end];
          if (n?.type === "heading" && n.depth <= heading.depth) break;
          if (startsProblemSet(nodes, end)) break;
          // Problem sets wrap their own heading, so they are section boundaries
          // even though the wrapped heading is no longer a top-level node.
          if (n?.type === "containerDirective" && n.name === "problems") break;
          end++;
        }
        result.push({
          type: "containerDirective",
          name: "semantic",
          attributes: { slot: marker.attributes["slot"], owner: kind },
          children: [
            heading,
            ...wrap(nodes.slice(i + 2, end)),
          ] as ContainerDirective["children"],
        });
        i = end - 1;
      } else if (isSection(heading)) {
        const next = nodes[i + 1];
        if (next?.type === "leafDirective" && next.name === "problems")
          result.push(heading);
      } else if (heading) result.push(heading);
    }
    return result;
  };
  return { ...tree, children: wrap(tree.children) };
}
