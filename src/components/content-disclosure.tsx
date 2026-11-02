import type { ComponentProps, ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Shared presentation for native, keyboard-accessible content disclosures. */
export function ContentDisclosure({
  title,
  icon,
  children,
  className,
  ...props
}: Omit<ComponentProps<"details">, "title" | "children"> & {
  title: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
}) {
  const t = useTranslations();
  return (
    <details {...props} className={cn("content-disclosure", className)}>
      <summary className="content-disclosure-summary">
        {icon ? (
          <span className="content-disclosure-icon" aria-hidden="true">
            {icon}
          </span>
        ) : null}
        <span className="content-disclosure-label">{title}</span>
        <span className="content-disclosure-hint" aria-hidden="true">
          <span className="when-closed">{t("learning.expand")}</span>
          <span className="when-open">{t("learning.collapse")}</span>
        </span>
        <ChevronRight
          className="content-disclosure-chevron"
          aria-hidden="true"
        />
      </summary>
      <div className="content-disclosure-body">{children}</div>
    </details>
  );
}
