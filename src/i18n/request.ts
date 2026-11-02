import { getRequestConfig } from "next-intl/server";
import { defaultLocale, timeZone } from "./config";
import { getMessages } from "./messages";
export default getRequestConfig(async () => ({
  locale: defaultLocale,
  messages: getMessages(),
  timeZone,
}));
