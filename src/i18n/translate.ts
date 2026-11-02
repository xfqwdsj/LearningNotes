import { createContentFormatter } from "./format";
import { createTranslator } from "next-intl";
import { defaultLocale, resolveUiLocale } from "./config";
import { getMessages } from "./messages";
export function createUiTranslator(locale: string = defaultLocale) {
  return createTranslator({
    locale: resolveUiLocale(locale),
    messages: getMessages(locale),
  });
}
export function createUiFormatter(locale: string = defaultLocale) {
  return createContentFormatter(resolveUiLocale(locale));
}
export type UiTranslator = ReturnType<typeof createUiTranslator>;
