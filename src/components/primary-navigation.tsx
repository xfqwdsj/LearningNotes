"use client";
import { contentCollections } from "@/lib/content/browse";
import { useTranslations } from "next-intl";
import type { UiTranslator } from "@/i18n/translate";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SheetClose } from "./ui/sheet";
import { normalizePathname } from "@/lib/site-path";
const getLinks = (t: UiTranslator) => [
  ...contentCollections.map((item) => ({
    href: item.href,
    label: t(item.titleKey),
  })),
  { href: "/demos/", label: t("navigation.lab") },
];
export function PrimaryNavigation({
  mobile = false,
  base,
}: {
  mobile?: boolean;
  base: string;
}) {
  const t = useTranslations();
  const links = getLinks(t);

  const pathname = normalizePathname(usePathname(), base);
  return (
    <nav
      className={mobile ? "mobile-nav" : "desktop-nav"}
      aria-label={mobile ? t("navigation.mobile") : t("navigation.primary")}
    >
      {links.map(({ href, label }) => {
        const active = pathname.startsWith(normalizePathname(href, base));
        const link = (
          <Link href={href} aria-current={active ? "page" : undefined}>
            {label}
          </Link>
        );
        return mobile ? (
          <SheetClose asChild key={href}>
            {link}
          </SheetClose>
        ) : (
          <span key={href}>{link}</span>
        );
      })}
    </nav>
  );
}
