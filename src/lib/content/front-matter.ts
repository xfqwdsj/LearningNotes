import { parseDocument, type Document } from "yaml";

export interface FrontMatterParts {
  frontMatter?: string;
  frontMatterOffset?: number;
  content: string;
  contentOffset: number;
}

export function splitFrontMatter(source: string): FrontMatterParts {
  const bomOffset = source.startsWith("\uFEFF") ? 1 : 0;
  const normalized = source.slice(bomOffset);
  if (!normalized.startsWith("---"))
    return { content: normalized, contentOffset: bomOffset };
  const match = /^---[ \t]*\r?\n([\s\S]*?)^---[ \t]*(?:\r?\n|$)/m.exec(
    normalized,
  );
  if (!match || match.index !== 0)
    throw new Error("Front matter must use a closed YAML block");
  const opening = /^---[ \t]*\r?\n/.exec(match[0])?.[0];
  if (!opening) throw new Error("Front matter must use a closed YAML block");
  return {
    frontMatter: match[1] ?? "",
    frontMatterOffset: bomOffset + opening.length,
    content: normalized.slice(match[0].length),
    contentOffset: bomOffset + match[0].length,
  };
}

export function parseYamlDocument(source: string): Document.Parsed {
  const document = parseDocument(source, {
    schema: "core",
    uniqueKeys: true,
    keepSourceTokens: true,
  });
  const issue = document.errors[0] ?? document.warnings[0];
  if (issue) throw new Error(`Invalid YAML: ${issue.message}`);
  return document;
}

/** The content contract supports YAML metadata only, with no executable engines. */
export function parseFrontMatter(source: string): {
  data: Record<string, unknown>;
  content: string;
} {
  const parts = splitFrontMatter(source);
  if (parts.frontMatter === undefined)
    return { data: {}, content: parts.content };
  const document = parseYamlDocument(parts.frontMatter);
  const data: unknown = document.toJS({ maxAliasCount: 100 });
  if (data !== null && (typeof data !== "object" || Array.isArray(data)))
    throw new Error("Front matter must be a metadata mapping");
  return {
    data: (data ?? {}) as Record<string, unknown>,
    content: parts.content,
  };
}
