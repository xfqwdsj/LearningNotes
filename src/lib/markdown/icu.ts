import { defaultLocale, timeZone } from "@/i18n/config";
import {
  parse,
  TYPE,
  type MessageFormatElement,
} from "@formatjs/icu-messageformat-parser";
import { IntlMessageFormat, type Formatters } from "intl-messageformat";
import { renderToString } from "katex";
import { katexOptions } from "@/lib/math";
import type { Root, Nodes, PhrasingContent } from "mdast";
import {
  parseMarkdownText,
  markdownPlainText,
  renderMarkdownTree,
  renderMarkdownValue,
  normalizeSingleLine,
  prepareImageAlts,
  stringifyMarkdownText,
} from "./render";
import type { MarkdownFragment, MarkdownOptions, MarkdownValue } from "./types";
const formatters: Formatters = {
  getNumberFormat: (locales, options) =>
    new Intl.NumberFormat(locales, options),
  getDateTimeFormat: (locales, options) =>
    new Intl.DateTimeFormat(locales, { ...options, timeZone }),
  getPluralRules: (locales, options) => new Intl.PluralRules(locales, options),
};
export type IcuValues = Record<string, string | number | Date | MarkdownValue>;
function isTexArgument(prefix: string): boolean {
  let remaining = prefix.trimEnd();
  if (/[_^]$/.test(remaining)) return true;
  while (/[}\]]$/.test(remaining)) {
    const closing = remaining.at(-1)!;
    const opening = closing === "}" ? "{" : "[";
    let depth = 0,
      index = remaining.length - 1;
    for (; index >= 0; index--) {
      if (remaining[index] === closing) depth++;
      if (remaining[index] === opening && --depth === 0) break;
    }
    if (index < 0) return false;
    remaining = remaining.slice(0, index).trimEnd();
  }
  return /\\[a-zA-Z]+$/.test(remaining);
}
/** TeX groups are literal ICU braces; named arguments inside math remain ICU nodes. */
function mathBraces(template: string): string {
  return template.replace(/\$\$?[\s\S]*?\$\$?/g, (math) => {
    const placeholders: string[] = [];
    const literal = math.replace(
      /''([{}])''|'([{}])'/g,
      (_match, doubled: string, single: string) =>
        (doubled ?? single) === "{" ? "LNTEXOPEN" : "LNTEXCLOSE",
    );
    const masked = literal.replace(
      /\{([a-zA-Z_]\w*)(?:\s*,\s*(?:number|date|time)(?:\s*,[^{}]*)?)?\}/g,
      (match, _key: string, offset: number) => {
        if (isTexArgument(literal.slice(0, offset))) return match;
        placeholders.push(match);
        return `LNICUARG${placeholders.length - 1}END`;
      },
    );
    return masked
      .replace(/\{/g, "'{'")
      .replace(/\}/g, "'}'")
      .replace(/</g, "'<'")
      .replace(/LNTEXOPEN/g, "'{'")
      .replace(/LNTEXCLOSE/g, "'}'")
      .replace(
        /LNICUARG(\d+)END/g,
        (_match, index: string) => placeholders[Number(index)]!,
      );
  });
}
const cache = new Map<string, MessageFormatElement[]>();
export function parseIcuMarkdown(template: string): MessageFormatElement[] {
  let ast = cache.get(template);
  if (!ast) {
    const characters = template.split("");
    const mask = (node: Nodes) => {
      if (
        ["code", "inlineCode", "math", "inlineMath"].includes(node.type) &&
        node.position
      ) {
        characters.fill(
          " ",
          node.position.start.offset,
          node.position.end.offset,
        );
      } else if ("children" in node) node.children.forEach(mask);
    };
    mask(parseMarkdownText(template));
    if (/<\/?[a-zA-Z][\w:-]*(?:\s+[^>]*|\/)?>/.test(characters.join("")))
      throw new Error("Unsupported ICU XML tag");
    ast = parse(mathBraces(template), { ignoreTag: true });
    const validate = (nodes: MessageFormatElement[]) =>
      nodes.forEach((node) => {
        if (node.type === TYPE.tag)
          throw new Error(`Unsupported ICU XML tag: ${node.value}`);
        if (node.type === TYPE.select || node.type === TYPE.plural)
          Object.values(node.options).forEach((option) =>
            validate(option.value),
          );
      });
    validate(ast);
    if (cache.size >= 1000) cache.clear();
    cache.set(template, ast);
  }
  return ast;
}
interface ArgumentFragment {
  source: string;
  formatted: boolean;
  mathSource: string;
}
const argumentSource = (value: IcuValues[string]): string =>
  typeof value === "object" && !(value instanceof Date)
    ? value.markdown
    : String(value);
const scalarValue = (value: IcuValues[string]) =>
  typeof value === "object" && !(value instanceof Date) ? value.text : value;
