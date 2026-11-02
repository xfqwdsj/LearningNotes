import { plainText } from "@/lib/markdown/types";
import { BrowseContext } from "@/components/browse-context";
import { relatedBrowseLinks } from "@/lib/content/browse";
import { ReadingToc } from "@/components/reading-toc";
import { ContentLanguages } from "@/components/content-languages";
import { documentTranslations } from "@/lib/content/localization";
import { defaultContentLocale } from "@/i18n/config";
import { getLabels } from "@/i18n/labels";
import { tocSections } from "@/lib/content/toc";
import { getFormatter, getTranslations } from "next-intl/server";
import { PageTransition } from "@/components/page-transition";
import { MarkdownText } from "@/components/markdown-text";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock3, LockKeyhole } from "lucide-react";
import { getCatalog, basePath } from "@/lib/content/server";
import {
  getStaticRoutes,
  getListing,
  getDocumentNavigation,
} from "@/lib/content/navigation";
import { PageNavigation } from "@/components/page-navigation";
import { CollectionPage } from "@/components/collection-page";
import { stripBasePath } from "@/lib/site-path";

import { ContentRenderer } from "@/components/content-renderer";
import { ContentActions } from "@/components/content-actions";
import { ReadingEnhancements } from "@/components/reading-enhancements";
import { ReadingBackToTop } from "@/components/reading-back-to-top";
import { Badge } from "@/components/ui/badge";
type Props = { params: Promise<{ slug: string[] }> };
export function generateStaticParams() {
  return getStaticRoutes(getCatalog()).map((route) => ({
    slug: route.split("/"),
  }));
}
export const dynamicParams = false;
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTranslations();

  const route = (await params).slug
    .map((segment) => decodeURIComponent(segment))
    .join("/");
  const doc = getCatalog().documents.find(
    (item) => item.href === `${basePath}/${route}/`,
  );
  const listing = doc ? undefined : getListing(getCatalog(), route);
  return {
    ...(!doc && listing
      ? {
          description: plainText(listing.description),
          ...(route
            .replace(/^[a-z]{2}(?:-[A-Za-z0-9]+)?\//, "")
            .startsWith("subjects/")
            ? {
                alternates: {
                  canonical: `${basePath}/${route}/`,
                  types: { "text/markdown": `${basePath}/${route}.md` },
                },
              }
            : {}),
        }
      : {}),
    title:
      doc?.title.text ??
      {
        knowledge: t("common.knowledge"),
        courses: t("common.courses"),
        tasks: t("common.tasks"),
        articles: t("common.articlesAndNotes"),
      }[route] ??
      plainText(getListing(getCatalog(), route)?.title ?? t("common.content")),
    ...(doc
      ? {
          description: doc.description.text,
          alternates: {
            canonical: doc.href,
            languages: Object.fromEntries([
              ...documentTranslations(doc, getCatalog()).map((variant) => [
                variant.lang,
                variant.href,
              ]),
              ...documentTranslations(doc, getCatalog())
                .filter((variant) => variant.lang === defaultContentLocale)
                .map((variant) => ["x-default", variant.href]),
            ]),
            types: { "text/markdown": doc.markdownUrl },
          },
          robots: doc.private
            ? { index: false, follow: false }
            : { index: true, follow: true },
        }
      : {}),
  };
}
export default async function ContentPage({ params }: Props) {
  const t = await getTranslations();
  const { kindLabels, taskLabels } = getLabels(t);

  const route = (await params).slug
    .map((segment) => decodeURIComponent(segment))
    .join("/");
  const catalog = getCatalog();
  const doc = catalog.documents.find(
    (item) => item.href === `${basePath}/${route}/`,
  );
  if (!doc) {
    const listing = getListing(catalog, route);
    if (!listing) notFound();
    return <CollectionPage listing={listing} base={basePath} />;
  }
  const navigation = getDocumentNavigation(doc, catalog);
  const format = await getFormatter();
  const dateLabel = (value: string) =>
    format.dateTime(new Date(value), { dateStyle: "medium" });
  const collection = navigation.siblings;
  const position = collection.findIndex((item) => item.key === doc.key);
  const previous = collection[position - 1];
  const next = collection[position + 1];
  return (
    <>
      <main id="main-content" className="content-page">
        <PageNavigation items={navigation.crumbs} parent={navigation.parent} />
        <div className="reading-layout">
          <PageTransition identity={doc.href}>
            <article className="reading-main">
              <BrowseContext links={relatedBrowseLinks(catalog, route)} />
              <header className="article-header">
                <div className="mb-4 flex gap-2">
                  <Badge variant="outline">
                    {doc.taskType
                      ? taskLabels[doc.taskType]
                      : kindLabels[doc.kind]}
                  </Badge>
                  {doc.private && (
                    <Badge variant="secondary">
                      <LockKeyhole className="mr-1 size-3" />
                      {t("common.private")}
                    </Badge>
                  )}
                </div>
                <h1 lang={doc.lang}>
                  <MarkdownText value={doc.title} />
                </h1>
                <div className="article-meta">
                  <span>
                    {doc.showDates && doc.createdAt && (
                      <time dateTime={doc.createdAt} className="mr-4">
                        {t("reading.created", {
                          date: dateLabel(doc.createdAt),
                        })}
                      </time>
                    )}
                    {doc.showDates &&
                      doc.updatedAt &&
                      doc.updatedAt !== doc.createdAt && (
                        <time dateTime={doc.updatedAt} className="mr-4">
                          {t("reading.updated", {
                            date: dateLabel(doc.updatedAt),
                          })}
                        </time>
                      )}
                    <Clock3 className="mr-1 inline size-3" />
                    {t("common.readingMinutes", { count: doc.readingMinutes })}
                  </span>
                  <ContentActions
                    title={doc.title.text}
                    href={doc.href}
                    markdownUrl={doc.markdownUrl}
                    privateContent={doc.private}
                  />
                </div>
                <ContentLanguages
                  documents={documentTranslations(doc, catalog)}
                  current={doc.lang}
                  base={basePath}
                />
              </header>
              <link rel="describedby" href={`${basePath}/llms.txt`} />
              <div lang={doc.lang} data-reading-content>
                <ContentRenderer document={doc} />
              </div>
              <ReadingEnhancements key={doc.key} />
              <nav
                className="article-pagination"
                aria-label={t("reading.pagination")}
              >
                {previous && (
                  <Link
                    transitionTypes={["nav-back"]}
                    className="pagination-previous"
                    href={stripBasePath(previous.href, basePath)}
                  >
                    <span className="pagination-label">
                      {t("reading.previous")}
                    </span>
                    <MarkdownText
                      value={previous.title}
                      className="pagination-title"
                    />
                  </Link>
                )}
                {next && (
                  <Link
                    transitionTypes={["nav-forward"]}
                    className="pagination-next"
                    href={stripBasePath(next.href, basePath)}
                  >
                    <span className="pagination-label">
                      {t("reading.next")}
                    </span>
                    <MarkdownText
                      value={next.title}
                      className="pagination-title"
                    />
                  </Link>
                )}
              </nav>
            </article>
          </PageTransition>
          <ReadingToc
            sections={tocSections(doc.sections)}
            lang={doc.lang}
            markdownUrl={doc.markdownUrl}
          />
        </div>
      </main>
      <ReadingBackToTop placement="mobile" />
    </>
  );
}
