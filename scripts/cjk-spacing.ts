import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fromHtml } from "hast-util-from-html";
import {
  parse as parseIcu,
  TYPE as ICU_TYPE,
} from "@formatjs/icu-messageformat-parser";
import {
  isNode,
  isMap,
  isScalar,
  isSeq,
  type Node as YamlNode,
  type Range,
  type Scalar,
  stringify as stringifyYaml,
} from "yaml";
import {
  parseFrontMatter,
  parseYamlDocument,
  splitFrontMatter,
} from "@/lib/content/front-matter";
import { parseContent } from "@/lib/content/syntax";
import { parseMarkdownText } from "@/lib/markdown/render";

/** Separator spaces at CJK/non-CJK boundaries are restored visually by CSS typography. */
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const privateRoot = path.resolve(
  process.env["PRIVATE_CONTENT_DIR"] ??
    path.resolve(root, "../LearningNotes-Private"),
);
const visibleAttributeNames = new Set([
  "alt",
  "aria-description",
  "aria-label",
  "caption",
  "description",
  "label",
  "placeholder",
  "title",
]);
const markdownCodeBlockLanguages = new Set(["md", "markdown", "mdx"]);
const cjkCharacter =
  /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\p{Script=Bopomofo}]/u;
const nonCjkLetterOrNumber = /[\p{L}\p{Nd}]/u;
const mark = /\p{M}/u;
const whitespace = /[ \t]/u;
const cjkPunctuation =
  /[\u3000-\u303f\uff01-\uff0f\uff1a-\uff20\uff3b-\uff40\uff5b-\uff65]/u;
const openingPunctuation = /[\p{Ps}\p{Pi}]/u;
const closingPunctuation = /[\p{Pe}\p{Pf}]/u;
// Punctuation such as the prefix in %s or .env is part of a visible token.
const leadingTokenSymbol = new Set([
  "$",
  "%",
  "+",
  "-",
  ".",
  "/",
  "<",
  ">",
  "@",
  "\\",
  "#",
  "~",
]);
const trailingTokenSymbol = new Set([
  "$",
  "%",
  "+",
  ">",
  "#",
  "°",
  "′",
  "″",
  "‰",
]);
const escapablePunctuation = /[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/u;
const characterReference =
  /^&(?:#(?:[xX][0-9A-Fa-f]{1,6}|[0-9]{1,7})|[A-Za-z][A-Za-z0-9]{1,31});/u;

const spacingModes = ["check", "scan", "write"] as const;
export type SpacingMode = (typeof spacingModes)[number];
const isSpacingMode = (value: string): value is SpacingMode =>
  spacingModes.some((mode) => mode === value);
export const spacingPreservationHint =
  "[cjk-spacing] Tip: to keep a space that cleanup would remove, write it as the HTML character reference &#32;.";
const shouldShowSpacingPreservationHint =
  process.env["CJK_SPACING_HINT"] !== "0";

export interface SpacingEdit {
  start: number;
  end: number;
  removed: string;
  count: number;
}

export interface SpacingResult {
  source: string;
  edits: SpacingEdit[];
}

export type SpacingCandidate = SpacingEdit;

interface SourceRange {
  start: number;
  end: number;
}

interface SourcePatch extends SourceRange {
  replacement: string;
  count: number;
}

type LocatedStringScalar = Scalar<string> & { range: Range };

interface AstPosition {
  start?: { offset?: number | null | undefined } | null | undefined;
  end?: { offset?: number | null | undefined } | null | undefined;
}

interface AstNode {
  type: string;
  name?: string | null | undefined;
  lang?: string | null | undefined;
  value?: string | null | undefined;
  title?: string | null | undefined;
  alt?: string | null | undefined;
  meta?: string | null | undefined;
  position?: AstPosition | null | undefined;
  children?: AstNode[] | null | undefined;
  attributes?:
    | Record<string, string | null | undefined>
    | AstAttribute[]
    | null
    | undefined;
}

interface AstAttribute {
  type?: string | undefined;
  name?: string | undefined;
  value?: unknown;
  position?: AstPosition | null | undefined;
}

interface TextSourceMap {
  starts: number[];
  ends: number[];
  protectedSpaces: boolean[];
}

interface TextLeaf {
  type: "text";
  node: AstNode;
  value: string;
  sourceMap: TextSourceMap | null;
}

interface MarkdownBodyOptions {
  normalizeMarkdownCodeBlocks?: boolean;
  placeholders?: boolean;
}

interface AtomicLeaf {
  type: "atomic";
  kind: "code" | "math" | "placeholder";
}

type InlinePart = TextLeaf | AtomicLeaf | { type: "barrier" };
type VisiblePart = TextLeaf | AtomicLeaf;

class EditCollector {
  readonly #patches = new Map<string, SourcePatch>();

  add(start: number, end: number, count = 1): void {
    if (start >= end) return;
    this.#patches.set(`${start}:${end}:remove`, {
      start,
      end,
      replacement: "",
      count,
    });
  }

  replace(
    start: number,
    end: number,
    replacement: string,
    count: number,
  ): void {
    if (start >= end || count === 0) return;
    this.#patches.set(`${start}:${end}:replace`, {
      start,
      end,
      replacement,
      count,
    });
  }

  finish(source: string): SpacingResult {
    const patches = [...this.#patches.values()].sort(
      (left, right) => left.start - right.start || left.end - right.end,
    );
    const merged: SourcePatch[] = [];
    for (const patch of patches) {
      const previous = merged.at(-1);
      if (previous && patch.start < previous.end) {
        if (previous.replacement !== "" || patch.replacement !== "")
          throw new Error("Overlapping text patches.");
        previous.end = Math.max(previous.end, patch.end);
        previous.count += patch.count;
      } else {
        merged.push({ ...patch });
      }
    }
    let result = source;
    for (const patch of [...merged].sort(
      (left, right) => right.start - left.start,
    )) {
      result =
        result.slice(0, patch.start) +
        patch.replacement +
        result.slice(patch.end);
    }
    return {
      source: result,
      edits: merged.map(({ start, end, count }) => ({
        start,
        end,
        removed: source.slice(start, end),
        count,
      })),
    };
  }
}

function isHighSurrogate(value: number): boolean {
  return value >= 0xd800 && value <= 0xdbff;
}

function isLowSurrogate(value: number): boolean {
  return value >= 0xdc00 && value <= 0xdfff;
}

function characterBefore(value: string, index: number): string | null {
  if (index <= 0) return null;
  const last = value.charCodeAt(index - 1);
  if (isLowSurrogate(last) && isHighSurrogate(value.charCodeAt(index - 2))) {
    return value.slice(index - 2, index);
  }
  return value[index - 1] ?? null;
}

function characterAt(value: string, index: number): string | null {
  const codePoint = value.codePointAt(index);
  return codePoint === undefined ? null : String.fromCodePoint(codePoint);
}

type TypographyClass = "cjk" | "nonCjk";
type TypographyEdge = TypographyClass | "punctuation";

function isLeadingTokenPunctuation(character: string): boolean {
  return (
    character !== "{" &&
    (openingPunctuation.test(character) || leadingTokenSymbol.has(character))
  );
}

function isTrailingTokenPunctuation(character: string): boolean {
  return (
    character !== "}" &&
    (closingPunctuation.test(character) || trailingTokenSymbol.has(character))
  );
}

function classifyTypographyCharacter(
  character: string | null,
): TypographyClass | null {
  if (!character) return null;
  if (cjkCharacter.test(character)) return "cjk";
  if (nonCjkLetterOrNumber.test(character)) return "nonCjk";
  return null;
}

