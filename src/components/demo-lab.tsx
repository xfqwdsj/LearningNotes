"use client";
import { DemoMetadata } from "./demo-metadata";
import { MarkdownText } from "./markdown-text";

import {
  useDeferredValue,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { ChevronDown, LoaderCircle, RotateCcw, Search } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import {
  demoResources,
  isDemoIndex,
  isDemoRecord,
  type DemoIndex,
  type DemoIndexEntry,
  type DemoManifest,
  type DemoRecord,
} from "@/demos/types";
import { AnimatedHeight } from "./animated-height";
import { DemoPlaceholder } from "./demo-placeholder";
import { DemoReferences } from "./demo-references";
import { DemoRenderer } from "./demo-renderer";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const batchSize = 18;
const recordCache = new Map<string, DemoRecord>();

function updateDemoQuery(id: string, mode: "push" | "replace") {
  const url = new URL(window.location.href);
  url.searchParams.set("demo", id);
  window.history[mode === "push" ? "pushState" : "replaceState"](
    { demo: id },
    "",
    `${url.pathname}${url.search}${url.hash}`,
  );
}

export function DemoLab({
  manifest,
  base,
}: {
  manifest: DemoManifest;
  base: string;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const resources = demoResources(manifest, locale);
  const searchId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLElement>(null);
  const [reloadCatalog, setReloadCatalog] = useState(0);
  const [catalog, setCatalog] = useState<DemoIndex | null>(null);
  const [catalogStatus, setCatalogStatus] = useState<
    "loading" | "ready" | "error"
  >("loading");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [subject, setSubject] = useState("all");
  const [visibleCount, setVisibleCount] = useState(batchSize);
  const [selected, setSelected] = useState<string | null>(null);
  const [record, setRecord] = useState<DemoRecord | null>(null);
  const [recordErrorId, setRecordErrorId] = useState<string | null>(null);
  const [reloadRecord, setReloadRecord] = useState(0);
  const privateRecord = base === "/private";

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const response = await fetch(resources.catalog, {
          signal: controller.signal,
          cache: privateRecord ? "no-store" : "force-cache",
          redirect: "error",
        });
        if (!response.ok) throw new Error("Demo catalog request failed");
        const data: unknown = await response.json();
        if (!isDemoIndex(data, base) || data.count !== manifest.count)
          throw new Error("Invalid demo catalog");
        if (controller.signal.aborted) return;
        setCatalog(data);
        setCatalogStatus("ready");
        const requested = new URLSearchParams(window.location.search).get(
          "demo",
        );
        setSelected(
          data.entries.find((entry) => entry.id === requested)?.id ??
            data.entries[0]?.id ??
            null,
        );
      } catch {
        if (!controller.signal.aborted) setCatalogStatus("error");
      }
    })();
    return () => controller.abort();
  }, [base, resources.catalog, manifest.count, privateRecord, reloadCatalog]);

  useEffect(() => {
    if (!catalog) return;
    const sync = () => {
      const requested = new URLSearchParams(window.location.search).get("demo");
      const next =
        catalog.entries.find((entry) => entry.id === requested) ??
        catalog.entries[0];
      if (next) {
        setSelected(next.id);
        setRecordErrorId(null);
      }
    };
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, [catalog]);

  const entries = useMemo(() => catalog?.entries ?? [], [catalog]);
  const labels = useMemo(
    () => new Map(entries.map((entry) => [entry.subject, entry.subjectTitle])),
    [entries],
  );
  const subjectOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const entry of entries)
      counts.set(entry.subject, (counts.get(entry.subject) ?? 0) + 1);
    return [...counts.entries()]
      .map(([id, count]) => ({
        id,
        count,
        title: labels.get(id)!,
      }))
      .sort(
        (a, b) =>
          a.title.text.localeCompare(b.title.text, catalog?.locale ?? locale, {
            numeric: true,
          }) || a.id.localeCompare(b.id),
      );
  }, [entries, labels, locale, catalog?.locale]);
  const filtered = useMemo(() => {
    const needle = deferredQuery.trim().toLocaleLowerCase();
    return entries.filter((entry) => {
      if (subject !== "all" && entry.subject !== subject) return false;
      if (!needle) return true;
      return [
        entry.title.text,
        entry.description.text,
        entry.subject,
        labels.get(entry.subject)?.text ?? "",
        ...entry.tags.map((tag) => tag.text),
      ]
        .join("\n")
        .toLocaleLowerCase()
        .includes(needle);
    });
  }, [deferredQuery, entries, labels, subject]);
  const visibleEntries = filtered.slice(0, visibleCount);
  const currentEntry = entries.find((entry) => entry.id === selected);

  useEffect(() => {
    if (!selected || !catalog) {
      return;
    }
    const entry = catalog.entries.find((item) => item.id === selected);
    if (!entry) return;
    const cached = privateRecord ? undefined : recordCache.get(entry.href);
    if (cached) return;
    const controller = new AbortController();
    void (async () => {
      try {
        const response = await fetch(entry.href, {
          signal: controller.signal,
          cache: privateRecord ? "no-store" : "force-cache",
          redirect: "error",
        });
        if (!response.ok) throw new Error("Demo request failed");
        const data: unknown = await response.json();
        if (!isDemoRecord(data) || data.id !== entry.id)
          throw new Error("Invalid demo record");
        if (controller.signal.aborted) return;
        if (!privateRecord) recordCache.set(entry.href, data);
        setRecord(data);
        setRecordErrorId(null);
      } catch {
        if (!controller.signal.aborted) setRecordErrorId(selected);
      }
    })();
    return () => controller.abort();
  }, [catalog, privateRecord, reloadRecord, selected]);

  useEffect(() => {
    const root = listRef.current;
    const target = sentinelRef.current;
    if (!root || !target || visibleCount >= filtered.length) return;
    const observer = new IntersectionObserver(
      (items) => {
        if (items.some((item) => item.isIntersecting))
          setVisibleCount((count) =>
            Math.min(count + batchSize, filtered.length),
          );
      },
      { root, rootMargin: "160px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [filtered.length, visibleCount]);

  const choose = (entry: DemoIndexEntry) => {
    setSelected(entry.id);
    setRecordErrorId(null);
    updateDemoQuery(entry.id, "push");
    if (window.matchMedia("(max-width: 899px)").matches)
      requestAnimationFrame(() =>
        detailRef.current?.scrollIntoView({
          block: "start",
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "auto"
            : "smooth",
        }),
      );
  };

  const retryRecord = () => {
    setRecordErrorId(null);
    setReloadRecord((value) => value + 1);
  };
  const cachedRecord =
    !privateRecord && currentEntry
      ? recordCache.get(currentEntry.href)
      : undefined;
  const activeRecord =
    record?.id === selected ? record : (cachedRecord ?? null);
  const recordFailed = recordErrorId === selected;

  return (
    <div className="lab-browser" aria-busy={catalogStatus === "loading"}>
      <aside className="lab-index" aria-label={t("lab.catalog")}>
        <div className="lab-index-controls">
          <label className="lab-search" htmlFor={searchId}>
            <Search aria-hidden="true" />
            <span className="sr-only">{t("lab.search")}</span>
            <Input
              id={searchId}
              value={query}
              onChange={(event) => {
                setQuery(event.currentTarget.value);
                setVisibleCount(batchSize);
              }}
              placeholder={t("lab.searchPlaceholder")}
              autoComplete="off"
            />
          </label>
          <div className="lab-subject-filter" aria-label={t("lab.subjects")}>
            <button
              type="button"
              aria-pressed={subject === "all"}
              onClick={() => {
                setSubject("all");
                setVisibleCount(batchSize);
              }}
            >
              {t("lab.allSubjects")}
              <span className="lab-subject-count">{manifest.count}</span>
            </button>
            {subjectOptions.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={subject === item.id}
                onClick={() => {
                  setSubject(item.id);
                  setVisibleCount(batchSize);
                }}
              >
                <MarkdownText value={item.title} />
                <span className="lab-subject-count">{item.count}</span>
              </button>
            ))}
          </div>
          <p className="lab-result-count" aria-live="polite">
            {t("lab.resultCount", { count: filtered.length })}
          </p>
        </div>

        <div ref={listRef} className="lab-index-list">
          {catalogStatus === "loading" ? (
            <div className="lab-list-loading" role="status">
              <LoaderCircle className="size-4 motion-safe:animate-spin" />
              {t("lab.loading")}
            </div>
          ) : catalogStatus === "error" ? (
            <div className="lab-message" role="alert">
              <p>{t("lab.loadFailed")}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCatalog(null);
                  setCatalogStatus("loading");
                  setReloadCatalog((value) => value + 1);
                }}
              >
                <RotateCcw className="size-4" />
                {t("demoUi.retry")}
              </Button>
            </div>
          ) : filtered.length ? (
            <>
              <ol>
                {visibleEntries.map((entry, index) => {
                  const active = entry.id === selected;
                  return (
                    <li key={entry.id}>
                      <button
                        type="button"
                        className="lab-demo-option"
                        data-demo-id={entry.id}
                        aria-current={active ? "true" : undefined}
                        aria-controls="lab-preview"
                        onClick={() => choose(entry)}
                      >
                        <span className="lab-demo-order">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div className="lab-demo-copy">
                          <strong>
                            <MarkdownText value={entry.title} />
                          </strong>
                          <div>
                            <MarkdownText value={entry.description} as="div" />
                          </div>
                          <DemoMetadata
                            entry={entry}
                            tagLimit={2}
                            className="lab-demo-meta"
                          />
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ol>
              {visibleCount < filtered.length && (
                <>
                  <div ref={sentinelRef} className="lab-load-sentinel" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="lab-load-more"
                    onClick={() =>
                      setVisibleCount((count) =>
                        Math.min(count + batchSize, filtered.length),
                      )
                    }
                  >
                    <ChevronDown className="size-4" />
                    {t("lab.loadMore")}
                  </Button>
                </>
              )}
            </>
          ) : (
            <div className="lab-message">
              <p>{t("lab.empty")}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setQuery("");
                  setSubject("all");
                  setVisibleCount(batchSize);
                }}
              >
                {t("lab.clearFilters")}
              </Button>
            </div>
          )}
        </div>
      </aside>

      <section
        ref={detailRef}
        id="lab-preview"
        className="lab-preview"
        aria-labelledby="lab-preview-title"
      >
        <div className="lab-preview-heading">
          <div>
            <p className="eyebrow">{t("lab.previewEyebrow")}</p>
            <h2 id="lab-preview-title" className="sr-only">
              {currentEntry?.title.text ?? t("lab.chooseDemo")}
            </h2>
          </div>
          {currentEntry && (
            <DemoMetadata
              entry={currentEntry}
              tagLimit={3}
              className="lab-preview-meta"
            />
          )}
        </div>
        <AnimatedHeight className="lab-preview-stage">
          {recordFailed ? (
            <div className="lab-message lab-preview-message" role="alert">
              <p>{t("demoUi.failed")}</p>
              <Button variant="outline" size="sm" onClick={retryRecord}>
                <RotateCcw className="size-4" />
                {t("demoUi.retry")}
              </Button>
            </div>
          ) : activeRecord ? (
            <div data-lab-demo={activeRecord.id}>
              <DemoRenderer record={activeRecord} />
            </div>
          ) : (
            <DemoPlaceholder />
          )}
        </AnimatedHeight>
        {activeRecord && (
          <div className="lab-locations">
            <p>{t("lab.locations")}</p>
            <DemoReferences record={activeRecord} base={base} />
          </div>
        )}
      </section>
    </div>
  );
}
