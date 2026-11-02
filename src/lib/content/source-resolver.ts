import path from "node:path";
import type { Root, RootContent } from "mdast";
import type { ContainerDirective } from "mdast-util-directive";
import { toString } from "mdast-util-to-string";
import { attachProblemSets } from "./problem-sets";
import { parseContent } from "./syntax";
import { semanticSections, presentSections } from "./semantic";
import { normalizeHeadingLevels } from "./heading-levels";
import { contentFallbacks } from "./localization";
import { contentLocalePrefix, defaultContentLocale } from "@/i18n/config";
import { DEFAULT_PROBLEM_SET_ID } from "./learning-types";
import type { ContentKind } from "./types";
import { demoCatalog } from "@/demos/catalog";
import { stripBasePath } from "@/lib/site-path";
import { preparePresentationTitles } from "./presentation-blocks";

export interface ContentSource {
  file: string;
  contentPath: string;
  body: string;
  private: boolean;
  data: {
    kind: ContentKind;
    lang: string;
    imageCaptions?: "alt" | "none" | undefined;
    title: string;
  };
}
export function sourceHref(source: ContentSource): string {
  const identity = source.contentPath.replace(/(?:\/index)?\.mdx$/, "");
  return `${source.private ? "/private" : ""}${contentLocalePrefix(source.data.lang)}/${identity}/`;
}
function namespace(tree: Root, prefix: string): Root {
  const fragment = structuredClone(tree);
  const defaultTargets = new Set<string>();
  const explicitSetIds = new Set<string>();
  const collectTargets = (nodes: RootContent[]) => {
    for (const node of nodes) {
      if (node.type === "containerDirective" && node.name === "problems") {
        if (node.attributes?.["id"]) explicitSetIds.add(node.attributes["id"]);
        continue;
      }
      if (
        node.type === "containerDirective" &&
        node.name === "default-questions"
      ) {
        const list = node.children.find((child) => child.type === "list");
        if (list?.type === "list")
          for (const item of list.children) {
            const question = item.children[0];
            const questionId =
              question?.type === "leafDirective" && question.name === "question"
                ? question.attributes?.["id"]
                : undefined;
            if (!questionId) continue;
            defaultTargets.add(questionId);
            for (const child of item.children) {
              if (child.type !== "list") continue;
              for (const partItem of child.children) {
                const part = partItem.children[0];
                if (
                  part?.type === "leafDirective" &&
                  part.name === "part" &&
                  part.attributes?.["id"]
                )
                  defaultTargets.add(`${questionId}/${part.attributes["id"]}`);
              }
            }
          }
        continue;
      }
      if ("children" in node) collectTargets(node.children as RootContent[]);
    }
  };
  collectTargets(fragment.children);
  const visitNodes = (nodes: RootContent[], inDefaultQuestions = false) => {
    for (const node of nodes) {
      if (node.type === "heading" && node.data?.hProperties?.id)
        node.data.hProperties.id = prefix + String(node.data.hProperties.id);
      if (
        node.type === "definition" ||
        node.type === "imageReference" ||
        node.type === "linkReference"
      )
        node.identifier = prefix + node.identifier;
      if (node.type === "link" && node.url.startsWith("#"))
        node.url = `#${prefix}${node.url.slice(1)}`;
      if (node.type === "leafDirective" || node.type === "containerDirective") {
        const a = node.attributes;
        if (a) {
          if (
            (node.name === "problems" ||
              node.name === "section" ||
              node.name === "default-questions") &&
            a["id"]
          )
            a["id"] = prefix + a["id"];
          if (
            inDefaultQuestions &&
            (node.name === "question" || node.name === "part") &&
            a["id"]
          )
            a["id"] = prefix + a["id"];
          if (a["for"]) {
            const defaultPrefix = `${DEFAULT_PROBLEM_SET_ID}/`;
            const target = a["for"];
            if (target.startsWith(defaultPrefix)) {
              a["for"] = `${defaultPrefix}${target
                .slice(defaultPrefix.length)
                .split("/")
                .map((part) => prefix + part)
                .join("/")}`;
            } else {
              const [first, ...rest] = target.split("/");
              const explicitTarget =
                rest.length > 0 && explicitSetIds.has(first ?? "");
              a["for"] =
                defaultTargets.has(target) && !explicitTarget
                  ? target
                      .split("/")
                      .map((part) => prefix + part)
                      .join("/")
                  : prefix + target;
            }
          }
          if (node.name === "image-region" && a["image"])
            a["image"] = prefix + a["image"];
        }
      }
      if ("children" in node)
        visitNodes(
          node.children as RootContent[],
          inDefaultQuestions ||
            (node.type === "containerDirective" &&
              node.name === "default-questions"),
        );
    }
  };
  visitNodes(fragment.children);
  return fragment;
}
export interface InclusionReference {
  target: ContentSource;
  sourceHref: string;
  sourceSectionId?: string;
  sourceSectionTitle: string;
  host: ContentSource;
  hostHref: string;
  hostSectionId?: string;
  hostSectionTitle?: string;
  anchor: string;
}