function typographyEdgeBefore(
  value: string,
  index: number,
): TypographyEdge | null {
  let cursor = index;
  while (cursor > 0) {
    const character = characterBefore(value, cursor);
    if (!character) return null;
    if (cjkPunctuation.test(character)) return "punctuation";
    const characterClass = classifyTypographyCharacter(character);
    if (characterClass) return characterClass;
    if (!mark.test(character) && !isTrailingTokenPunctuation(character))
      return null;
    cursor -= character.length;
  }
  return null;
}

function typographyEdgeAt(value: string, index: number): TypographyEdge | null {
  let cursor = index;
  while (cursor < value.length) {
    const character = characterAt(value, cursor);
    if (!character) return null;
    if (cjkPunctuation.test(character)) return "punctuation";
    const characterClass = classifyTypographyCharacter(character);
    if (characterClass) return characterClass;
    if (!mark.test(character) && !isLeadingTokenPunctuation(character))
      return null;
    cursor += character.length;
  }
  return null;
}

function isCjkNonCjkBoundary(
  left: TypographyEdge | null,
  right: TypographyEdge | null,
): boolean {
  return (
    (left === "cjk" && right === "nonCjk") ||
    (left === "nonCjk" && right === "cjk")
  );
}

function shouldRemoveSpacing(
  left: TypographyEdge | null,
  right: TypographyEdge | null,
): boolean {
  return (
    isCjkNonCjkBoundary(left, right) ||
    (left === "punctuation" && right !== null) ||
    (right === "punctuation" && left !== null)
  );
}

function icuPlaceholderRanges(source: string): SourceRange[] {
  const ranges: SourceRange[] = [];
  let cursor = 0;
  while (cursor < source.length) {
    const opening = source.indexOf("{", cursor);
    if (opening === -1) break;
    const end = placeholderEnd(source, opening);
    if (end !== null && isIcuPlaceholder(source.slice(opening, end))) {
      ranges.push({ start: opening, end });
      cursor = end;
    } else {
      cursor = opening + 1;
    }
  }
  return ranges;
}

/**
 * Finds spacing candidates with the same boundary rules as the AST pass,
 * without requiring supported syntax, file context, or visible text.
 */
export function findSpacingCandidates(source: string): SpacingCandidate[] {
  const candidates: SpacingCandidate[] = [];
  const placeholders = icuPlaceholderRanges(source);
  const placeholderStarts = new Set(
    placeholders.map((placeholder) => placeholder.start),
  );
  const placeholderEnds = new Set(
    placeholders.map((placeholder) => placeholder.end),
  );
  let cursor = 0;
  let placeholderIndex = 0;
  while (cursor < source.length) {
    const character = characterAt(source, cursor);
    if (!character || !whitespace.test(character)) {
      cursor += character?.length ?? 1;
      continue;
    }
    const start = cursor;
    while (cursor < source.length) {
      const next = characterAt(source, cursor);
      if (!next || !whitespace.test(next)) break;
      cursor += next.length;
    }
    while (
      placeholderIndex < placeholders.length &&
      placeholders[placeholderIndex]!.end <= start
    )
      placeholderIndex++;
    const currentPlaceholder = placeholders[placeholderIndex];
    if (
      currentPlaceholder &&
      start > currentPlaceholder.start &&
      start < currentPlaceholder.end
    )
      continue;
    const left = placeholderEnds.has(start)
      ? "nonCjk"
      : typographyEdgeBefore(source, start);
    const right = placeholderStarts.has(cursor)
      ? "nonCjk"
      : typographyEdgeAt(source, cursor);
    if (shouldRemoveSpacing(left, right))
      candidates.push({
        start,
        end: cursor,
        removed: source.slice(start, cursor),
        count: 1,
      });
  }
  return candidates;
}

function leadingWhitespaceEnd(value: string): number {
  let cursor = 0;
  while (cursor < value.length) {
    const character = characterAt(value, cursor);
    if (!character || !whitespace.test(character)) break;
    cursor += character.length;
  }
  return cursor;
}

function trailingWhitespaceStart(value: string): number {
  let cursor = value.length;
  while (cursor > 0) {
    const character = characterBefore(value, cursor);
    if (!character || !whitespace.test(character)) break;
    cursor -= character.length;
  }
  return cursor;
}

function firstVisibleEdge(value: string): TypographyEdge | null {
  return typographyEdgeAt(value, leadingWhitespaceEnd(value));
}

function lastVisibleEdge(value: string): TypographyEdge | null {
  return typographyEdgeBefore(value, trailingWhitespaceStart(value));
}

function firstPartEdge(part: VisiblePart): TypographyEdge | null {
  if (part.type === "text") return firstVisibleEdge(part.value);
  return "nonCjk";
}

function lastPartEdge(part: VisiblePart): TypographyEdge | null {
  if (part.type === "text") return lastVisibleEdge(part.value);
  return "nonCjk";
}

function decodeHtmlText(source: string): string {
  const tree = fromHtml(source, { fragment: true });
  const render = (node: {
    type: string;
    value?: unknown;
    children?: readonly unknown[];
  }): string => {
    if (node.type === "text") return String(node.value ?? "");
    if (!node.children) return "";
    return node.children
      .map((child) =>
        render(
          child as {
            type: string;
            value?: unknown;
            children?: readonly unknown[];
          },
        ),
      )
      .join("");
  };
  return tree.children.map(render).join("");
}

function sourceUnit(
  raw: string,
  index: number,
): {
  decoded: string;
  length: number;
  characterReference: boolean;
} | null {
  const character = characterAt(raw, index);
  if (!character) return null;
  if (character === "\r" && raw[index + 1] === "\n")
    return { decoded: "\n", length: 2, characterReference: false };
  if (character === "\\") {
    const escaped = characterAt(raw, index + 1);
    if (escaped && escapablePunctuation.test(escaped))
      return {
        decoded: escaped,
        length: 1 + escaped.length,
        characterReference: false,
      };
  }
  if (character === "&") {
    const match = characterReference.exec(raw.slice(index));
    if (match) {
      const decoded = decodeHtmlText(match[0]);
      if (decoded !== match[0])
        return {
          decoded,
          length: match[0].length,
          characterReference: true,
        };
    }
  }
  return {
    decoded: character,
    length: character.length,
    characterReference: false,
  };
}

function continuationPrefixLength(raw: string, index: number): number {
  if (index === 0 || (raw[index - 1] !== "\n" && raw[index - 1] !== "\r"))
    return 0;
  let cursor = index;
  while (cursor < raw.length) {
    const beforeMarker = cursor;
    let spaces = 0;
    while (spaces < 3 && raw[cursor] === " ") {
      cursor++;
      spaces++;
    }
    if (raw[cursor] !== ">") {
      cursor = beforeMarker;
      break;
    }
    cursor++;
    if (raw[cursor] === " " || raw[cursor] === "\t") cursor++;
  }
  return cursor - index;
}

