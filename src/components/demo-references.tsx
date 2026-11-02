"use client";
import { MarkdownText } from "./markdown-text";

import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { demoLocations, type DemoRecord } from "@/demos/types";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { ScopedLink } from "./scoped-link";

/** Source is intentionally first and visually unlabeled. */
export function DemoReferences({
  record,
  base,
  className,
}: {
  record: DemoRecord;
  base: string;
  className?: string;
}) {
  const t = useTranslations();
  const locations = demoLocations(record);
  if (!locations.length) return null;

  return (
    <div className={cn("demo-references", className)}>
      {locations.map((location) => (
        <ScopedLink key={location.href} href={location.href} base={base}>
          <span className="link-label">
            <MarkdownText value={location.title} />
          </span>
          {base && !location.href.startsWith(`${base}/`) && (
            <Badge variant="outline">{t("common.publicSite")}</Badge>
          )}
          <ArrowUpRight className="size-3" />
        </ScopedLink>
      ))}
    </div>
  );
}
