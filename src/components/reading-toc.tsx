"use client";
import { MarkdownText } from "./markdown-text";

import { useEffect, useState, type CSSProperties } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";
import { measureReadingPosition } from "@/lib/reading-position";
import type { TocSection } from "@/lib/content/toc";
import { useReadingRail } from "./use-reading-rail";
import { ReadingBackToTop } from "./reading-back-to-top";

export function ReadingToc({
  sections,
  lang,
  markdownUrl,
}: {
  sections: TocSection[];
  lang: string;
  markdownUrl: string;
}) {
  const t = useTranslations();
  const format = useFormatter();
  const [active, setActive] = useState("");
  const [progress, setProgress] = useState(0);
  const { railRef, scrollerRef } = useReadingRail(
    active,
    '[aria-current="location"]',
  );
  useEffect(() => {
    let frame = 0;
    let content: HTMLElement | null = null;
    const resizeObserver = new ResizeObserver(() => schedule());
    const observeContent = () => {
      const next = document.querySelector<HTMLElement>(
        "[data-reading-content]",
      );
      if (next === content) return content;
      if (content) resizeObserver.unobserve(content);
      content = next;
      if (content) resizeObserver.observe(content);
      return content;
    };
    const update = () => {
      frame = 0;
      const current = observeContent();
      if (!current) return;
      const offset =
        parseFloat(
          getComputedStyle(document.documentElement).scrollPaddingTop,
        ) || 100;
      const position = measureReadingPosition<HTMLElement>({
        sections,
        content: current,
        offset,
        viewportHeight: innerHeight,
        atBottom:
          document.documentElement.scrollHeight - innerHeight <=
          window.scrollY + 2,
        resolveHeading: (id) => document.getElementById(id),
      });
      setActive(position.active);
      setProgress(position.progress);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const mutations = new MutationObserver(schedule);
    mutations.observe(document.body, {
      attributes: true,
      attributeFilter: ["id"],
      childList: true,
      subtree: true,
    });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      mutations.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [sections]);
  return (
    <aside className="reading-toc" ref={railRef}>
      <div className="reading-nav-heading">
        <p className="sidebar-title">{t("reading.toc")}</p>
        <div className="reading-toc-actions">
          <span
            className="reading-progress"
            role="progressbar"
            aria-label={t("reading.progress")}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            {t("reading.progressValue", {
              value: format.number(progress / 100, {
                style: "percent",
                maximumFractionDigits: 0,
              }),
            })}
          </span>
          <ReadingBackToTop placement="toc" />
        </div>
      </div>
      <nav
        className="reading-nav"
        ref={scrollerRef}
        aria-label={t("reading.toc")}
      >
        {sections.map((section) => (
          <a
            className="reading-nav-link"
            key={section.id}
            href={`#${section.id}`}
            lang={lang}
            aria-current={active === section.id ? "location" : undefined}
            style={
              {
                "--reading-nav-depth": Math.max(0, section.depth - 2),
              } as CSSProperties
            }
          >
            <MarkdownText value={section.title} />
          </a>
        ))}
      </nav>
      <a href={markdownUrl} className="toc-markdown">
        {t("reading.markdown")}
        <ArrowUpRight className="size-3" aria-hidden="true" />
      </a>
    </aside>
  );
}
