import Link from "next/link";
import { useTranslations } from "next-intl";
import { languageName } from "@/lib/content/localization";
import type { Document } from "@/lib/content/types";
import { stripBasePath } from "@/lib/site-path";
export function ContentLanguages({
  documents,
  current,
  base,
}: {
  documents: Document[];
  current: string;
  base: string;
}) {
  const t = useTranslations();
  if (documents.length < 2) return null;
  return (
    <nav
      className="mt-5 flex flex-wrap items-center gap-3 text-sm"
      aria-label={t("common.translations")}
    >
      <span className="text-muted-foreground">{t("common.translations")}</span>
      {documents.map((doc) =>
        doc.lang === current ? (
          <span key={doc.lang} lang={doc.lang} aria-current="page">
            {languageName(doc.lang)}
          </span>
        ) : (
          <Link
            key={doc.lang}
            href={stripBasePath(doc.href, base)}
            lang={doc.lang}
            hrefLang={doc.lang}
            className="underline underline-offset-4"
          >
            {languageName(doc.lang)}
          </Link>
        ),
      )}
    </nav>
  );
}
