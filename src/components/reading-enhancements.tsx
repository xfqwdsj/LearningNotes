"use client";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CopyButton } from "./copy-button";
type CopyHost = {
  element: HTMLElement;
  text: string;
  label: string;
  formula: boolean;
};

export function ReadingEnhancements() {
  const t = useTranslations();

  const [controls, setControls] = useState<CopyHost[]>([]);
  useEffect(() => {
    const timer = setTimeout(() => {
      const hosts = [
        ...document.querySelectorAll<HTMLElement>(
          "[data-reading-content] .math-display-frame, [data-reading-content] .code-display-frame",
        ),
      ].flatMap((element): CopyHost[] => {
        const formula = element.classList.contains("math-display-frame");
        const text = formula
          ? element.querySelector('annotation[encoding="application/x-tex"]')
              ?.textContent
          : element.querySelector<HTMLElement>("[data-copy-code]")?.dataset[
              "copyCode"
            ];
        if (!text) return [];
        const target = formula
          ? element
          : element.querySelector<HTMLElement>("[data-copy-mount]");
        if (!target) return [];
        return [
          {
            element: target,
            text,
            formula,
            label: formula ? t("copy.formula") : t("copy.code"),
          },
        ];
      });
      setControls(hosts);
    }, 0);
    return () => {
      clearTimeout(timer);
    };
  }, [t]);
  return controls.map(({ element, text, label, formula }, index) =>
    createPortal(
      <CopyButton
        label={label}
        surface="floating"
        getText={() => text}
        className={formula ? "formula-copy" : "code-copy"}
      />,
      element,
      `copy-${index}`,
    ),
  );
}
