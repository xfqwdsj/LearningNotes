"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, useDemoContent } from "./demo-frame";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
const fcfs = [
    { job: 1, start: 0, end: 6 },
    { job: 2, start: 6, end: 10 },
    { job: 3, start: 10, end: 13 },
  ],
  rr = [
    { job: 1, start: 0, end: 2 },
    { job: 2, start: 2, end: 4 },
    { job: 3, start: 4, end: 6 },
    { job: 1, start: 6, end: 8 },
    { job: 2, start: 8, end: 10 },
    { job: 3, start: 10, end: 11 },
    { job: 1, start: 11, end: 13 },
  ];
export default function SchedulingDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [mode, setMode] = useState<"fcfs" | "rr">("fcfs");
  const segments = mode === "fcfs" ? fcfs : rr;
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <div
          role="group"
          aria-label={t("choose")}
          className="grid grid-cols-2 gap-2"
        >
          {(["fcfs", "rr"] as const).map((v) => (
            <Button
              key={v}
              type="button"
              size="sm"
              variant={mode === v ? "default" : "outline"}
              aria-pressed={mode === v}
              className="w-full"
              onClick={() => setMode(v)}
            >
              <IcuMarkdownText value={t.markdown(v)} />
            </Button>
          ))}
        </div>
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown(mode === "fcfs" ? "fcfsResult" : "rrResult")}
        />
      }
    >
      <div className="px-6 py-4">
        <div
          className="flex h-12 overflow-hidden rounded-md border"
          role="img"
          aria-label={t(mode === "fcfs" ? "fcfsDiagram" : "rrDiagram")}
        >
          {segments.map((segment, i) => (
            <div
              key={i}
              className="flex min-w-0 items-center justify-center border-r text-xs last:border-r-0"
              style={{
                width: `${((segment.end - segment.start) / 13) * 100}%`,
                background: `color-mix(in srgb, var(--foreground) ${segment.job * 8 + 5}%, transparent)`,
              }}
            >
              <code>P{segment.job}</code>
            </div>
          ))}
        </div>
        <div className="text-muted-foreground mt-2 flex justify-between text-xs">
          <span>0</span>
          <span>13</span>
        </div>
      </div>
    </DemoFrame>
  );
}
