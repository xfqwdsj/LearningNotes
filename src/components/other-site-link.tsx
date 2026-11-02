"use client";
import { useTranslations } from "next-intl";
/* Cross-zone navigation must load the destination document. */
import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { ArrowUpRight, X } from "lucide-react";
import { Button } from "./ui/button";
import { stripBasePath } from "@/lib/site-path";

const subscribeLocation = (listener: () => void) => {
  window.addEventListener("popstate", listener);
  return () => window.removeEventListener("popstate", listener);
};
const locationSnapshot = () => window.location.pathname;
function destination(base: string, path: string) {
  const local = stripBasePath(path, "/private");
  return `${base ? "" : "/private"}${local.endsWith("/") ? local : `${local}/`}`;
}
function homeDestination(base: string) {
  return base ? "/" : "/private/";
}
export function OtherSiteLink({
  base,
  path,
  presentation = "button",
}: {
  base: string;
  path?: string;
  presentation?: "button" | "footer" | "icon";
}) {
  const t = useTranslations();

  // A static 404 has an internal router path. Keep hydration snapshots identical
  // and resolve the requested browser URL only after hydration.
  const pathname = usePathname();
  const actualPath = useSyncExternalStore(
    subscribeLocation,
    locationSnapshot,
    () => "",
  );
  const unresolved = path === undefined && !actualPath;
  const target = destination(base, path ?? actualPath);
  const request = `${base}:${target}`;
  const [result, setResult] = useState<{
    request: string;
    href: string;
    status: "found" | "missing" | "unknown";
  }>();
  const name = base ? t("common.publicSite") : t("common.privateSite");
  useEffect(() => {
    if (unresolved || !pathname) return;
    let active = true;
    void fetch(target, {
      method: "HEAD",
      credentials: "same-origin",
      redirect: "error",
      headers: { "X-Requested-With": "XMLHttpRequest" },
      cache: base ? "no-cache" : "no-store",
    })
      .then((response) => {
        if (active)
          setResult({
            request,
            href: target,
            status:
              response.ok &&
              response.headers.get("content-type")?.includes("text/html")
                ? "found"
                : response.status === 404
                  ? "missing"
                  : "unknown",
          });
      })
      .catch(() => {
        if (active) setResult({ request, href: target, status: "unknown" });
      });
    return () => {
      active = false;
    };
  }, [base, pathname, request, target, unresolved]);
  const current = result?.request === request ? result : undefined;
  const actionLabel =
    current?.status === "found"
      ? t("otherSite.found", { site: name })
      : t("otherSite.try", { site: name });
  const href =
    current?.status === "missing"
      ? homeDestination(base)
      : (current?.href ?? target);

  if (unresolved && presentation === "button")
    return (
      <Button variant="outline" disabled>
        {actionLabel}
        <ArrowUpRight className="size-4" />
      </Button>
    );

  if (presentation === "icon")
    return (
      <Button variant="ghost" size="icon-sm" asChild>
        <a href={href} aria-label={actionLabel} data-other-site>
          <X className="size-3.5" aria-hidden="true" />
          <span className="sr-only">{actionLabel}</span>
        </a>
      </Button>
    );

  if (presentation === "footer")
    return (
      <a href={href} className="inline-flex items-center gap-1" data-other-site>
        {t(base ? "navigation.publicSite" : "navigation.privateContent")}
        <ArrowUpRight className="size-3" aria-hidden="true" />
      </a>
    );

  return (
    <Button variant="outline" asChild>
      <a href={href} data-other-site>
        {actionLabel}
        <ArrowUpRight className="size-4" aria-hidden="true" />
      </a>
    </Button>
  );
}
