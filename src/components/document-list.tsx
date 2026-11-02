import { languageName } from "@/lib/content/localization";
import { useLocale, useTranslations } from "next-intl";
import { localizedTitle } from "@/lib/content/taxonomy";
import { getLabels } from "@/i18n/labels";
import { SummaryPreview } from "./summary-preview";
import { MarkdownText } from "@/components/markdown-text";
import { EntryLink } from "./entry-link";
import { LockKeyhole } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { type Document } from "@/lib/content/types";
export function DocumentList({
  documents,
  base = "",
}: {
  documents: Document[];
  base?: string;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const { taskLabels } = getLabels(t);
  return (
    <div className="document-list">
      {documents.map((doc) => (
        <article key={doc.key} className="document-row entry-card">
          <div className="document-row-content">
            <h2 className="document-title">
              <EntryLink
                base={base}
                href={doc.href}
                className="document-title-link entry-primary"
                lang={doc.lang}
              >
                <MarkdownText value={doc.title} />
              </EntryLink>
            </h2>
            <div className="entry-meta">
              <MarkdownText value={localizedTitle(doc.subjectTitles, locale)} />
              {doc.course && (
                <>
                  <span>/</span>
                  <span>
                    <MarkdownText
                      value={localizedTitle(doc.courseTitles, locale)}
                    />
                  </span>
                </>
              )}
              {doc.taskType && (
                <Badge variant="secondary">{taskLabels[doc.taskType]}</Badge>
              )}
              {doc.lang !== locale && (
                <Badge variant="outline">
                  {languageName(doc.lang, locale)}
                </Badge>
              )}
              {doc.private && <LockKeyhole className="size-3" />}
              {base && !doc.private && (
                <Badge variant="outline">{t("common.publicSite")}</Badge>
              )}
            </div>

            <SummaryPreview html={doc.description.html} lang={doc.lang} />
          </div>
        </article>
      ))}
    </div>
  );
}
