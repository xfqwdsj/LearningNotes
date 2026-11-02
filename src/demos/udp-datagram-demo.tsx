"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, useDemoContent } from "./demo-frame";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function UdpDatagramDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [mode, setMode] = useState<"normal" | "reorder" | "loss">("normal");
  const items =
    mode === "normal" ? ["A", "B"] : mode === "reorder" ? ["B", "A"] : ["A"];
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <div
          role="group"
          aria-label={t("choose")}
          className="grid grid-cols-3 gap-2"
        >
          {(["normal", "reorder", "loss"] as const).map((v) => (
            <Button
              key={v}
              type="button"
              size="sm"
              variant={mode === v ? "default" : "outline"}
              className="w-full min-w-0 px-0"
              aria-pressed={mode === v}
              onClick={() => setMode(v)}
            >
              <IcuMarkdownText value={t.markdown(v)} />
            </Button>
          ))}
        </div>
      }
      conclusion={<IcuMarkdownText value={t.markdown(`${mode}Result`)} />}
    >
      <div className="grid grid-cols-2 gap-3 px-6 py-4">
        <div className="rounded-md border p-3 text-sm">
          <span className="text-muted-foreground text-xs">
            <IcuMarkdownText value={t.markdown("sent")} />
          </span>
          <div className="mt-2">
            <code>A</code> · <code>B</code>
          </div>
        </div>
        <div className="rounded-md border p-3 text-sm">
          <span className="text-muted-foreground text-xs">
            <IcuMarkdownText value={t.markdown("received")} />
          </span>
          <div className="mt-2">
            {items.map((item, index) => (
              <span key={item}>
                <code>{item}</code>
                {index < items.length - 1 ? " · " : ""}
              </span>
            ))}
          </div>
        </div>
      </div>
    </DemoFrame>
  );
}
