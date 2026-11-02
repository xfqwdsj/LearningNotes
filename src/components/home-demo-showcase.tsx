"use client";
import { HomeSection } from "./home-section";
import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, RotateCw } from "lucide-react";
import {
  demoResources,
  isDemoRecord,
  isDemoList,
  type DemoList,
  type DemoManifest,
  type DemoRecord,
} from "@/demos/types";
import { AnimatedHeight } from "./animated-height";
import { DemoPlaceholder } from "./demo-placeholder";
import { DemoRenderer } from "./demo-renderer";
import { Button } from "./ui/button";
import { DemoReferences } from "./demo-references";
import { ScopedLink } from "./scoped-link";
const cache = new Map<string, DemoRecord>();
async function loadDemo(
  url: string,
  signal: AbortSignal,
  privateRecord: boolean,
): Promise<DemoRecord> {
  const cached = privateRecord ? undefined : cache.get(url);
  if (cached) return cached;
  const response = await fetch(url, {
    signal,
    cache: privateRecord ? "no-store" : "force-cache",
    redirect: "error",
  });
  if (!response.ok) throw new Error("Demo request failed");
  const data: unknown = await response.json();
  if (!isDemoRecord(data)) throw new Error("Invalid demo record");
  if (!privateRecord) cache.set(url, data);
  return data;
}
export function nextDemoIndex(count: number, previous?: number): number {
  if (count <= 1) return 0;
  const index = Math.floor(
    Math.random() * (count - (previous === undefined ? 0 : 1)),
  );
  return previous !== undefined && index >= previous ? index + 1 : index;
}
export function HomeDemoShowcase({
  manifest,
  base,
}: {
  manifest: DemoManifest;
  base: string;
}) {
  const t = useTranslations();
  const resources = demoResources(manifest, useLocale());
  const reduced = useReducedMotion();
  const element = useRef<HTMLElement>(null);
  const [request, setRequest] = useState<{ generation: number } | null>(null);
  const lists = useRef(new Map<string, DemoList>());
  const previous = useRef<string | undefined>(undefined);
  const [record, setRecord] = useState<DemoRecord | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  useEffect(() => {
    if (!manifest.count || !element.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setRequest({ generation: 0 });
          observer.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    observer.observe(element.current);
    return () => observer.disconnect();
  }, [manifest]);
  useEffect(() => {
    if (!request) return;
    const controller = new AbortController();
    const privateRecord = base === "/private";
    void (async () => {
      try {
        let list = privateRecord
          ? undefined
          : lists.current.get(resources.index);
        if (!list) {
          const response = await fetch(resources.index, {
            signal: controller.signal,
            cache: privateRecord ? "no-store" : "force-cache",
            redirect: "error",
          });
          if (!response.ok) throw new Error("Demo list request failed");
          const data: unknown = await response.json();
          if (
            !isDemoList(data, base) ||
            !data.entries.length ||
            data.entries.length !== manifest.count
          )
            throw new Error("Invalid demo list");
          list = data;
          if (!privateRecord) lists.current.set(resources.index, list);
        }
        const prior = list.entries.findIndex(
          (entry) => entry.id === previous.current,
        );
        const selected =
          list.entries[
            nextDemoIndex(list.entries.length, prior >= 0 ? prior : undefined)
          ]!;
        const value = await loadDemo(
          selected.href,
          controller.signal,
          privateRecord,
        );
        if (value.id !== selected.id) throw new Error("Mismatched demo record");
        if (!controller.signal.aborted) {
          previous.current = value.id;
          setRecord(value);
          setStatus("ready");
        }
      } catch {
        if (!controller.signal.aborted) setStatus("error");
      }
    })();
    return () => controller.abort();
  }, [base, resources.index, manifest.count, request]);
  if (!manifest.count) return null;
  const refresh = () => {
    setStatus("loading");
    setRequest((previous) => ({
      generation: (previous?.generation ?? 0) + 1,
    }));
  };
  return (
    <HomeSection
      ref={element}
      id="learning-path"
      className="home-demo-showcase"
      aria-busy={status === "loading"}
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">{t("demoUi.eyebrow")}</p>
          <h2>{t("demoUi.title")}</h2>
          <p className="home-demo-description">{t("demoUi.description")}</p>
        </div>
        <div className="home-demo-actions">
          <ScopedLink
            href={`${base}/demos/`}
            base={base}
            className="home-demo-all"
          >
            <span className="link-label">{t("demoUi.viewAll")}</span>
            <ArrowUpRight className="size-3.5" />
          </ScopedLink>
          <Button
            variant="ghost"
            size="sm"
            disabled={status === "loading"}
            onClick={refresh}
          >
            <RotateCw className="size-4" />
            {t(manifest.count > 1 ? "demoUi.refresh" : "demoUi.restart")}
          </Button>
        </div>
      </div>
      <AnimatedHeight className="home-demo-stage">
        {status === "error" ? (
          <div className="demo-error" role="alert">
            <p>{t("demoUi.failed")}</p>
            <Button variant="outline" size="sm" onClick={refresh}>
              {t("demoUi.retry")}
            </Button>
          </div>
        ) : status === "loading" || !record ? (
          <DemoPlaceholder />
        ) : (
          <motion.div
            key={`${record.id}-${request?.generation}`}
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            data-home-demo={record.id}
          >
            <DemoRenderer record={record} />
            <DemoReferences
              record={record}
              base={base}
              className="home-demo-links"
            />
          </motion.div>
        )}
      </AnimatedHeight>
    </HomeSection>
  );
}
