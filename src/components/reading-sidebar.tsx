"use client";

import Link from "next/link";
import type { MarkdownValue } from "@/lib/markdown/types";
import { MarkdownText } from "./markdown-text";
import { useReadingRail } from "./use-reading-rail";

type ReadingSidebarItem = {
  key: string;
  href: string;
  lang: string;
  title: MarkdownValue;
  current: boolean;
};

export function ReadingSidebar({
  title,
  ariaLabel,
  items,
}: {
  title: MarkdownValue | string;
  ariaLabel: string;
  items: ReadingSidebarItem[];
}) {
  const current = items.find((item) => item.current);
  const { railRef, scrollerRef } = useReadingRail(
    current?.key ?? "",
    '[aria-current="page"]',
    true,
  );

  return (
    <aside className="reading-sidebar" ref={railRef}>
      <div className="reading-nav-heading">
        <p className="sidebar-title">
          <MarkdownText value={title} />
        </p>
      </div>
      <nav className="reading-nav" aria-label={ariaLabel} ref={scrollerRef}>
        {items.map((item) => (
          <Link
            lang={item.lang}
            key={item.key}
            className="reading-nav-link"
            aria-current={item.current ? "page" : undefined}
            href={item.href}
          >
            <MarkdownText value={item.title} />
          </Link>
        ))}
      </nav>
    </aside>
  );
}
