import { NextIntlClientProvider } from "next-intl";
import { getTranslations, getLocale } from "next-intl/server";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import { SiteHeader, SiteFooter } from "@/components/site-shell";
import { ReadingShell, type ReadingGroup } from "@/components/reading-shell";
import { getDocumentNavigation } from "@/lib/content/navigation";
import { getCatalog } from "@/lib/content/server";
import { basePath, siteUrl } from "@/lib/content/server";
import "katex/dist/katex.min.css";
import "react-medium-image-zoom/dist/styles.css";
import "./globals.css";
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: t("metadata.defaultTitle"),
      template: t("metadata.titleTemplate"),
    },
    description: t("metadata.description"),
  };
}
export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const t = await getTranslations();

  const locale = await getLocale();
  const catalog = getCatalog();
  const groups = new Map<string, ReadingGroup>();
  for (const doc of catalog.documents) {
    const navigation = getDocumentNavigation(doc, catalog);
    const key = navigation.siblings.map((item) => item.key).join("|");
    if (groups.has(key)) continue;
    groups.set(key, {
      title: navigation.parent.label,
      ariaLabel:
        doc.kind === "course-note"
          ? t("reading.sameCourse")
          : t("reading.related"),
      items: navigation.siblings.map((item) => ({
        key: item.key,
        href: item.href,
        lang: item.lang,
        title: item.title,
        current: false,
      })),
    });
  }
  return (
    <html lang={locale} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
        <NextIntlClientProvider>
          <Providers>
            <a className="skip-link" href="#main-content">
              {t("navigation.skip")}
            </a>
            <SiteHeader base={basePath} />
            <ReadingShell basePath={basePath} groups={[...groups.values()]}>
              {children}
            </ReadingShell>
            <SiteFooter base={basePath} />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