export function resolveIcuMarkdown(
  template: string,
  values: IcuValues = {},
  locale: string = defaultLocale,
) {
  const atoms = new Map<string, ArgumentFragment>();
  const atom = (source: string, formatted = false, mathSource = source) => {
    const key = `LNATOM${atoms.size}END`;
    atoms.set(key, { source, formatted, mathSource });
    return key;
  };
  if (/LNATOM\d+END/.test(template))
    throw new Error("Reserved ICU atom in template");
  const get = (key: string) => {
    if (
      !Object.hasOwn(values, key) ||
      values[key] === undefined ||
      values[key] === null
    )
      throw new Error(`Missing ICU argument: ${key}`);
    return values[key]!;
  };
  function walk(nodes: MessageFormatElement[], pound?: number): string {
    return nodes
      .map((node) => {
        if (node.type === TYPE.literal) return node.value;
        if (node.type === TYPE.pound)
          return atom(new Intl.NumberFormat(locale).format(pound ?? 0), true);
        if (node.type === TYPE.tag)
          throw new Error(`Unsupported ICU XML tag: ${node.value}`);
        const argument = get(node.value);
        if (node.type === TYPE.argument)
          return atom(
            argumentSource(argument),
            false,
            typeof argument === "object" && !(argument instanceof Date)
              ? argument.text
              : argumentSource(argument),
          );
        const value = scalarValue(argument);
        if (node.type === TYPE.select)
          return walk(
            (node.options[String(value)] ?? node.options["other"])!.value,
            pound,
          );
        if (node.type === TYPE.plural) {
          if (typeof value !== "number" || !Number.isFinite(value))
            throw new Error(
              `ICU plural requires a finite number: ${node.value}`,
            );
          const count = value - node.offset;
          const rule = new Intl.PluralRules(locale, {
            type: node.pluralType,
          }).select(count);
          return walk(
            (node.options[`=${value}`] ??
              node.options[rule] ??
              node.options["other"])!.value,
            count,
          );
        }
        const formatted = new IntlMessageFormat([node], locale, undefined, {
          formatters,
        }).format({
          [node.value]: value,
        });
        return atom(String(formatted), true);
      })
      .join("");
  }
  const source = walk(parseIcuMarkdown(template));
  const raw = source.replace(/LNATOM\d+END/g, (key) => atoms.get(key)!.source);
  return { source, atoms, raw };
}