function mapTextSource(
  raw: string,
  value: string,
  sourceStart: number,
): TextSourceMap | null {
  const starts = new Array<number>(value.length);
  const ends = new Array<number>(value.length);
  const protectedSpaces = new Array<boolean>(value.length).fill(false);
  let rawIndex = 0;
  let valueIndex = 0;
  while (rawIndex < raw.length && valueIndex < value.length) {
    const prefixLength = continuationPrefixLength(raw, rawIndex);
    if (prefixLength > 0) {
      rawIndex += prefixLength;
      continue;
    }
    const unit = sourceUnit(raw, rawIndex);
    if (!unit) return null;
    if (
      value.slice(valueIndex, valueIndex + unit.decoded.length) !== unit.decoded
    )
      return null;
    for (let offset = 0; offset < unit.decoded.length; offset++) {
      starts[valueIndex + offset] = sourceStart + rawIndex;
      ends[valueIndex + offset] = sourceStart + rawIndex + unit.length;
      protectedSpaces[valueIndex + offset] = unit.characterReference;
    }
    rawIndex += unit.length;
    valueIndex += unit.decoded.length;
  }
  return rawIndex === raw.length && valueIndex === value.length
    ? { starts, ends, protectedSpaces }
    : null;
}

function sourceLines(source: string): SourceRange[] {
  const lines: SourceRange[] = [];
  let start = 0;
  while (start <= source.length) {
    const newline = source.indexOf("\n", start);
    if (newline === -1) {
      lines.push({ start, end: source.length });
      break;
    }
    const end =
      newline > start && source[newline - 1] === "\r" ? newline - 1 : newline;
    lines.push({ start, end });
    start = newline + 1;
  }
  return lines;
}

function codeBlockValueSourceMap(
  node: AstNode,
  source: string,
  offsetBase: number,
): TextSourceMap | null {
  if (node.type !== "code" || typeof node.value !== "string") return null;
  const relativeStart = nodeOffset(node, "start");
  const relativeEnd = nodeOffset(node, "end");
  if (relativeStart === null || relativeEnd === null) return null;

  const raw = source.slice(
    offsetBase + relativeStart,
    offsetBase + relativeEnd,
  );
  const openingLineEnd = raw.indexOf("\n");
  if (openingLineEnd === -1) return null;
  const closingLineStart = raw.lastIndexOf("\n");
  if (closingLineStart <= openingLineEnd)
    return node.value === ""
      ? { starts: [], ends: [], protectedSpaces: [] }
      : null;

  const bodyStart = openingLineEnd + 1;
  const bodyEnd =
    raw[closingLineStart - 1] === "\r"
      ? closingLineStart - 1
      : closingLineStart;
  const rawBody = raw.slice(bodyStart, bodyEnd);
  const rawLines = sourceLines(rawBody);
  const valueLines = sourceLines(node.value);
  if (rawLines.length !== valueLines.length) return null;

  const starts = new Array<number>(node.value.length);
  const ends = new Array<number>(node.value.length);
  const protectedSpaces = new Array<boolean>(node.value.length).fill(false);
  for (const [index, valueLine] of valueLines.entries()) {
    const rawLine = rawLines[index]!;
    const value = node.value.slice(valueLine.start, valueLine.end);
    const rawValue = rawBody.slice(rawLine.start, rawLine.end);
    if (!rawValue.endsWith(value)) return null;
    const prefixLength = rawValue.length - value.length;
    for (let offset = 0; offset < value.length; offset++) {
      const valueOffset = valueLine.start + offset;
      const sourceOffset =
        offsetBase + relativeStart + bodyStart + rawLine.start + prefixLength;
      starts[valueOffset] = sourceOffset + offset;
      ends[valueOffset] = sourceOffset + offset + 1;
    }
  }
  return { starts, ends, protectedSpaces };
}

function decodeJsonEscape(
  raw: string,
  index: number,
): { decoded: string; length: number } | null {
  if (raw[index] !== "\\") return null;
  const escaped = raw[index + 1];
  switch (escaped) {
    case '"':
    case "\\":
    case "/":
      return { decoded: escaped, length: 2 };
    case "b":
      return { decoded: "\b", length: 2 };
    case "f":
      return { decoded: "\f", length: 2 };
    case "n":
      return { decoded: "\n", length: 2 };
    case "r":
      return { decoded: "\r", length: 2 };
    case "t":
      return { decoded: "\t", length: 2 };
    case "u": {
      const hex = raw.slice(index + 2, index + 6);
      if (!/^[0-9A-Fa-f]{4}$/u.test(hex)) return null;
      const code = Number.parseInt(hex, 16);
      if (code >= 0xd800 && code <= 0xdbff) {
        const next = raw.slice(index + 6, index + 12);
        if (!/^\\u[0-9A-Fa-f]{4}$/u.test(next)) return null;
        const low = Number.parseInt(next.slice(2), 16);
        if (low < 0xdc00 || low > 0xdfff) return null;
        return {
          decoded: String.fromCodePoint(
            0x10000 + ((code - 0xd800) << 10) + (low - 0xdc00),
          ),
          length: 12,
        };
      }
      return { decoded: String.fromCharCode(code), length: 6 };
    }
    default:
      return null;
  }
}

function mapJsonStringSource(
  raw: string,
  value: string,
  sourceStart: number,
): TextSourceMap | null {
  if (raw[0] !== '"') return null;
  const starts = new Array<number>(value.length);
  const ends = new Array<number>(value.length);
  const protectedSpaces = new Array<boolean>(value.length).fill(false);
  let rawIndex = 1;
  let valueIndex = 0;
  while (rawIndex < raw.length - 1 && valueIndex < value.length) {
    const unit =
      raw[rawIndex] === "\\"
        ? decodeJsonEscape(raw, rawIndex)
        : (() => {
            const decoded = characterAt(raw, rawIndex);
            return decoded ? { decoded, length: decoded.length } : null;
          })();
    if (!unit) return null;
    if (
      value.slice(valueIndex, valueIndex + unit.decoded.length) !== unit.decoded
    )
      return null;
    for (let offset = 0; offset < unit.decoded.length; offset++) {
      starts[valueIndex + offset] = sourceStart + rawIndex;
      ends[valueIndex + offset] = sourceStart + rawIndex + unit.length;
    }
    rawIndex += unit.length;
    valueIndex += unit.decoded.length;
  }
  return rawIndex === raw.length - 1 && valueIndex === value.length
    ? { starts, ends, protectedSpaces }
    : null;
}

function addMappedEdit(
  collector: EditCollector,
  leaf: TextLeaf,
  start: number,
  end: number,
): void {
  if (!leaf.sourceMap || start >= end) return;
  const sourceStart = leaf.sourceMap.starts[start];
  const sourceEnd = leaf.sourceMap.ends[end - 1];
  if (sourceStart === undefined || sourceEnd === undefined) return;
  collector.add(sourceStart, sourceEnd);
}

function addMappedSpacingEdit(
  collector: EditCollector,
  leaf: TextLeaf,
  start: number,
  end: number,
): void {
  if (!leaf.sourceMap || start >= end) return;
  let runStart: number | null = null;
  const flush = (runEnd: number): void => {
    if (runStart === null) return;
    addMappedEdit(collector, leaf, runStart, runEnd);
    runStart = null;
  };
  for (let index = start; index < end; index++) {
    const character = characterAt(leaf.value, index);
    if (
      character &&
      whitespace.test(character) &&
      !leaf.sourceMap.protectedSpaces[index]
    ) {
      runStart ??= index;
    } else {
      flush(index);
    }
  }
  flush(end);
}

function normalizeTextInternals(
  collector: EditCollector,
  leaf: TextLeaf,
): void {
  let cursor = 0;
  while (cursor < leaf.value.length) {
    const character = characterAt(leaf.value, cursor);
    if (!character || !whitespace.test(character)) {
      cursor += character?.length ?? 1;
      continue;
    }
    const start = cursor;
    while (cursor < leaf.value.length) {
      const next = characterAt(leaf.value, cursor);
      if (!next || !whitespace.test(next)) break;
      cursor += next.length;
    }
    if (
      shouldRemoveSpacing(
        typographyEdgeBefore(leaf.value, start),
        typographyEdgeAt(leaf.value, cursor),
      )
    )
      addMappedSpacingEdit(collector, leaf, start, cursor);
  }
}

