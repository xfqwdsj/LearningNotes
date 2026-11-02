import { canonicalContentLocale, defaultContentLocale } from "./config";
/** Shared by generated content and runtime consumers. Missing defaults are contract errors. */
export function contentFallbacks(locale: string): string[] {
  const canonical = canonicalContentLocale(locale);
  return [
    ...new Set([
      canonical,
      new Intl.Locale(canonical).language,
      defaultContentLocale,
    ]),
  ];
}
export function selectTranslation<T>(
  translations: Record<string, T>,
  locale: string,
): { locale: string; value: T } {
  if (!Object.hasOwn(translations, defaultContentLocale))
    throw new Error(
      `Missing default content translation: ${defaultContentLocale}`,
    );
  for (const candidate of contentFallbacks(locale)) {
    const value = translations[candidate];
    if (value !== undefined) return { locale: candidate, value };
  }
  throw new Error("Missing content translation");
}
export function localizedValue<T>(
  translations: Record<string, T>,
  locale: string,
): T {
  return selectTranslation(translations, locale).value;
}