const argumentToken = /LNATOM\d+END/g;
const wholeArgument = /^LNATOM\d+END$/;
const validatedTex = new Set<string>();
/** Remove TeX comments without merging control words or touching verbatim/escaped percent signs. */
function withoutTexComments(source: string): string {
  let result = "";
  for (let index = 0; index < source.length; index++) {
    const char = source[index]!;
    if (char === "\\") {
      const verb = /^\\verb\*?([^a-zA-Z\s])/.exec(source.slice(index));
      if (verb) {
        const end = source.indexOf(verb[1]!, index + verb[0].length);
        if (end >= 0) {
          result += source.slice(index, end + 1);
          index = end;
          continue;
        }
      }
      result += char;
      if (index + 1 < source.length) result += source[++index];
    } else if (char === "%") {
      while (index + 1 < source.length && !/[\r\n]/.test(source[index + 1]!))
        index++;
      if (source[index + 1] === "\r") index++;
      if (source[index + 1] === "\n") index++;
      const word = /(\\+)[a-zA-Z]+$/.exec(result);
      if (
        word &&
        word[1]!.length % 2 === 1 &&
        /[a-zA-Z]/.test(source[index + 1] ?? "")
      )
        result += " ";
    } else result += char;
  }
  return result;
}
function texArgument(argument: ArgumentFragment): string {
  // Explicit Intl formatting produces display text; other arguments are author-supplied TeX.
  const original = argument.formatted
    ? "\\text{" +
      argument.source.replace(
        /[\\{}$%&#_^~]/g,
        (char) =>
          ({
            "\\": "\\textbackslash{}",
            "{": "\\{",
            "}": "\\}",
            $: "\\$",
            "%": "\\%",
            "&": "\\&",
            "#": "\\#",
            _: "\\_",
            "^": "\\textasciicircum{}",
            "~": "\\textasciitilde{}",
          })[char]!,
      ) +
      "}"
    : argument.mathSource;
  if (!validatedTex.has(original)) {
    try {
      renderToString(original, { ...katexOptions, throwOnError: true });
    } catch (error) {
      throw new Error(
        "Invalid TeX argument fragment: " +
          (error instanceof Error ? error.message : String(error)),
      );
    }
    if (validatedTex.size >= 512) validatedTex.clear();
    validatedTex.add(original);
  }
  return "{" + withoutTexComments(original) + "}";
}

/** Bind references before grafting a fragment so definitions cannot cross argument boundaries. */
function bindReferences(tree: Root): Root {
  const definitions = new Map<string, Extract<Nodes, { type: "definition" }>>();
  function gather(node: Nodes) {
    if (node.type === "definition") definitions.set(node.identifier, node);
    if ("children" in node) node.children.forEach(gather);
  }
  gather(tree);
  function bind(node: Nodes): Nodes[] {
    if (node.type === "definition") return [];
    if (node.type === "linkReference" || node.type === "imageReference") {
      const definition = definitions.get(node.identifier);
      if (!definition)
        return node.type === "linkReference"
          ? node.children
          : [{ type: "text", value: node.alt ?? "" }];
      if (node.type === "linkReference")
        return [
          {
            type: "link",
            url: definition.url,
            title: definition.title,
            children: node.children.flatMap(bind) as PhrasingContent[],
          },
        ];
      return [
        {
          type: "image",
          url: definition.url,
          title: definition.title,
          alt: node.alt,
        },
      ];
    }
    if ("children" in node)
      node.children = node.children.flatMap(bind) as typeof node.children;
    return [node];
  }
  bind(tree);
  return tree;
}

export function renderIcuMarkdownFragment(
  template: string,
  values: IcuValues = {},
  options: MarkdownOptions & { locale?: string } = {},
): MarkdownFragment {
  const { source, atoms } = resolveIcuMarkdown(
    template,
    values,
    options.locale,
  );
  const tree = parseMarkdownText(source);
  const argumentTree = (argument: ArgumentFragment): Root =>
    argument.formatted
      ? {
          type: "root",
          children: [
            {
              type: "paragraph",
              children: [{ type: "text", value: argument.source }],
            },
          ],
        }
      : bindReferences(parseMarkdownText(argument.source));
  const inlineArgument = (argument: ArgumentFragment): PhrasingContent[] => {
    if (!argument.source.trim())
      return [{ type: "text", value: argument.source }];
    const normalized = normalizeSingleLine(argumentTree(argument), options);
    const paragraph = normalized.children[0];
    return paragraph?.type === "paragraph" ? paragraph.children : [];
  };
  const literal = (value: string) =>
    value.replace(argumentToken, (key) => atoms.get(key)!.source);
  const plain = (value: string) =>
    value.replace(argumentToken, (key) =>
      markdownPlainText(argumentTree(atoms.get(key)!)),
    );
  function fill(node: Nodes): Nodes[] {
    if (
      node.type === "paragraph" &&
      node.children.length === 1 &&
      node.children[0]?.type === "text" &&
      wholeArgument.test(node.children[0].value)
    ) {
      return argumentTree(atoms.get(node.children[0].value)!).children;
    }
    if (node.type === "text") {
      const result: PhrasingContent[] = [];
      let offset = 0;
      for (const match of node.value.matchAll(argumentToken)) {
        if (match.index > offset)
          result.push({
            type: "text",
            value: node.value.slice(offset, match.index),
          });
        result.push(...inlineArgument(atoms.get(match[0])!));
        offset = match.index + match[0].length;
      }
      if (offset < node.value.length)
        result.push({ type: "text", value: node.value.slice(offset) });
      return result;
    }
    if (node.type === "math" || node.type === "inlineMath") {
      node.value = node.value.replace(argumentToken, (key) =>
        texArgument(atoms.get(key)!),
      );
      // Parser-generated HAST hints must reflect the newly resolved TeX as well.
      if (node.data?.hChildren)
        node.data.hChildren = [{ type: "text", value: node.value }];
      return [node];
    }
    if (node.type === "code" || node.type === "inlineCode")
      node.value = literal(node.value);
    if (
      node.type === "link" ||
      node.type === "image" ||
      node.type === "definition"
    ) {
      node.url = literal(node.url);
      if (node.title) node.title = plain(node.title);
    }
    if (node.type === "image" || node.type === "imageReference") {
      if (node.alt) node.alt = plain(node.alt);
    }
    if ("children" in node)
      node.children = node.children.flatMap(fill) as typeof node.children;
    return [node];
  }
  fill(tree);
  bindReferences(tree);
  prepareImageAlts(tree);
  return {
    markdown: stringifyMarkdownText(tree),
    tree,
  };
}

export function renderIcuMarkdown(
  template: string,
  values: IcuValues = {},
  options: MarkdownOptions & { locale?: string } = {},
): MarkdownValue {
  return renderMarkdownValue(
    renderIcuMarkdownFragment(template, values, options),
    {
      mode: "single-line",
      ...options,
    },
  );
}

/** Validate every authored branch, including translations not selected by the current UI. */
export function validateIcuMarkdown(template: string): void {
  const validate = (nodes: MessageFormatElement[]) => {
    let source = "";
    for (const node of nodes) {
      if (node.type === TYPE.literal) source += node.value;
      else if (node.type === TYPE.select || node.type === TYPE.plural) {
        for (const option of Object.values(node.options))
          validate(option.value);
        source += "argument";
      } else source += "argument";
    }
    renderMarkdownTree(parseMarkdownText(source), { mode: "single-line" });
  };
  validate(parseIcuMarkdown(template));
}
