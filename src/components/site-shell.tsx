import { useTranslations } from "next-intl";
/* Cross-zone links intentionally use full document navigation: public and private are separate static builds. */
import Link from "next/link";
import { ArrowUpRight, BookOpenText, Menu } from "lucide-react";
import { PrimaryNavigation } from "./primary-navigation";
import { ThemeToggle } from "./theme-toggle";
import { SearchDialog } from "./search-dialog";
import { OtherSiteLink } from "./other-site-link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
export function SiteHeader({ base }: { base: string }) {
  const t = useTranslations();

  return (
    <header
      className="site-header"
      style={{ viewTransitionName: "site-header" }}
    >
      <div className="header-inner">
        <div className="flex min-w-0 items-center gap-1">
          <Link href="/" transitionTypes={["nav-back"]} className="brand">
            <BookOpenText className="size-5" />
            <span>
              {t("brand.name")}
              <span className="brand-dot">.</span>
            </span>
            {base && (
              <span className="private-label">{t("common.private")}</span>
            )}
          </Link>
          {base && <OtherSiteLink base={base} presentation="icon" />}
        </div>
        <PrimaryNavigation base={base} />
        <div className="header-actions">
          <SearchDialog base={base} />
          <ThemeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label={t("navigation.open")}
              >
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent aria-describedby={undefined}>
              <SheetTitle className="p-6">{t("brand.name")}</SheetTitle>
              <PrimaryNavigation base={base} mobile />
              <a
                href={base ? "/" : "/private/"}
                className="mx-6 mt-6 inline-flex items-center gap-2 text-sm"
              >
                {base
                  ? t("navigation.browsePublic")
                  : t("navigation.browsePrivate")}
                <ArrowUpRight className="size-4" />
              </a>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
export function SiteFooter({ base }: { base: string }) {
  const t = useTranslations();

  return (
    <footer className="site-footer">
      <span>
        {t("brand.name")}
        <span className="text-border mx-3">/</span>
        {t("brand.tagline")}
      </span>
      <div className="footer-links">
        <Link href="/subjects/">{t("navigation.subjects")}</Link>
        <a href={`${base}/llms.txt`}>{t("navigation.agentGuide")}</a>
        <OtherSiteLink base={base} presentation="footer" />
      </div>
    </footer>
  );
}
