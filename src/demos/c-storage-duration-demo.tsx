"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, useDemoContent } from "./demo-frame";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function CStorageDurationDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [mode, setMode] = useState<"automatic" | "static">("automatic"),
    [calls, setCalls] = useState(0);
  const value = calls === 0 ? "—" : mode === "automatic" ? "1" : String(calls);
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <div
            role="group"
            aria-label={t("choose")}
            className="grid grid-cols-2 gap-2"
          >
            {(["automatic", "static"] as const).map((v) => (
              <Button
                key={v}
                type="button"
                size="sm"
                variant={mode === v ? "default" : "outline"}
                className="w-full"
                aria-pressed={mode === v}
                onClick={() => {
                  setMode(v);
                  setCalls(0);
                }}
              >
                <IcuMarkdownText value={t.markdown(v)} />
              </Button>
            ))}
          </div>
          <div className="demo-action-row">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setCalls(calls + 1)}
            >
              <IcuMarkdownText value={t.markdown("call")} />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setCalls(0)}
            >
              <IcuMarkdownText value={t.markdown("reset")} />
            </Button>
          </div>
        </>
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown(
            calls === 0
              ? "initial"
              : mode === "automatic"
                ? "autoResult"
                : "staticResult",
            { calls, value },
          )}
        />
      }
    >
      <div className="px-6 py-4 text-sm">
        <code>
          {mode === "automatic" ? "int count = 0;" : "static int count = 0;"}
        </code>
        <div className="mt-2">
          <code>count++;</code>
        </div>
      </div>
    </DemoFrame>
  );
}
