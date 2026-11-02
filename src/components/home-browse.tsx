import { EntryLink } from "./entry-link";
import { MarkdownText } from "@/components/markdown-text";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, BookOpen, Network, PenLine, FileText } from "lucide-react";
import { contentCollections } from "@/lib/content/browse";
import { findTerm, taxonomyLabels } from "@/lib/content/taxonomy";
import { preferredDocuments } from "@/lib/content/localization";
import type { Catalog } from "@/lib/content/types";
import { ScopedLink } from "./scoped-link";
import { TaxonomyIcon } from "./taxonomy-icon";
const icons = {
  courses: BookOpen,
  knowledge: Network,
  tasks: PenLine,
  articles: FileText,
};
export function HomeBrowse({
  catalog,
  base,
}: {
  catalog: Catalog;
  base: string;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const documents = preferredDocuments(catalog, locale);
  const { subjectLabels } = taxonomyLabels(catalog.taxonomy);
  const subjects = catalog.taxonomy.filter(
    (term) =>
      term.kind === "subject" &&
      documents.some((doc) => doc.subject === term.id),
  );
  const routeFor = (href: string) => `${base}${href}`;
  return (
    <div id="browse" className="home-browse home-section">
      <section
        className="home-content-browse"
        aria-labelledby="content-browse-title"
      >
        <div className="section-heading">
          <div>
            <h2 id="content-browse-title">{t("home.contentTitle")}</h2>
            <p className="home-browse-description">
              {t("home.contentDescription")}
            </p>
          </div>
        </div>
        <div className="home-content-grid">
          {contentCollections.map((item) => {
            const count = documents.filter(
              (doc) => doc.kind === item.kind,
            ).length;
            const Icon = icons[item.id];
            return (
              <article key={item.id} className="home-content-link entry-card">
                <div>
                  <h3>
                    <EntryLink
                      className="entry-primary"
                      base={base}
                      href={routeFor(item.href)}
                    >
                      {t(item.titleKey)}
                    </EntryLink>
                  </h3>
                  <div className="entry-meta">
                    <Icon className="size-4" />
                    <span>{t("common.readingCount", { count })}</span>
                  </div>
                  <p>{t(item.descriptionKey)}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>
      <section
        className="home-subject-browse"
        aria-labelledby="subject-browse-title"
      >
        <div className="section-heading">
          <div>
            <h2 id="subject-browse-title">{t("home.subjectsTitle")}</h2>
            <p className="home-browse-description">
              {t("home.subjectsDescription")}
            </p>
          </div>
        </div>
        <div className="home-subject-list">
          {subjects.map((term) => {
            const count = documents.filter(
              (doc) => doc.subject === term.id,
            ).length;
            return (
              <article className="subject-card entry-card" key={term.id}>
                <h3>
                  <EntryLink
                    className="entry-primary"
                    href={routeFor(`/subjects/${term.id}/`)}
                    base={base}
                  >
                    <MarkdownText value={subjectLabels[term.id] ?? term.id} />
                  </EntryLink>
                </h3>
                <div className="entry-meta">
                  <TaxonomyIcon
                    svg={findTerm(catalog.taxonomy, term.id)?.iconSvg}
                    className="size-4"
                  />
                  <span>{t("common.readingCount", { count })}</span>
                </div>
              </article>
            );
          })}
        </div>
        <ScopedLink
          className="home-all-subjects"
          href={routeFor("/subjects/")}
          base={base}
        >
          <span className="link-label">{t("home.allSubjects")}</span>
          <ArrowRight className="size-4" />
        </ScopedLink>
      </section>
    </div>
  );
}