function nodeOffset(node: AstNode, edge: "start" | "end"): number | null {
  return node.position?.[edge]?.offset ?? null;
}

function textLeaf(
  node: AstNode,
  source: string,
  offsetBase: number,
): TextLeaf | null {
  const start = nodeOffset(node, "start");
  const end = nodeOffset(node, "end");
  if (start === null || end === null || typeof node.value !== "string")
    return null;
  const absoluteStart = offsetBase + start;
  const absoluteEnd = offsetBase + end;
  return {
    type: "text",
    node,
    value: node.value,
    sourceMap: mapTextSource(
      source.slice(absoluteStart, absoluteEnd),
      node.value,
      absoluteStart,
    ),
  };
}

function sliceTextLeaf(
  leaf: TextLeaf,
  start: number,
  end: number,
): TextLeaf | null {
  if (start >= end) return null;
  return {
    type: "text",
    node: leaf.node,
    value: leaf.value.slice(start, end),
    sourceMap: leaf.sourceMap
      ? {
          starts: leaf.sourceMap.starts.slice(start, end),
          ends: leaf.sourceMap.ends.slice(start, end),
          protectedSpaces: leaf.sourceMap.protectedSpaces.slice(start, end),
        }
      : null,
  };
}

function isIcuPlaceholder(value: string): boolean {
  try {
    const nodes = parseIcu(value, { ignoreTag: true });
    return nodes.length === 1 && nodes[0]?.type !== ICU_TYPE.literal;
  } catch {
    return false;
  }
}

function placeholderEnd(value: string, start: number): number | null {
  let depth = 0;
  let quoted = false;
  for (let index = start; index < value.length; index++) {
    const character = value[index];
    if (character === "'") {
      if (quoted && value[index + 1] === "'") {
        index++;
        continue;
      }
      quoted = !quoted;
      continue;
    }
    if (quoted) continue;
    if (character === "{") depth++;
    if (character === "}" && --depth === 0) return index + 1;
  }
  return null;
}

function splitTextLeaf(leaf: TextLeaf, placeholders: boolean): InlinePart[] {
  if (!placeholders || !leaf.value.includes("{")) return [leaf];
  const parts: InlinePart[] = [];
  let cursor = 0;
  while (cursor < leaf.value.length) {
    const opening = leaf.value.indexOf("{", cursor);
    if (opening === -1) break;
    const end = placeholderEnd(leaf.value, opening);
    if (end === null) break;
    const placeholder = leaf.value.slice(opening, end);
    if (!isIcuPlaceholder(placeholder)) {
      cursor = opening + 1;
      continue;
    }
    const text = sliceTextLeaf(leaf, cursor, opening);
    if (text) parts.push(text);
    parts.push({ type: "atomic", kind: "placeholder" });
    cursor = end;
  }
  const remainder = sliceTextLeaf(leaf, cursor, leaf.value.length);
  if (remainder) parts.push(remainder);
  return parts.length > 0 ? parts : [leaf];
}

function flattenInlineNode(
  node: AstNode,
  source: string,
  offsetBase: number,
  placeholders: boolean,
): InlinePart[] {
  switch (node.type) {
    case "text": {
      const leaf = textLeaf(node, source, offsetBase);
      return leaf ? splitTextLeaf(leaf, placeholders) : [];
    }
    case "inlineCode":
      return [
        {
          type: "atomic",
          kind: "code",
        },
      ];
    case "inlineMath":
      return [{ type: "atomic", kind: "math" }];
    case "emphasis":
    case "strong":
    case "delete":
    case "link":
    case "linkReference":
      return (node.children ?? []).flatMap((child) =>
        flattenInlineNode(child, source, offsetBase, placeholders),
      );
    case "mdxJsxTextElement":
      if (node.name?.toLowerCase() === "br") return [{ type: "barrier" }];
      return (node.children ?? []).flatMap((child) =>
        flattenInlineNode(child, source, offsetBase, placeholders),
      );
    case "html":
      return /^<br\b/iu.test(node.value ?? "") ? [{ type: "barrier" }] : [];
    case "break":
    case "footnoteReference":
    case "image":
    case "imageReference":
    case "math":
    case "mdxTextExpression":
      return [{ type: "barrier" }];
    default:
      return [{ type: "barrier" }];
  }
}

function isVisiblePart(part: InlinePart): part is VisiblePart {
  return part.type !== "barrier";
}

function trimWhitespaceLeaf(
  collector: EditCollector,
  leaf: TextLeaf,
  side: "start" | "end",
): void {
  if (side === "start") {
    const end = leadingWhitespaceEnd(leaf.value);
    if (end > 0) addMappedSpacingEdit(collector, leaf, 0, end);
    return;
  }
  const start = trailingWhitespaceStart(leaf.value);
  if (start < leaf.value.length)
    addMappedSpacingEdit(collector, leaf, start, leaf.value.length);
}

function processInlineSegment(
  collector: EditCollector,
  segment: InlinePart[],
): void {
  const visible = segment.filter(isVisiblePart);
  const content = visible.filter(
    (leaf) =>
      leaf.type === "atomic" ||
      leadingWhitespaceEnd(leaf.value) < leaf.value.length,
  );
  for (let index = 1; index < content.length; index++) {
    const left = content[index - 1]!;
    const right = content[index]!;
    if (!shouldRemoveSpacing(lastPartEdge(left), firstPartEdge(right)))
      continue;
    if (left.type === "text") trimWhitespaceLeaf(collector, left, "end");
    if (right.type === "text") trimWhitespaceLeaf(collector, right, "start");
    const leftIndex = visible.indexOf(left);
    const rightIndex = visible.indexOf(right);
    for (let middle = leftIndex + 1; middle < rightIndex; middle++) {
      const part = visible[middle]!;
      if (
        part.type === "text" &&
        leadingWhitespaceEnd(part.value) === part.value.length
      )
        addMappedSpacingEdit(collector, part, 0, part.value.length);
    }
  }
}

