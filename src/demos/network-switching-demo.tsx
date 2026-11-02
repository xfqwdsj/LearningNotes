"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, useDemoContent } from "./demo-frame";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function NetworkSwitchingDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [mode, setMode] = useState<"circuit" | "packet">("circuit");
  const slots =
    mode === "circuit"
      ? ["A", "B", "A", "B", "A", "B"]
      : ["A", "A", "A", "—", "—", "—"];
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
          {(["circuit", "packet"] as const).map((v) => (
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
          value={t.markdown(
            mode === "circuit" ? "circuitResult" : "packetResult",
          )}
        />
      }
    >
      <div className="px-6 py-4">
        <div
          className="grid grid-cols-6 gap-1"
          role="img"
          aria-label={t(
            mode === "circuit" ? "circuitDiagram" : "packetDiagram",
          )}
        >
          {slots.map((v, i) => (
            <div
              key={i}
              className={`rounded-md border py-3 text-center text-xs ${v === "A" ? "border-foreground bg-muted" : "text-muted-foreground"}`}
            >
              {v}
            </div>
          ))}
        </div>
        <p className="text-muted-foreground mt-2 mb-0 text-xs">
          <IcuMarkdownText value={t.markdown("timeline")} />
        </p>
      </div>
    </DemoFrame>
  );
}
