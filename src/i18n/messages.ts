import zhCN from "../../messages/zh-CN.json" with { type: "json" };
import { resolveUiLocale, type UiLocale } from "./config";
export const messages = { "zh-CN": zhCN } satisfies Record<
  UiLocale,
  typeof zhCN
>;
export function getMessages(locale?: string) {
  return messages[resolveUiLocale(locale)];
}
export type Messages = typeof zhCN;
