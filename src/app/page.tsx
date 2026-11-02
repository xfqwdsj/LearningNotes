import { HomeSection } from "@/components/home-section";
import { HomeBrowse } from "@/components/home-browse";
import { preferredDocuments } from "@/lib/content/localization";
import { getLocale, getTranslations } from "next-intl/server";
import { PageTransition } from "@/components/page-transition";
import {
  getHomeCatalog,
  getCatalog,
  getDemoManifest,
  basePath,
} from "@/lib/content/server";
import { orderDocuments } from "@/lib/content/ordering";

import { HomeHero } from "@/components/home-hero";
import { HomeDemoShowcase } from "@/components/home-demo-showcase";
import { ScopedLink } from "@/components/scoped-link";
import { DocumentList } from "@/components/document-list";
export default async function HomePage() {
  const t = await getTranslations();
  const locale = await getLocale();
  const homeCatalog = getHomeCatalog();

  const documents = preferredDocuments(homeCatalog, locale);
  const routeFor = (href: string) => `${basePath}${href}`;
  const demos = getDemoManifest();
  const coursesHref = routeFor("/courses/");
  const primaryHref = "#browse";
  const featured = orderDocuments(
    documents.filter(
      (doc) => doc.kind === "knowledge" || doc.kind === "article",
    ),
    locale,
  ).slice(0, 5);
  return (
    <PageTransition identity={"home"}>
      <main id="main-content" className="page-container">
        <HomeHero
          count={documents.length}
          primaryHref={primaryHref}
          hasDemo={demos.count > 0}
          base={basePath}
          orbitTargets={{
            ...(documents.some((doc) => doc.kind === "knowledge")
              ? {
                  knowledge: routeFor("/knowledge/"),
                  properties: documents.find((doc) => doc.kind === "knowledge")!
                    .href,
                }
              : {}),
            ...(demos.count > 0 ? { exploration: routeFor("/demos/") } : {}),
            ...(documents.some((doc) => doc.kind === "task")
              ? { tasks: routeFor("/tasks/") }
              : {}),
            ...(documents.some((doc) => doc.kind === "course-note")
              ? { courses: coursesHref }
              : {}),
          }}
        />
        <HomeBrowse catalog={getCatalog()} base={basePath} />
        <HomeDemoShowcase manifest={demos} base={basePath} />
        {featured.length > 0 && (
          <HomeSection>
            <div className="section-heading">
              <div>
                <p className="eyebrow">{t("home.continue")}</p>
                <h2>{t("home.betweenPages")}</h2>
              </div>
              <ScopedLink
                base={basePath}
                href={routeFor("/articles/")}
                className="text-muted-foreground text-sm"
              >
                {t("common.articlesAndNotes")}
              </ScopedLink>
            </div>
            <DocumentList base={basePath} documents={featured} />
          </HomeSection>
        )}
      </main>
    </PageTransition>
  );
}
