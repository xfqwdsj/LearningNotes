"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, useDemoContent } from "./demo-frame";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function CPointerPrecedenceDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [mode, setMode] = useState<"pointer" | "value">("pointer");
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
          {(["pointer", "value"] as const).map((v) => (
            <Button
              key={v}
              type="button"
              size="sm"
              variant={mode === v ? "default" : "outline"}
              className="w-full"
              aria-pressed={mode === v}
              onClick={() => setMode(v)}
            >
              <code>{v === "pointer" ? "*p++" : "(*p)++"}</code>
            </Button>
          ))}
        </div>
      }
      conclusion={<IcuMarkdownText value={t.markdown(`${mode}Result`)} />}
    >
      <div className="grid grid-cols-2 gap-2 px-6 py-4 text-sm">
        <div className="rounded-md border p-3">
          <IcuMarkdownText value={t.markdown("index")} />:{" "}
          {mode === "pointer" ? 1 : 0}
        </div>
        <div className="rounded-md border p-3">
          <IcuMarkdownText value={t.markdown("firstValue")} />:{" "}
          {mode === "pointer" ? 4 : 5}
        </div>
      </div>
    </DemoFrame>
  );
}
