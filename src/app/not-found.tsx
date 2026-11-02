import { useTranslations } from "next-intl";
import { PageTransition } from "@/components/page-transition";
import { PageNavigation } from "@/components/page-navigation";
import { OtherSiteLink } from "@/components/other-site-link";
import { basePath } from "@/lib/content/server";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
export default function NotFound() {
  const t = useTranslations();

  return (
    <PageTransition identity={"not-found"}>
      <main id="main-content" className="content-page">
        <PageNavigation
          items={[
            { label: t("common.home"), href: "/" },
            { label: t("notFound.label"), href: "/404/" },
          ]}
          parent={{ label: t("common.home"), href: "/" }}
        />
        <div className="page-container not-found-page">
          <div className="not-found-code" aria-hidden="true">
            404
            <span />
          </div>
          <p className="eyebrow">{t("notFound.eyebrow")}</p>
          <h1>{t("notFound.title")}</h1>
          <p>{t.rich("notFound.description", { br: () => <br /> })}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link transitionTypes={["nav-forward"]} href="/#browse">
                {t("notFound.browse")}
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
            <OtherSiteLink base={basePath} />
          </div>
        </div>
      </main>
    </PageTransition>
  );
}
