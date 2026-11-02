import { plainText } from "@/lib/markdown/types";
import { BrowseContext } from "./browse-context";
import { useTranslations } from "next-intl";
import { PageTransition } from "@/components/page-transition";
import { OtherSiteLink } from "./other-site-link";
import { MarkdownText } from "@/components/markdown-text";
/* Cross-zone links use full document navigation. */
import { EntryLink } from "./entry-link";
import { TaxonomyIcon } from "./taxonomy-icon";
import { ReadingEnhancements } from "./reading-enhancements";
import { RichContent } from "./rich-content";
import { DemoProvider } from "./demo-renderer";
import { PageNavigation } from "./page-navigation";
import { DocumentList } from "./document-list";
import type { Listing } from "@/lib/content/navigation";
export function CollectionPage({
  listing,
  base,
}: {
  listing: Listing;
  base: string;
}) {
  const t = useTranslations();

  return (
    <PageTransition
      identity={listing.crumbs.at(-1)?.href ?? plainText(listing.title)}
    >
      <main id="main-content" className="content-page">
        <PageNavigation items={listing.crumbs} parent={listing.parent} />
        <div className="page-container listing-page">
          <div className="listing-heading">
            <p className="eyebrow">
              {listing.cards.length
                ? t("collections.choose")
                : t("collections.readInOrder")}
            </p>
            <h1>
              <MarkdownText value={listing.title} />
            </h1>
            <MarkdownText as="div" value={listing.description} />
          </div>
          <BrowseContext links={listing.related ?? []} />
          {(listing.cardGroups ?? [{ title: "", cards: listing.cards }])
            .filter((group) => group.cards.length)
            .map((group) => {
              const CardHeading = group.title ? "h3" : "h2";
              return (
                <section
                  className="collection-group"
                  key={plainText(group.title) || "content"}
                >
                  {group.title && (
                    <h2 className="collection-group-title">
                      <MarkdownText value={group.title} />
                    </h2>
                  )}
                  <div className="collection-grid">
                    {group.cards.map((card) => (
                      <article
                        key={card.href}
                        className="collection-card entry-card"
                      >
                        <CardHeading>
                          <EntryLink
                            className="entry-primary"
                            base={base}
                            href={`${base}${card.href}`}
                            aria-label={card.destination}
                          >
                            <MarkdownText value={card.title} />
                          </EntryLink>
                        </CardHeading>
                        <div className="entry-meta">
                          <TaxonomyIcon svg={card.iconSvg} className="size-4" />
                          <span>
                            {t("common.readingCount", { count: card.count })}
                          </span>
                        </div>

                        <MarkdownText
                          as="div"
                          className="entry-secondary"
                          value={card.description}
                        />
                      </article>
                    ))}
                  </div>
                </section>
              );
            })}
          {listing.documents.length > 0 && (
            <div
              className={
                listing.cards.length ? "collection-documents" : undefined
              }
            >
              <DocumentList documents={listing.documents} base={base} />
            </div>
          )}
          {!listing.cards.length && !listing.documents.length && (
            <div className="empty-state">
              <p>{t("collections.emptyTitle")}</p>
              <span>{t("collections.emptyDescription")}</span>
              <div className="mt-6">
                <OtherSiteLink
                  base={base}
                  path={listing.crumbs.at(-1)?.href ?? "/"}
                />
              </div>
            </div>
          )}
          {listing.intro && (
            <DemoProvider records={listing.intro.demos}>
              <div
                data-reading-content
                lang={listing.intro.lang}
                className="prose prose-neutral dark:prose-invert taxonomy-intro max-w-none"
              >
                <RichContent html={listing.intro.html} />
              </div>
              <ReadingEnhancements />
            </DemoProvider>
          )}
        </div>
      </main>
    </PageTransition>
  );
}
