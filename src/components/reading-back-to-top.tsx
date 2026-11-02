"use client";

import { useTranslations } from "next-intl";
import { ArrowUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const SHOW_AFTER_PX = 480;
const FOOTER_GAP_PX = 16;

export function ReadingBackToTop({
  placement,
}: {
  placement: "toc" | "mobile";
}) {
  const t = useTranslations("reading");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);
  const isShown = visible || focused;

  useEffect(() => {
    const button = buttonRef.current;
    const footer =
      placement === "mobile"
        ? document.querySelector<HTMLElement>(".site-footer")
        : null;
    const shell =
      placement === "mobile"
        ? document.querySelector<HTMLElement>(".reading-shell")
        : null;
    let frame = 0;
    let isVisible = false;
    let lastClearance: number | undefined;

    const update = () => {
      frame = 0;
      const next = window.scrollY > SHOW_AFTER_PX;
      if (next !== isVisible) {
        isVisible = next;
        setVisible(next);
      }

      if (button && footer) {
        const clearance = Math.max(
          0,
          Math.ceil(
            window.innerHeight -
              footer.getBoundingClientRect().top +
              FOOTER_GAP_PX,
          ),
        );
        if (clearance !== lastClearance) {
          lastClearance = clearance;
          button.style.setProperty(
            "--reading-back-to-top-footer-clearance",
            `${clearance}px`,
          );
        }
      }
    };
    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    let observer: ResizeObserver | undefined;
    if (placement === "mobile") {
      window.addEventListener("resize", scheduleUpdate);
      observer = new ResizeObserver(scheduleUpdate);
      if (shell) observer.observe(shell);
      if (footer) observer.observe(footer);
    }

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      observer?.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [placement]);

  const scrollToTop = () => {
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches
      ? "instant"
      : "smooth";
    window.scrollTo({ top: 0, behavior });
  };

  return (
    <Button
      ref={buttonRef}
      type="button"
      variant={placement === "toc" ? "ghost" : "outline"}
      size="icon-lg"
      className={
        placement === "toc"
          ? "reading-back-to-top reading-toc-back-to-top"
          : "reading-back-to-top reading-mobile-back-to-top floating-surface"
      }
      aria-label={t("backToTop")}
      title={t("backToTop")}
      aria-hidden={!isShown}
      tabIndex={isShown ? 0 : -1}
      data-visible={isShown}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onClick={scrollToTop}
    >
      <ArrowUp className="size-4" aria-hidden="true" />
    </Button>
  );
}
