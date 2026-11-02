"use client";
import { KeyboardShortcut } from "./keyboard-shortcut";
import {
  useKeyboardPlatform,
  useKeyboardShortcut,
} from "./use-keyboard-shortcut";
import { resolveShortcut } from "@/lib/keyboard";
import { MarkdownText } from "@/components/markdown-text";
import { EntryLink } from "./entry-link";
import { languageName } from "@/lib/content/localization";
import { localizedTitle } from "@/lib/content/taxonomy";
import { getLabels } from "@/i18n/labels";
import { useLocale, useTranslations } from "next-intl";
import { fetchSearchIndex } from "@/lib/search-index";
import { SummaryPreview } from "./summary-preview";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, LockKeyhole } from "lucide-react";
import { Index } from "flexsearch";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { type SearchDocument } from "@/lib/content/types";
export function SearchDialog({ base }: { base: string }) {
  const t = useTranslations();
  const locale = useLocale();
  const { kindLabels, taskLabels } = getLabels(t);

  const [open, setOpen] = useState(false);
  const platform = useKeyboardPlatform();
  useKeyboardShortcut("search", () => setOpen((value) => !value));
  const [query, setQuery] = useState("");
  const [documents, setDocuments] = useState<SearchDocument[]>([]);
  const [scope, setScope] = useState<"loading" | "both" | "public" | "private">(
    "loading",
  );
  const [error, setError] = useState(false);
  const load = useCallback(async () => {
    const results = await Promise.allSettled([
      fetchSearchIndex(base),
      fetchSearchIndex(base ? "" : "/private"),
    ]);
    setDocuments(
      results.flatMap((result) =>
        result.status === "fulfilled" ? result.value : [],
      ),
    );
    const privateIndex = results[base ? 0 : 1];
    const publicIndex = results[base ? 1 : 0];
    setScope(
      privateIndex?.status === "fulfilled"
        ? publicIndex?.status === "fulfilled"
          ? "both"
          : "private"
        : "public",
    );
    setError(results.every((result) => result.status === "rejected"));
  }, [base]);
  useEffect(() => {
    const focus = () => {
      if (open) void load();
    };
    window.addEventListener("focus", focus);
    return () => {
      window.removeEventListener("focus", focus);
    };
  }, [open, load]);
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(timer);
  }, [open, load]);
  const engine = useMemo(() => {
    const index = new Index({ tokenize: "full", encoder: "CJK" });
    documents.forEach((doc, i) =>
      index.add(
        i,
        `${doc.title.text} ${doc.id ?? ""} ${Object.values(doc.subjectTitles)
          .map((value) => value.text)
          .join(" ")} ${Object.values(doc.courseTitles)
          .map((value) => value.text)
          .join(" ")} ${doc.text}`,
      ),
    );
    return index;
  }, [documents]);
  const results = useMemo(() => {
    if (!query.trim()) return documents.slice(0, 8);
    const lower = query.toLocaleLowerCase();
    const exact = documents.filter(
      (doc) =>
        doc.id === query ||
        `${doc.title.text} ${Object.values(doc.subjectTitles)
          .map((value) => value.text)
          .join(" ")} ${Object.values(doc.courseTitles)
          .map((value) => value.text)
          .join(" ")} ${doc.text}`
          .toLocaleLowerCase()
          .includes(lower),
    );
    const rest = engine
      .search(query, { limit: 24 })
      .map((id) => documents[Number(id)])
      .filter((doc): doc is SearchDocument => Boolean(doc));
    return [
      ...new Map([...exact, ...rest].map((doc) => [doc.href, doc])).values(),
    ].slice(0, 24);
  }, [documents, query, engine]);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          aria-label={t("search.trigger")}
          aria-keyshortcuts={
            platform ? resolveShortcut("search", platform).binding : undefined
          }
          className="search-trigger text-muted-foreground"
        >
          <Search className="size-4" />
          <span>{t("search.trigger")}</span>
          <KeyboardShortcut shortcut="search" />
        </Button>
      </DialogTrigger>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogTitle className="sr-only">{t("search.title")}</DialogTitle>
        <DialogDescription className="sr-only">
          {t("search.description")}
        </DialogDescription>
        <div className="flex items-center gap-3 border-b p-5">
          <Search className="text-muted-foreground size-5" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("search.placeholder")}
            className="border-0 shadow-none focus-visible:ring-0"
          />
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-2" aria-live="polite">
          {error ? (
            <p className="text-muted-foreground p-6 text-sm">
              {t("search.error")}
            </p>
          ) : results.length ? (
            results.map((doc) => (
              <article key={doc.href} className="search-result entry-card">
                <EntryLink
                  base={base}
                  onClick={(event) => {
                    if (
                      event.button === 0 &&
                      !event.metaKey &&
                      !event.ctrlKey &&
                      !event.shiftKey &&
                      !event.altKey
                    )
                      setOpen(false);
                  }}
                  href={doc.href}
                  lang={doc.lang}
                  className="search-result-link entry-primary"
                >
                  <span className="flex items-center gap-2 font-medium">
                    {doc.private && <LockKeyhole className="size-3" />}
                    <MarkdownText value={doc.title} />
                  </span>
                </EntryLink>
                <div className="entry-meta" lang={locale}>
                  {doc.lang !== locale && (
                    <>{languageName(doc.lang, locale)} / </>
                  )}
                  <span
                    dangerouslySetInnerHTML={{
                      __html: localizedTitle(doc.subjectTitles, locale).html,
                    }}
                  />{" "}
                  /{" "}
                  {doc.course && (
                    <>
                      <span
                        dangerouslySetInnerHTML={{
                          __html: localizedTitle(doc.courseTitles, locale).html,
                        }}
                      />{" "}
                      /{" "}
                    </>
                  )}
                  {doc.taskType
                    ? taskLabels[doc.taskType]
                    : kindLabels[doc.kind]}
                </div>
                <SummaryPreview lang={doc.lang} html={doc.description.html} />
                {doc.references?.length ? (
                  <div className="search-references">
                    <p className="search-references-title">
                      {t("references.search", {
                        count: doc.references.length,
                      })}
                    </p>
                    <ul>
                      {doc.references.slice(0, 4).map((reference, index) => (
                        <li key={`${reference.href}-${index}`}>
                          <EntryLink
                            href={reference.href}
                            base={base}
                            onClick={(event) => {
                              if (
                                event.button === 0 &&
                                !event.metaKey &&
                                !event.ctrlKey &&
                                !event.shiftKey &&
                                !event.altKey
                              )
                                setOpen(false);
                            }}
                          >
                            <MarkdownText value={reference.title} />
                            {reference.section && (
                              <>
                                {" "}
                                · <MarkdownText value={reference.section} />
                              </>
                            )}
                          </EntryLink>
                        </li>
                      ))}
                    </ul>
                    {doc.references.length > 4 && (
                      <p className="search-references-more">
                        {t("references.searchMore", {
                          count: doc.references.length - 4,
                        })}
                      </p>
                    )}
                  </div>
                ) : null}
              </article>
            ))
          ) : (
            <p className="text-muted-foreground p-8 text-center text-sm">
              {t("search.empty")}
            </p>
          )}
        </div>
        <div className="text-muted-foreground flex justify-between border-t px-5 py-3 text-xs">
          <span>
            {scope === "loading"
              ? t("search.loading")
              : scope === "both"
                ? t("search.privateIncluded")
                : scope === "private"
                  ? t("search.privateOnly")
                  : t("search.publicOnly")}
          </span>
          <span className="flex items-center gap-2">
            <KeyboardShortcut shortcut="dismiss" />
            {t("common.close")}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
