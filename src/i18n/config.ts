export const defaultLocale = "zh-CN";
export const defaultContentLocale = defaultLocale;
export const locales = [defaultLocale] as const;
export type UiLocale = (typeof locales)[number];
export const timeZone = "Asia/Shanghai";
export function resolveUiLocale(locale?: string): UiLocale {
  return locales.find((supported) => supported === locale) ?? defaultLocale;
}
export function canonicalContentLocale(locale: string): string {
  return Intl.getCanonicalLocales(locale)[0] ?? defaultContentLocale;
}
export function contentLocalePrefix(locale: string): string {
  return locale === defaultContentLocale ? "" : `/${locale}`;
}
