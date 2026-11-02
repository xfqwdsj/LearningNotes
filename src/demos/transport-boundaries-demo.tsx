"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, useDemoContent } from "./demo-frame";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function TransportBoundariesDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [mode, setMode] = useState<"tcp" | "udp">("tcp");
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
          {(["tcp", "udp"] as const).map((v) => (
            <Button
              key={v}
              type="button"
              size="sm"
              variant={mode === v ? "default" : "outline"}
              className="w-full"
              aria-pressed={mode === v}
              onClick={() => setMode(v)}
            >
              {v.toUpperCase()}
            </Button>
          ))}
        </div>
      }
      conclusion={<IcuMarkdownText value={t.markdown(`${mode}Result`)} />}
    >
      <div className="grid gap-3 px-6 py-4 text-sm">
        <div>
          <IcuMarkdownText value={t.markdown("sent")} />: <code>ABC</code> ·{" "}
          <code>DE</code>
        </div>
        <div>
          <IcuMarkdownText value={t.markdown("received")} />:{" "}
          {mode === "tcp" ? (
            <>
              <code>AB</code> · <code>CDE</code>
            </>
          ) : (
            <>
              <code>ABC</code> · <code>DE</code>
            </>
          )}
        </div>
      </div>
    </DemoFrame>
  );
}
