"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, useDemoContent } from "./demo-frame";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function MultiplexingDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [mode, setMode] = useState<"tdm" | "fdm">("tdm");
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
          {(["tdm", "fdm"] as const).map((v) => (
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
          value={t.markdown(mode === "tdm" ? "timeResult" : "frequencyResult")}
        />
      }
    >
      <div
        className="px-6 py-4"
        role="img"
        aria-label={t(mode === "tdm" ? "timeDiagram" : "frequencyDiagram")}
      >
        <div
          className={`grid gap-2 ${mode === "tdm" ? "grid-cols-4" : "grid-cols-1"}`}
        >
          {(mode === "tdm" ? ["A", "B", "A", "B"] : ["A", "B"]).map((v, i) => (
            <div
              key={i}
              className="bg-muted rounded-md border px-2 py-3 text-center text-sm"
            >
              {v}
            </div>
          ))}
        </div>
        <p className="text-muted-foreground mt-2 mb-0 text-xs">
          <IcuMarkdownText
            value={t.markdown(mode === "tdm" ? "timeAxis" : "frequencyAxis")}
          />
        </p>
      </div>
    </DemoFrame>
  );
}