function processInlineChildren(
  collector: EditCollector,
  children: AstNode[],
  source: string,
  offsetBase: number,
  placeholders: boolean,
): void {
  let segment: InlinePart[] = [];
  for (const child of children) {
    for (const part of flattenInlineNode(
      child,
      source,
      offsetBase,
      placeholders,
    )) {
      if (part.type === "barrier") {
        processInlineSegment(collector, segment);
        segment = [];
      } else {
        segment.push(part);
      }
    }
  }
  processInlineSegment(collector, segment);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function attributeValueRange(
  source: string,
  start: number,
  end: number,
  name: string,
): SourceRange | null {
  const raw = source.slice(start, end);
  const headerEnd = raw.search(/\r?\n/u);
  const header = headerEnd === -1 ? raw : raw.slice(0, headerEnd);
  const match = new RegExp(
    `(?:^|[\\s{,])${escapeRegExp(name)}\\s*=\\s*(["'])([\\s\\S]*?)\\1`,
    "u",
  ).exec(header);
  if (!match || match.index === undefined) return null;
  const prefixLength = match[0].indexOf(match[1]!);
  const valueStart = start + match.index + prefixLength + 1;
  const valueEnd = valueStart + match[2]!.length;
  return { start: valueStart, end: valueEnd };
}

function normalizeEmbeddedText(
  collector: EditCollector,
  source: string,
  range: SourceRange,
): void {
  const result = normalizeMarkdownSource(
    source.slice(range.start, range.end),
    false,
    { normalizeMarkdownCodeBlocks: false },
  );
  for (const edit of result.edits)
    collector.add(range.start + edit.start, range.start + edit.end, edit.count);
}

function normalizedAttributeRange(
  source: string,
  start: number,
  end: number,
  name: string,
  collector: EditCollector,
): void {
  const range = attributeValueRange(source, start, end, name);
  if (range) normalizeEmbeddedText(collector, source, range);
}

function findClosingBracket(raw: string, opening: number): number {
  let depth = 1;
  for (let index = opening + 1; index < raw.length; index++) {
    const character = raw[index];
    if (character === "\\") {
      index++;
      continue;
    }
    if (character === "[") depth++;
    if (character === "]" && --depth === 0) return index;
  }
  return -1;
}

function visibleEdges(parts: InlinePart[]): {
  first: TypographyEdge | null;
  last: TypographyEdge | null;
} {
  const visible = parts.filter(isVisiblePart);
  return {
    first: visible[0] ? firstPartEdge(visible[0]) : null,
    last: visible.at(-1) ? lastPartEdge(visible.at(-1)!) : null,
  };
}

function markdownEdges(source: string): {
  first: TypographyEdge | null;
  last: TypographyEdge | null;
} {
  const tree = parseMarkdownText(source) as unknown as AstNode;
  return visibleEdges(
    (tree.children ?? []).flatMap((child) => {
      if (
        (child.type === "paragraph" || child.type === "heading") &&
        child.children
      )
        return child.children.flatMap((inline) =>
          flattenInlineNode(inline, source, 0, false),
        );
      return flattenInlineNode(child, source, 0, false);
    }),
  );
}

function mdxStringAttribute(node: AstNode, name: string): string | null {
  if (!Array.isArray(node.attributes)) return null;
  for (const attribute of node.attributes) {
    if (attribute.name === name && typeof attribute.value === "string")
      return attribute.value;
  }
  return null;
}

function rawMarkdownLabelRange(
  source: string,
  node: AstNode,
  offsetBase: number,
): SourceRange | null {
  const relativeStart = nodeOffset(node, "start");
  const relativeEnd = nodeOffset(node, "end");
  if (relativeStart === null || relativeEnd === null) return null;
  const start = offsetBase + relativeStart;
  const end = offsetBase + relativeEnd;
  const raw = source.slice(start, end);
  const opening = raw.startsWith("![") ? 1 : raw.startsWith("[") ? 0 : -1;
  if (opening === -1) return null;
  const closing = findClosingBracket(raw, opening);
  return closing === -1
    ? null
    : { start: start + opening + 1, end: start + closing };
}

function removeInnerLinkImageSpaces(
  collector: EditCollector,
  source: string,
  range: SourceRange,
  edges: { first: TypographyEdge | null; last: TypographyEdge | null },
): void {
  const raw = source.slice(range.start, range.end);
  if (edges.first === "cjk") {
    const end = leadingWhitespaceEnd(raw);
    if (end > 0) collector.add(range.start, range.start + end);
  }
  if (edges.last === "cjk") {
    const start = trailingWhitespaceStart(raw);
    if (start < raw.length) collector.add(range.start + start, range.end);
  }
}

function removeOuterLinkImageSpaces(
  collector: EditCollector,
  source: string,
  range: SourceRange,
  edges: { first: TypographyEdge | null; last: TypographyEdge | null },
): void {
  let before = range.start;
  while (
    before > 0 &&
    (source[before - 1] === " " || source[before - 1] === "\t")
  )
    before--;
  if (before < range.start) {
    const left = typographyEdgeBefore(source, before);
    if (
      left === "cjk" ||
      edges.first === "cjk" ||
      shouldRemoveSpacing(left, edges.first)
    )
      collector.add(before, range.start);
  }

  let after = range.end;
  while (
    after < source.length &&
    (source[after] === " " || source[after] === "\t")
  )
    after++;
  if (after > range.end) {
    const right = typographyEdgeAt(source, after);
    if (
      edges.last === "cjk" ||
      right === "cjk" ||
      shouldRemoveSpacing(edges.last, right)
    )
      collector.add(range.end, after);
  }
}

function markdownLinkImageBoundaries(
  source: string,
  node: AstNode,
  offsetBase: number,
): {
  range: SourceRange;
  label: SourceRange | null;
  edges: { first: TypographyEdge | null; last: TypographyEdge | null };
} | null {
  const relativeStart = nodeOffset(node, "start");
  const relativeEnd = nodeOffset(node, "end");
  if (relativeStart === null || relativeEnd === null) return null;

  if (node.type === "image" || node.type === "imageReference") {
    const edges = markdownEdges(node.alt ?? "");
    return {
      range: {
        start: offsetBase + relativeStart,
        end: offsetBase + relativeEnd,
      },
      label: rawMarkdownLabelRange(source, node, offsetBase),
      edges,
    };
  }
  if (node.type === "link" || node.type === "linkReference") {
    return {
      range: {
        start: offsetBase + relativeStart,
        end: offsetBase + relativeEnd,
      },
      label: rawMarkdownLabelRange(source, node, offsetBase),
      edges: visibleEdges(
        (node.children ?? []).flatMap((child) =>
          flattenInlineNode(child, source, offsetBase, false),
        ),
      ),
    };
  }
  return null;
}

function mdxLinkImageBoundaries(
  source: string,
  node: AstNode,
  offsetBase: number,
): {
  range: SourceRange;
  edges: { first: TypographyEdge | null; last: TypographyEdge | null };
} | null {
  if (node.type !== "mdxJsxTextElement" && node.type !== "mdxJsxFlowElement")
    return null;
  const relativeStart = nodeOffset(node, "start");
  const relativeEnd = nodeOffset(node, "end");
  if (relativeStart === null || relativeEnd === null) return null;
  const name = node.name?.toLowerCase();
  const range = {
    start: offsetBase + relativeStart,
    end: offsetBase + relativeEnd,
  };
  if (name === "img") {
    return {
      range,
      edges: markdownEdges(mdxStringAttribute(node, "alt") ?? ""),
    };
  }
  if (name === "a") {
    return {
      range,
      edges: visibleEdges(
        (node.children ?? []).flatMap((child) =>
          flattenInlineNode(child, source, offsetBase, false),
        ),
      ),
    };
  }
  return null;
}

function htmlLinkImageBoundaries(
  source: string,
  node: AstNode,
  offsetBase: number,
): {
  range: SourceRange;
  edges: { first: TypographyEdge | null; last: TypographyEdge | null };
} | null {
  if (node.type !== "html" || typeof node.value !== "string") return null;
  const relativeStart = nodeOffset(node, "start");
  const relativeEnd = nodeOffset(node, "end");
  if (relativeStart === null || relativeEnd === null) return null;
  const start = offsetBase + relativeStart;
  const end = offsetBase + relativeEnd;
  const raw = source.slice(start, end);

  if (/^<img\b/iu.test(raw)) {
    const match = /\balt\s*=\s*(["'])([\s\S]*?)\1/iu.exec(raw);
    return {
      range: { start, end },
      edges: markdownEdges(match?.[2] ?? ""),
    };
  }

  if (/^<a\b/iu.test(raw)) {
    const closing = /<\/a\s*>/iu.exec(source.slice(end));
    if (!closing) return null;
    const contentEnd = end + closing.index;
    const content = decodeHtmlText(source.slice(end, contentEnd));
    return {
      range: { start, end: contentEnd + closing[0].length },
      edges: markdownEdges(content),
    };
  }
  return null;
}

function normalizeLinkImageBoundaries(
  collector: EditCollector,
  source: string,
  node: AstNode,
  offsetBase: number,
): void {
  const markdown = markdownLinkImageBoundaries(source, node, offsetBase);
  const mdx = mdxLinkImageBoundaries(source, node, offsetBase);
  const html = htmlLinkImageBoundaries(source, node, offsetBase);
  const boundary = markdown ?? mdx ?? html;
  if (!boundary) return;
  removeOuterLinkImageSpaces(collector, source, boundary.range, boundary.edges);
  if (markdown?.label)
    removeInnerLinkImageSpaces(
      collector,
      source,
      markdown.label,
      markdown.edges,
    );
}

function normalizeImageAlt(
  collector: EditCollector,
  source: string,
  node: AstNode,
  offsetBase: number,
): void {
  if (typeof node.alt !== "string" || !node.alt) return;
  const relativeStart = nodeOffset(node, "start");
  const relativeEnd = nodeOffset(node, "end");
  if (relativeStart === null || relativeEnd === null) return;
  const start = offsetBase + relativeStart;
  const end = offsetBase + relativeEnd;
  const raw = source.slice(start, end);
  const opening = raw.startsWith("![") ? 1 : raw.indexOf("![");
  if (opening < 0) return;
  const closing = findClosingBracket(raw, opening);
  if (closing === -1) return;
  normalizeEmbeddedText(collector, source, {
    start: start + opening + 2,
    end: start + closing,
  });
}

function normalizeMarkdownTitle(
  collector: EditCollector,
  source: string,
  node: AstNode,
  offsetBase: number,
): void {
  if (!node.title) return;
  const relativeStart = nodeOffset(node, "start");
  const relativeEnd = nodeOffset(node, "end");
  if (relativeStart === null || relativeEnd === null) return;
  const start = offsetBase + relativeStart;
  const end = offsetBase + relativeEnd;
  const raw = source.slice(start, end);
  for (const pattern of [
    `"${node.title.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`,
    `'${node.title.replaceAll("\\", "\\\\").replaceAll("'", "\\'")}'`,
    `(${node.title})`,
  ]) {
    const index = raw.indexOf(pattern);
    if (index === -1) continue;
    normalizeEmbeddedText(collector, source, {
      start: start + index + 1,
      end: start + index + pattern.length - 1,
    });
    return;
  }
}

function normalizeHtmlVisibleAttributes(
  collector: EditCollector,
  source: string,
  node: AstNode,
  offsetBase: number,
): void {
  if (node.type !== "html" || typeof node.value !== "string") return;
  const relativeStart = nodeOffset(node, "start");
  const relativeEnd = nodeOffset(node, "end");
  if (relativeStart === null || relativeEnd === null) return;
  const start = offsetBase + relativeStart;
  const end = offsetBase + relativeEnd;
  const raw = source.slice(start, end);
  for (const match of raw.matchAll(
    /\b([A-Za-z_:][A-Za-z0-9_.:-]*)\s*=\s*(["'])([\s\S]*?)\2/gu,
  )) {
    const name = match[1]?.toLowerCase();
    if (!name || !visibleAttributeNames.has(name) || match.index === undefined)
      continue;
    const whole = match[0];
    const quoteIndex = whole.search(/["']/u);
    if (quoteIndex === -1) continue;
    const valueStart = start + match.index + quoteIndex + 1;
    normalizeEmbeddedText(collector, source, {
      start: valueStart,
      end: valueStart + (match[3]?.length ?? 0),
    });
  }
}

function normalizeVisibleProperties(
  collector: EditCollector,
  node: AstNode,
  source: string,
  offsetBase: number,
): void {
  const relativeStart = nodeOffset(node, "start");
  const relativeEnd = nodeOffset(node, "end");
  if (relativeStart === null || relativeEnd === null) return;
  const start = offsetBase + relativeStart;
  const end = offsetBase + relativeEnd;

  if (node.type === "code" && typeof node.meta === "string")
    normalizedAttributeRange(source, start, end, "title", collector);

  if (
    node.type === "containerDirective" ||
    node.type === "leafDirective" ||
    node.type === "textDirective"
  ) {
    if (node.attributes && !Array.isArray(node.attributes)) {
      for (const name of Object.keys(node.attributes)) {
        if (visibleAttributeNames.has(name))
          normalizedAttributeRange(source, start, end, name, collector);
      }
    }
  }

  if (node.type === "mdxJsxTextElement" || node.type === "mdxJsxFlowElement") {
    for (const attribute of Array.isArray(node.attributes)
      ? node.attributes
      : []) {
      if (
        attribute.name &&
        visibleAttributeNames.has(attribute.name) &&
        typeof attribute.value === "string"
      ) {
        const attributeStart = attribute.position?.start?.offset;
        const attributeEnd = attribute.position?.end?.offset;
        if (
          attributeStart !== null &&
          attributeStart !== undefined &&
          attributeEnd !== null &&
          attributeEnd !== undefined
        ) {
          const range = attributeValueRange(
            source,
            offsetBase + attributeStart,
            offsetBase + attributeEnd,
            attribute.name,
          );
          if (range) normalizeEmbeddedText(collector, source, range);
        }
      }
    }
  }

  normalizeLinkImageBoundaries(collector, source, node, offsetBase);

  if (node.type === "html")
    normalizeHtmlVisibleAttributes(collector, source, node, offsetBase);
  if (node.type === "image" || node.type === "imageReference")
    normalizeImageAlt(collector, source, node, offsetBase);
  if (
    node.type === "definition" ||
    node.type === "image" ||
    node.type === "link"
  )
    normalizeMarkdownTitle(collector, source, node, offsetBase);
}

function normalizeMarkdownCodeBlock(
  collector: EditCollector,
  source: string,
  node: AstNode,
  offsetBase: number,
): void {
  const language = node.lang?.trim().toLowerCase();
  if (!language || !markdownCodeBlockLanguages.has(language)) return;
  const sourceMap = codeBlockValueSourceMap(node, source, offsetBase);
  if (!sourceMap || typeof node.value !== "string") return;
  const result = normalizeMarkdownBody(
    node.value,
    node.value,
    0,
    language === "mdx",
    { normalizeMarkdownCodeBlocks: false },
  );
  const edits = result.edits.flatMap((edit) => {
    const start = sourceMap.starts[edit.start];
    const end = sourceMap.ends[edit.end - 1];
    return start === undefined || end === undefined
      ? []
      : [{ start, end, count: edit.count }];
  });
  if (edits.length !== result.edits.length) return;
  for (const edit of edits) collector.add(edit.start, edit.end, edit.count);
}

const inlineContainers = new Set([
  "delete",
  "emphasis",
  "heading",
  "leafDirective",
  "link",
  "linkReference",
  "mdxJsxTextElement",
  "paragraph",
  "strong",
  "tableCell",
  "textDirective",
]);

function normalizeMarkdownBody(
  source: string,
  treeSource: string,
  offsetBase: number,
  mdx: boolean,
  options: MarkdownBodyOptions = {},
): SpacingResult {
  const { normalizeMarkdownCodeBlocks = true, placeholders = false } = options;
  const tree = parseContent(treeSource, mdx) as unknown as AstNode;
  const collector = new EditCollector();
  const visitedText = new Set<AstNode>();

  const visit = (node: AstNode): void => {
    if (node.type === "text" && !visitedText.has(node)) {
      visitedText.add(node);
      const leaf = textLeaf(node, source, offsetBase);
      if (leaf) normalizeTextInternals(collector, leaf);
    }
    normalizeVisibleProperties(collector, node, source, offsetBase);
    if (node.type === "code" && normalizeMarkdownCodeBlocks)
      normalizeMarkdownCodeBlock(collector, source, node, offsetBase);
    if (inlineContainers.has(node.type) && node.children)
      processInlineChildren(
        collector,
        node.children,
        source,
        offsetBase,
        placeholders,
      );
    for (const child of node.children ?? []) visit(child);
  };

  visit(tree);
  return astSafeBodyResult(
    tree,
    source,
    treeSource,
    offsetBase,
    mdx,
    collector.finish(source),
  );
}

function normalizeMarkdownString(
  source: string,
  placeholders = false,
): SpacingResult {
  const tree = parseMarkdownText(source) as unknown as AstNode;
  const collector = new EditCollector();
  const visitedText = new Set<AstNode>();
  const visit = (node: AstNode): void => {
    if (node.type === "text" && !visitedText.has(node)) {
      visitedText.add(node);
      const leaf = textLeaf(node, source, 0);
      if (leaf) normalizeTextInternals(collector, leaf);
    }
    normalizeVisibleProperties(collector, node, source, 0);
    if (inlineContainers.has(node.type) && node.children)
      processInlineChildren(collector, node.children, source, 0, placeholders);
    for (const child of node.children ?? []) visit(child);
  };
  visit(tree);
  return astSafeBodyResult(
    tree,
    source,
    source,
    0,
    false,
    collector.finish(source),
  );
}

function canonicalStringValue(value: unknown): unknown {
  if (typeof value === "string") return value.replace(/[ \t]/g, "");
  if (Array.isArray(value)) return value.map(canonicalStringValue);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [
      key,
      canonicalStringValue(entry),
    ]),
  );
}

function canonicalAst(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalAst);
  if (!value || typeof value !== "object") return canonicalStringValue(value);
  const record = Object.fromEntries(
    Object.entries(value)
      .filter(
        ([key]) =>
          key !== "position" &&
          key !== "start" &&
          key !== "end" &&
          key !== "loc" &&
          key !== "range",
      )
      .map(([key, entry]) => [key, canonicalAst(entry)]),
  ) as Record<string, unknown>;
  if (Array.isArray(record["children"])) {
    const children: unknown[] = [];
    for (const child of record["children"]) {
      const previous = children.at(-1);
      if (
        previous &&
        typeof previous === "object" &&
        typeof child === "object" &&
        (previous as Record<string, unknown>)["type"] === "text" &&
        (child as Record<string, unknown>)["type"] === "text"
      ) {
        const previousRecord = previous as Record<string, unknown>;
        const childRecord = child as Record<string, unknown>;
        previousRecord["value"] =
          String(previousRecord["value"] ?? "") +
          String(childRecord["value"] ?? "");
      } else {
        children.push(child);
      }
    }
    record["children"] = children.filter((child, index, all) => {
      if (
        !child ||
        typeof child !== "object" ||
        (child as Record<string, unknown>)["type"] !== "text" ||
        (child as Record<string, unknown>)["value"] !== ""
      )
        return true;
      const isLinkImage = (candidate: unknown): boolean => {
        if (!candidate || typeof candidate !== "object") return false;
        const node = candidate as Record<string, unknown>;
        const type = node["type"];
        if (
          type === "link" ||
          type === "linkReference" ||
          type === "image" ||
          type === "imageReference"
        )
          return true;
        if (type === "mdxJsxTextElement" || type === "mdxJsxFlowElement") {
          const name = String(node["name"] ?? "").toLowerCase();
          return name === "a" || name === "img";
        }
        return (
          type === "html" &&
          /<(?:a|img)\b|<\/a\s*>/iu.test(String(node["value"] ?? ""))
        );
      };
      return !isLinkImage(all[index - 1]) && !isLinkImage(all[index + 1]);
    });
  }
  return record;
}

function canonicalEqual(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function applySourceEdits(
  source: string,
  edits: readonly SpacingEdit[],
  offsetBase: number,
): string {
  let result = source;
  for (const edit of [...edits].sort(
    (left, right) => right.start - left.start,
  )) {
    result =
      result.slice(0, edit.start - offsetBase) +
      result.slice(edit.end - offsetBase);
  }
  return result;
}

function resultFromEdits(source: string, edits: SpacingEdit[]): SpacingResult {
  const collector = new EditCollector();
  for (const edit of edits) collector.add(edit.start, edit.end, edit.count);
  return collector.finish(source);
}

function astSafeBodyResult(
  tree: AstNode,
  source: string,
  treeSource: string,
  offsetBase: number,
  mdx: boolean,
  result: SpacingResult,
): SpacingResult {
  if (result.edits.length === 0) return result;
  const expected = canonicalAst(tree);
  const editsAreSafe = (edits: readonly SpacingEdit[]): boolean => {
    const candidateSource = applySourceEdits(treeSource, edits, offsetBase);
    const actual = canonicalAst(parseContent(candidateSource, mdx));
    return canonicalEqual(actual, expected);
  };

  if (editsAreSafe(result.edits)) return resultFromEdits(source, result.edits);

  const individuallySafe = result.edits.filter((edit) => editsAreSafe([edit]));
  const accepted: SpacingEdit[] = [];
  for (const edit of individuallySafe) {
    if (editsAreSafe([...accepted, edit])) accepted.push(edit);
  }
  return resultFromEdits(source, accepted);
}

function encodeYamlScalar(node: LocatedStringScalar, value: string): string {
  switch (node.type) {
    case "QUOTE_DOUBLE":
      return JSON.stringify(value);
    case "QUOTE_SINGLE":
      return `'${value.replaceAll("'", "''")}'`;
    case "BLOCK_FOLDED":
    case "BLOCK_LITERAL": {
      const encoded = stringifyYaml(value, { lineWidth: 0 }).trimEnd();
      const keyIndent =
        node.srcToken && "indent" in node.srcToken
          ? Math.max(0, node.srcToken.indent)
          : 0;
      return encoded.replaceAll("\n", `\n${" ".repeat(keyIndent)}`);
    }
    default:
      return value.includes("\n") ? JSON.stringify(value) : value;
  }
}

function walkYamlValues(
  node: YamlNode | null | undefined,
  visit: (scalar: LocatedStringScalar) => void,
): void {
  if (!node) return;
  if (isScalar(node)) {
    const scalar = node as Scalar.Parsed;
    if (typeof scalar.value === "string" && scalar.range)
      visit(scalar as LocatedStringScalar);
    return;
  }
  if (isMap(node)) {
    for (const pair of node.items)
      if (isNode(pair.value)) walkYamlValues(pair.value, visit);
    return;
  }
  if (isSeq(node)) {
    for (const item of node.items)
      if (isNode(item)) walkYamlValues(item, visit);
  }
}

function yamlValuePatches(
  source: string,
  offsetBase: number,
  encode: (node: LocatedStringScalar, value: string) => string,
): SourcePatch[] {
  const document = parseYamlDocument(source);
  const patches: SourcePatch[] = [];
  walkYamlValues(document.contents, (scalar) => {
    const normalized = normalizeMarkdownString(scalar.value);
    if (normalized.edits.length === 0 || scalar.range === undefined) return;
    const [start, end] = scalar.range;
    patches.push({
      start: offsetBase + start,
      end: offsetBase + end,
      replacement: encode(scalar, normalized.source),
      count: normalized.edits.reduce((count, edit) => count + edit.count, 0),
    });
  });
  return patches;
}

function normalizeJsonSource(source: string): SpacingResult {
  JSON.parse(source);
  const collector = new EditCollector();
  const document = parseYamlDocument(source);
  walkYamlValues(document.contents, (scalar) => {
    const normalized = normalizeMarkdownString(scalar.value, true);
    if (normalized.edits.length === 0 || scalar.range === undefined) return;
    const [start, end] = scalar.range;
    const sourceMap = mapJsonStringSource(
      source.slice(start, end),
      scalar.value,
      start,
    );
    if (!sourceMap) return;
    for (const edit of normalized.edits) {
      const sourceStart = sourceMap.starts[edit.start];
      const sourceEnd = sourceMap.ends[edit.end - 1];
      if (sourceStart !== undefined && sourceEnd !== undefined)
        collector.add(sourceStart, sourceEnd, edit.count);
    }
  });
  return collector.finish(source);
}

export function normalizeMarkdownSource(
  source: string,
  mdx = false,
  options: MarkdownBodyOptions = {},
): SpacingResult {
  return normalizeMarkdownBody(source, source, 0, mdx, options);
}

export function normalizeContentSource(
  source: string,
  mdx = true,
): SpacingResult {
  const parts = splitFrontMatter(source);
  const collector = new EditCollector();
  if (
    parts.frontMatter !== undefined &&
    parts.frontMatterOffset !== undefined
  ) {
    const patches = yamlValuePatches(
      parts.frontMatter,
      parts.frontMatterOffset,
      encodeYamlScalar,
    );
    const candidate = new EditCollector();
    for (const patch of patches)
      candidate.replace(patch.start, patch.end, patch.replacement, patch.count);
    const expected = canonicalStringValue(parseFrontMatter(source).data);
    const actual = canonicalStringValue(
      parseFrontMatter(candidate.finish(source).source).data,
    );
    if (canonicalEqual(expected, actual)) {
      for (const patch of patches)
        collector.replace(
          patch.start,
          patch.end,
          patch.replacement,
          patch.count,
        );
    }
  }
  for (const edit of normalizeMarkdownBody(
    source,
    parts.content,
    parts.contentOffset,
    mdx,
  ).edits)
    collector.add(edit.start, edit.end, edit.count);
  return collector.finish(source);
}

export function normalizeJsonTextSource(source: string): SpacingResult {
  return normalizeJsonSource(source);
}

function supportedFile(file: string): boolean {
  return /\.(?:md|mdx|json)$/iu.test(file);
}

async function walkFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map(async (entry) => {
        const entryPath = path.join(directory, entry.name);
        if (entry.isDirectory()) return walkFiles(entryPath);
        return entry.isFile() && supportedFile(entryPath) ? [entryPath] : [];
      }),
    )
  ).flat();
}

async function pathFiles(target: string): Promise<string[]> {
  const targetStat = await stat(target);
  if (targetStat.isDirectory()) return walkFiles(target);
  if (!targetStat.isFile()) throw new Error(`Unsupported target: ${target}`);
  if (!supportedFile(target))
    throw new Error(`Unsupported file extension: ${target}`);
  return [target];
}

async function directoryExists(directory: string): Promise<boolean> {
  try {
    return (await stat(directory)).isDirectory();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

async function defaultFiles(): Promise<string[]> {
  const targets = [
    path.join(root, "content"),
    path.join(root, "docs"),
    path.join(root, ".agents"),
    path.join(root, "README.md"),
    path.join(root, "AGENTS.md"),
    path.join(root, "messages"),
    path.join(root, "src/demos/metadata"),
  ];
  const privateContent = path.join(privateRoot, "content");
  if (await directoryExists(privateContent)) targets.push(privateContent);
  return (await Promise.all(targets.map(pathFiles))).flat();
}

function normalizeFile(file: string, source: string): SpacingResult {
  if (/\.json$/iu.test(file)) return normalizeJsonSource(source);
  return normalizeContentSource(source, /\.mdx$/iu.test(file));
}

function parseCli(argv: string[]): {
  mode: SpacingMode;
  targets: string[];
} {
  if (argv.includes("--help") || argv.includes("-h")) {
    console.info(
      "Usage: tsx scripts/cjk-spacing.ts <--check|--scan|--write> [file-or-directory ...]",
    );
    process.exit(0);
  }
  const flags = argv.filter((argument) => argument.startsWith("--"));
  const flag = flags[0];
  const selectedMode = flag?.slice(2);
  if (flags.length !== 1 || !selectedMode || !isSpacingMode(selectedMode))
    throw new Error("Expected exactly one of --check, --scan, or --write.");
  return {
    mode: selectedMode,
    targets: argv.filter((argument) => !argument.startsWith("--")),
  };
}

function lineAndColumn(source: string, offset: number): string {
  const before = source.slice(0, offset);
  const line = before.split(/\r?\n/u).length;
  const column =
    offset - Math.max(before.lastIndexOf("\n"), before.lastIndexOf("\r"));
  return `${line}:${column}`;
}

async function scanFiles(files: string[]): Promise<void> {
  let candidateFiles = 0;
  let candidateTokens = 0;
  for (const file of files) {
    const source = await readFile(file, "utf8");
    const candidates = findSpacingCandidates(source);
    if (candidates.length === 0) continue;
    candidateFiles++;
    candidateTokens += candidates.reduce(
      (count, candidate) => count + candidate.count,
      0,
    );
    const display = path.relative(root, file);
    for (const candidate of candidates)
      console.warn(
        `[cjk-spacing] warning: ${display}:${lineAndColumn(source, candidate.start)}: ${candidate.count} spacing candidate(s)`,
      );
  }
  console.warn(
    `[cjk-spacing] Scanned ${files.length} file(s); ${candidateFiles} file(s), ${candidateTokens} spacing candidate(s).`,
  );
}

async function main(): Promise<void> {
  const { mode, targets } = parseCli(process.argv.slice(2));
  const files = (
    targets.length === 0
      ? await defaultFiles()
      : (
          await Promise.all(
            targets.map((target) => pathFiles(path.resolve(root, target))),
          )
        ).flat()
  )
    .map((file) => path.resolve(file))
    .filter((file, index, all) => all.indexOf(file) === index)
    .sort((left, right) => left.localeCompare(right));

  if (mode === "scan") {
    await scanFiles(files);
    return;
  }

  let changedFiles = 0;
  let removedTokens = 0;
  for (const file of files) {
    const source = await readFile(file, "utf8");
    const result = normalizeFile(file, source);
    if (result.edits.length === 0) continue;
    changedFiles++;
    removedTokens += result.edits.reduce(
      (count, edit) => count + edit.count,
      0,
    );
    const display = path.relative(root, file);
    if (mode === "write") {
      await writeFile(file, result.source);
      console.info(`[cjk-spacing] ${display}: ${result.edits.length}`);
    } else {
      const first = result.edits[0]!;
      console.error(
        `[cjk-spacing] ${display}:${lineAndColumn(source, first.start)}: ${result.edits.length} spacing token(s)`,
      );
    }
  }

  if (mode === "check" && changedFiles > 0) {
    console.error(
      `[cjk-spacing] ${changedFiles} file(s), ${removedTokens} spacing token(s) found.`,
    );
    if (shouldShowSpacingPreservationHint)
      console.info(spacingPreservationHint);
    process.exitCode = 1;
    return;
  }
  console.info(
    `[cjk-spacing] ${mode === "write" ? "Updated" : "Checked"} ${files.length} file(s); ${changedFiles} changed, ${removedTokens} spacing token(s) removed.`,
  );
  if (shouldShowSpacingPreservationHint) console.info(spacingPreservationHint);
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) {
  void main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
