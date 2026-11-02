import { z } from "zod";
import { defaultLocale, canonicalContentLocale } from "@/i18n/config";
import { localizedValue } from "@/i18n/content";
import { renderMarkdownSource } from "@/lib/markdown/render";
import { validateIcuMarkdown, parseIcuMarkdown } from "@/lib/markdown/icu";
import type { DemoTranslation } from "./types";
const definitionSchema = z
  .object({
    subject: z.string().min(1),
    locales: z.record(
      z.string(),
      z
        .object({
          title: z.string().min(1),
          description: z.string().min(1),
          tags: z.array(z.string().min(1)),
          messages: z.record(z.string(), z.string()),
        })
        .strict(),
    ),
  })
  .strict();
function argumentsOf(message: string) {
  const names = new Set<string>();
  const visit = (nodes: ReturnType<typeof parseIcuMarkdown>) =>
    nodes.forEach((node) => {
      if (node.type !== 0 && node.type !== 7) names.add(node.value);
      if (node.type === 5 || node.type === 6)
        Object.values(node.options).forEach((option) => visit(option.value));
    });
  visit(parseIcuMarkdown(message));
  return [...names].sort();
}
export function prepareDemoDefinition(value: unknown) {
  const definition = definitionSchema.parse(value);
  const translations: Record<string, DemoTranslation> = {};
  const defaultMessages = definition.locales[defaultLocale]?.messages;
  if (!defaultMessages)
    throw new Error(`Missing default demo translation: ${defaultLocale}`);
  for (const [locale, translation] of Object.entries(definition.locales)) {
    if (canonicalContentLocale(locale) !== locale)
      throw new Error(`Non-canonical demo locale: ${locale}`);
    const expected = Object.keys(defaultMessages).sort();
    if (
      JSON.stringify(Object.keys(translation.messages).sort()) !==
      JSON.stringify(expected)
    )
      throw new Error(`Demo message keys differ in ${locale}`);
    for (const [key, message] of Object.entries(translation.messages)) {
      validateIcuMarkdown(message);
      if (
        JSON.stringify(argumentsOf(message)) !==
        JSON.stringify(argumentsOf(defaultMessages[key]!))
      )
        throw new Error(`Demo ICU arguments differ in ${locale}/${key}`);
    }
    translations[locale] = {
      title: renderMarkdownSource(translation.title, {
        mode: "single-line",
        linkPolicy: "plain",
      }),
      description: renderMarkdownSource(translation.description, {
        mode: "summary",
      }),
      tags: translation.tags.map((tag) =>
        renderMarkdownSource(tag, {
          mode: "single-line",
          linkPolicy: "plain",
        }),
      ),
      messages: translation.messages,
    };
  }
  return {
    subject: definition.subject,
    translations,
    ...localizedValue(translations, defaultLocale),
  };
}
