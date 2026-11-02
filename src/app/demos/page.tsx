import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { DemoLab } from "@/components/demo-lab";
import { PageTransition } from "@/components/page-transition";
import { basePath, getDemoManifest } from "@/lib/content/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return {
    title: t("lab.title"),
    description: t("lab.description"),
  };
}

export default async function DemosPage() {
  const t = await getTranslations();
  const manifest = getDemoManifest();
  return (
    <PageTransition identity="interactive-demos">
      <main id="main-content" className="page-container lab-page">
        <header className="lab-heading">
          <div>
            <p className="eyebrow">{t("lab.eyebrow")}</p>
            <h1>{t("lab.title")}</h1>
            <p>{t("lab.description")}</p>
          </div>
          <p className="lab-count">
            {t("lab.totalCount", { count: manifest.count })}
          </p>
        </header>
        <DemoLab manifest={manifest} base={basePath} />
      </main>
    </PageTransition>
  );
}
