import { plainText } from "@/lib/markdown/types";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Breadcrumbs } from "./breadcrumbs";
import { Button } from "./ui/button";
import type { Crumb } from "@/lib/content/navigation";

export function PageNavigation({
  items,
  parent,
}: {
  items: Crumb[];
  parent: Crumb;
}) {
  const t = useTranslations();

  return (
    <div className="page-navigation">
      <div className="page-navigation-inner">
        <Button variant="ghost" size="sm" asChild className="page-parent-link">
          <Link
            transitionTypes={["nav-back"]}
            href={parent.href}
            aria-label={t("navigation.backTo", {
              title: plainText(parent.label),
            })}
          >
            <ArrowLeft className="size-3.5" />
            {t("navigation.back")}
          </Link>
        </Button>
        <span className="page-navigation-divider" aria-hidden="true" />
        <Breadcrumbs items={items} />
      </div>
    </div>
  );
}
