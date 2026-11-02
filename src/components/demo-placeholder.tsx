"use client";
import { useTranslations } from "next-intl";
import { Skeleton } from "./ui/skeleton";
export function DemoPlaceholder() {
  const t = useTranslations();
  return (
    <div className="demo-placeholder" role="status">
      <div className="demo-placeholder-heading">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <Skeleton className="demo-placeholder-graph" />
      <div className="demo-placeholder-heading">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-8 w-24" />
      </div>
      <p>{t("demoUi.loading")}</p>
    </div>
  );
}
