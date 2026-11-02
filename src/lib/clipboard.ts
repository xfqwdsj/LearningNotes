"use client";
import { createUiTranslator } from "@/i18n/translate";
import type { UiTranslator } from "@/i18n/translate";
import clipboardCopy from "clipboard-copy";
import { toast } from "sonner";

export async function copyWithFeedback(
  getText: () => string | Promise<string>,
  t: UiTranslator = createUiTranslator(),
): Promise<boolean> {
  try {
    const text = getText();
    if (
      typeof text !== "string" &&
      typeof ClipboardItem !== "undefined" &&
      navigator.clipboard?.write
    ) {
      try {
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/plain": text.then(
              (value) => new Blob([value], { type: "text/plain" }),
            ),
          }),
        ]);
      } catch {
        await clipboardCopy(await text);
      }
    } else await clipboardCopy(await text);
    toast.success(t("common.copied"), { id: "clipboard", duration: 1600 });
    return true;
  } catch {
    toast.error(t("copy.failed"), {
      id: "clipboard",
      description: t("copy.manual"),
      duration: 3500,
    });
    return false;
  }
}