export type InclusionCollector = (reference: InclusionReference) => void;

function referenceAnchor(base: string, used: Set<string>): string {
  let id = base;
  let suffix = 2;
  while (used.has(id)) id = `${base}-${suffix++}`;
  used.add(id);
  return id;
}

interface HeadingInfo {
  id?: string;
  title: string;
}

function inclusionHeadings(
  tree: Root,
): Map<RootContent, HeadingInfo | undefined> {
  const result = new Map<RootContent, HeadingInfo | undefined>();
  const walk = (
    nodes: RootContent[],
    inherited: HeadingInfo | undefined,
  ): void => {
    let current = inherited;
    for (const node of nodes) {
      if (node.type === "heading") {
        const id = node.data?.hProperties?.id;
        current = {
          ...(typeof id === "string" ? { id } : {}),
          title: toString(node),
        };
      }
      if (
        node.type === "leafDirective" &&
        (node.name === "include" || node.name === "knowledge")
      )
        result.set(node, current);
      if ("children" in node) walk(node.children as RootContent[], current);
    }
  };
  walk(tree.children, undefined);
  return result;
}

export function createSourceResolver(sources: ContentSource[]) {
  const parsed = new Map<string, Root>();
  function parse(source: ContentSource) {
    let tree = parsed.get(source.file);
    if (!tree) {
      tree = parseContent(source.body, true);
      semanticSections(tree, source.data.kind);
      parsed.set(source.file, tree);
    }
    return structuredClone(tree);
  }
  function find(
    source: ContentSource,
    src: string,
    knowledge: boolean,
  ): ContentSource {
    const visible = sources.filter((item) => source.private || !item.private);
    if (!knowledge && src.startsWith("/") && !src.endsWith(".mdx"))
      src = `${src.replace(/\/$/, "")}/`;
    const targetPath = stripBasePath(src, "/private");
    const requestedPrivate = targetPath !== src;
    const exact = visible.find(
      (item) =>
        sourceHref(item) === src || sourceHref(item).slice(0, -1) === src,
    );
    const explicit = targetPath.split("/")[1];
    const localePinned = visible.some(
      (item) =>
        item.data.lang !== defaultContentLocale && item.data.lang === explicit,
    );
    if (exact && localePinned) return exact;
    const candidates = visible.filter((item) =>
      knowledge
        ? item.data.kind === "knowledge" &&
          item.contentPath.replace(/^knowledge\//, "").replace(/\.mdx$/, "") ===
            src
        : (sourceHref(item).replace(
            new RegExp(
              `^${item.private ? "/private" : ""}${contentLocalePrefix(item.data.lang)}`,
            ),
            "",
          ) === targetPath &&
            (!requestedPrivate || item.private)) ||
          item.file === path.resolve(path.dirname(source.file), src),
    );
    for (const lang of contentFallbacks(source.data.lang)) {
      const candidate =
        candidates.find(
          (item) => item.data.lang === lang && item.private === source.private,
        ) ?? candidates.find((item) => item.data.lang === lang);
      if (candidate) return candidate;
    }
    if (exact) return exact;
    throw new Error(`Missing or inaccessible inclusion: ${src}`);
  }
  function resolve(
    source: ContentSource,
    stack: string[] = [],
    scope = "",
    selection?: Root,
    collect?: InclusionCollector,
    host: ContentSource = source,
    anchors: Set<string> = new Set(),
  ): Root {
    if (stack.includes(source.file))
      throw new Error(
        `Circular inclusion: ${[...stack, source.file].join(" -> ")}`,
      );
    const tree = selection ? structuredClone(selection) : parse(source);
    const imports = new Map<string, ContentSource>();
    const demos = new Map<string, string>();
    for (const node of tree.children) {
      if (node.type !== "mdxjsEsm") continue;
      const statements = node.data?.estree?.body ?? [];
      for (const statement of statements) {
        if (
          statement.type !== "ImportDeclaration" ||
          typeof statement.source.value !== "string" ||
          statement.specifiers.length !== 1 ||
          statement.specifiers[0]?.type !== "ImportDefaultSpecifier"
        )
          throw new Error(
            "Only default content and registered demo imports are supported",
          );
        const name = statement.specifiers[0]["local"].name;
        const target = statement.source.value;
        const demo = Object.entries(demoCatalog).find(
          ([, info]) => info.importPath === target,
        );
        if (demo) demos.set(name, demo[0]);
        else imports.set(name, find(source, target, false));
      }
    }
    let occurrence = 0;
    const presented = attachProblemSets(
      presentSections(tree, source.data.kind),
    );
    preparePresentationTitles(presented);
    const headings = inclusionHeadings(presented);
    const expand = (nodes: RootContent[], parentDepth = 1): RootContent[] => {
      const result: RootContent[] = [];
      let depth = parentDepth;
      for (const node of nodes) {
        if (node.type === "image" || node.type === "imageReference")
          node.data = {
            ...node.data,
            hProperties: {
              ...node.data?.hProperties,
              "data-image-caption": source.data.imageCaptions ?? "alt",
            },
          };
        if (node.type === "mdxjsEsm") continue;
        if (node.type === "heading") depth = node.depth;
        let target: ContentSource | undefined;
        let section: string | undefined;
        let slot: string | undefined;
        if (
          node.type === "leafDirective" &&
          (node.name === "include" || node.name === "knowledge")
        ) {
          const a = node.attributes ?? {};
          const src = node.name === "knowledge" ? a["path"] : a["src"];
          if (!src) throw new Error(`Missing ${node.name} target`);
          target = find(source, src, node.name === "knowledge");
          section = a["section"] ?? undefined;
          slot = a["slot"]
            ? node.name === "knowledge"
              ? `knowledge.${a["slot"]}`
              : a["slot"]
            : undefined;
          if (section && slot)
            throw new Error("An inclusion cannot select both section and slot");
        } else if (node.type === "mdxJsxFlowElement" && node.name) {
          const demo = demos.get(node.name);
          if (demo) {
            result.push({
              type: "leafDirective",
              name: "demo",
              attributes: { name: demo },
              children: [],
            });
            continue;
          }
          target = imports.get(node.name);
        }
        if (target) {
          const selected =
            section || slot
              ? semanticSections(parse(target), target.data.kind).find(
                  (item) =>
                    section ? item.id === section : item.slot === slot,
                )
              : undefined;
          if ((section || slot) && !selected)
            throw new Error(
              `Missing inclusion section or slot: ${section ?? slot}`,
            );
          const original = parse(target);
          const selectedTree: Root | undefined = selected
            ? {
                type: "root",
                children: [
                  ...original.children.filter((n) => n.type === "mdxjsEsm"),
                  ...selected.nodes,
                  ...original.children.filter(
                    (n) =>
                      n.type === "definition" &&
                      !selected.nodes.some(
                        (selectedNode) =>
                          selectedNode.type === "definition" &&
                          selectedNode.identifier === n.identifier,
                      ),
                  ),
                ],
              }
            : undefined;
          let fragment = resolve(
            target,
            [...stack, source.file],
            "",
            selectedTree,
            collect,
            target,
            anchors,
          );
          if (selected) {
            const first = fragment.children.find(
              (n) => n.type !== "definition",
            );
            if (first?.type === "containerDirective") {
              const firstChild = first.children[0];
              if (
                first.name === "semantic" &&
                firstChild?.type === "containerDirective" &&
                firstChild.name === "problems" &&
                firstChild.children[0]?.type === "heading"
              ) {
                firstChild.children.shift();
                firstChild.data = {
                  ...firstChild.data,
                  omittedHeading: true,
                };
              } else if (
                ["semantic", "problems"].includes(first.name) &&
                firstChild?.type === "heading"
              ) {
                first.children.shift();
                if (first.name === "problems")
                  first.data = { ...first.data, omittedHeading: true };
              }
            } else if (first?.type === "heading")
              fragment.children = fragment.children.filter((n) => n !== first);
          }
          fragment = normalizeHeadingLevels(
            fragment,
            Math.min(6, depth + 1) as 2 | 3 | 4 | 5 | 6,
          );
          const prefix = `${scope}inc-${++occurrence}-`;
          fragment = namespace(fragment, prefix);
          const includedHref =
            sourceHref(target) + (selected ? `#${selected.id}` : "");
          const targetSlug = target.contentPath
            .replace(/\.mdx$/, "")
            .replace(/[^a-zA-Z0-9_-]+/g, "-");
          const baseAnchor = `ref-${targetSlug}-${selected?.id ?? "page"}`;
          const anchor = referenceAnchor(baseAnchor, anchors);
          const hostHref = sourceHref(host);
          const heading = headings.get(node);
          collect?.({
            target,
            sourceHref: includedHref,
            ...(selected ? { sourceSectionId: selected.id } : {}),
            sourceSectionTitle: selected
              ? toString(selected.heading)
              : target.data.title,
            host,
            hostHref,
            ...(heading?.id ? { hostSectionId: heading.id } : {}),
            ...(heading?.title ? { hostSectionTitle: heading.title } : {}),
            anchor,
          });
          const wrapper: ContainerDirective = {
            type: "containerDirective",
            name: "inclusion",
            attributes: {
              id: anchor,
              lang: target.data.lang,
              source: includedHref,
              title: target.data.title,
              owner: target.data.kind,
            },
            children: fragment.children as ContainerDirective["children"],
          };
          result.push(wrapper);
          continue;
        }
        if ("children" in node)
          node.children = expand(
            node.children as RootContent[],
            depth,
          ) as typeof node.children;
        if (node.type === "link" || node.type === "image") {
          if (/\.mdx(?:#.*)?$/.test(node.url) && !/^https?:/.test(node.url)) {
            const [p = "", anchor] = node.url.split("#");
            const found = find(source, p, false);
            node.url = sourceHref(found) + (anchor ? `#${anchor}` : "");
          }
        }
        result.push(node);
      }
      return result;
    };
    return {
      ...tree,
      children: expand(presented.children),
    };
  }
  return { resolve, parse, href: sourceHref };
}
