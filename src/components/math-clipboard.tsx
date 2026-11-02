"use client";
import { useEffect } from "react";
/** Load the official KaTeX extension once for math in articles, labels, summaries and demos. */
export function MathClipboard() {
  useEffect(() => {
    let active = true;
    let cleanup: (() => void) | undefined;
    void import("katex/contrib/copy-tex").then(() => {
      if (!active) return;
      const plainText = (event: ClipboardEvent) => {
        const selection = window.getSelection();
        if (
          !selection?.rangeCount ||
          !event.clipboardData?.getData("text/plain")
        )
          return;
        const range = selection.getRangeAt(0);
        if (
          [...document.querySelectorAll(".katex")].some((formula) =>
            range.intersectsNode(formula),
          )
        )
          event.clipboardData.clearData("text/html");
      };
      document.addEventListener("copy", plainText);
      cleanup = () => document.removeEventListener("copy", plainText);
    });
    return () => {
      active = false;
      cleanup?.();
    };
  }, []);
  return null;
}
