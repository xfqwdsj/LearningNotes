"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, useDemoContent } from "./demo-frame";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function PythonSortDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [mode, setMode] = useState<"sorted" | "sort">("sorted");
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
          {(["sorted", "sort"] as const).map((v) => (
            <Button
              key={v}
              type="button"
              size="sm"
              variant={v === mode ? "default" : "outline"}
              className="w-full"
              aria-pressed={v === mode}
              onClick={() => setMode(v)}
            >
              <code>{v === "sorted" ? "sorted(a)" : "a.sort()"}</code>
            </Button>
          ))}
        </div>
      }
      conclusion={<IcuMarkdownText value={t.markdown(`${mode}Result`)} />}
    >
      <div className="grid grid-cols-2 gap-3 px-6 py-4 text-sm">
        <div className="rounded-md border p-3">
          <div className="text-muted-foreground text-xs">
            <IcuMarkdownText value={t.markdown("original")} />
          </div>
          <code>{mode === "sorted" ? "[3, 1, 2]" : "[1, 2, 3]"}</code>
        </div>
        <div className="rounded-md border p-3">
          <div className="text-muted-foreground text-xs">
            <IcuMarkdownText value={t.markdown("returned")} />
          </div>
          <code>{mode === "sorted" ? "[1, 2, 3]" : "None"}</code>
        </div>
      </div>
    </DemoFrame>
  );
}
