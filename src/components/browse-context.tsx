import { Fragment } from "react";
import { useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { BrowseLink } from "@/lib/content/browse";
import { MarkdownText } from "@/components/markdown-text";
export function BrowseContext({ links }: { links: BrowseLink[] }) {
  const t = useTranslations();
  if (!links.length) return null;
  return (
    <nav className="browse-context" aria-label={t("navigation.relatedViews")}>
      <span>{t("navigation.relatedViews")}</span>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          transitionTypes={["nav-forward"]}
        >
          <span className="link-label">
            {link.kind === "subjects"
              ? t("home.subjectsTitle")
              : t(
                  link.kind === "subject"
                    ? "navigation.subjectOverviewLink"
                    : "navigation.courseOverviewLink",
                  { title: "\uFFFC" },
                )
                  .split("\uFFFC")
                  .map((part, index) => (
                    <Fragment key={index}>
                      {index > 0 && <MarkdownText value={link.title} />}
                      {part}
                    </Fragment>
                  ))}
          </span>
          <ArrowUpRight className="size-3.5" />
        </Link>
      ))}
    </nav>
  );
}
