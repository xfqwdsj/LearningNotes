import { createFormatter } from "next-intl";
import { canonicalContentLocale, timeZone } from "./config";
export const createContentFormatter = (locale: string) =>
  createFormatter({ locale: canonicalContentLocale(locale), timeZone });
