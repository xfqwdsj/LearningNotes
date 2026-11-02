import { useTranslations } from "next-intl";
import { MarkdownText } from "@/components/markdown-text";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Crumb } from "@/lib/content/navigation";
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const t = useTranslations();

  return (
    <nav aria-label={t("navigation.breadcrumbs")} className="breadcrumbs">
      <ol>
        {items.map((item, i) => (
          <li key={`${item.href}-${i}`}>
            {i > 0 && (
              <ChevronRight aria-hidden="true" className="size-3 shrink-0" />
            )}
            {i === items.length - 1 ? (
              <span aria-current="page">
                <MarkdownText value={item.label} />
              </span>
            ) : (
              <Link transitionTypes={["nav-back"]} href={item.href}>
                <MarkdownText value={item.label} />
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
