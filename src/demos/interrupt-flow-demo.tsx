"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, useDemoContent } from "./demo-frame";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function InterruptFlowDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [event, setEvent] = useState<"device" | "timer">("device"),
    [stage, setStage] = useState(0);
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <div
            role="group"
            aria-label={t("event")}
            className="grid grid-cols-2 gap-2"
          >
            {(["device", "timer"] as const).map((v) => (
              <Button
                key={v}
                type="button"
                size="sm"
                variant={event === v ? "default" : "outline"}
                className="w-full"
                aria-pressed={event === v}
                onClick={() => {
                  setEvent(v);
                  setStage(0);
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
              disabled={stage === 0}
              onClick={() => setStage(stage - 1)}
            >
              <IcuMarkdownText value={t.markdown("previous")} />
            </Button>
            <span>
              <IcuMarkdownText
                value={t.markdown("progress", { stage, total: 3 })}
              />
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={stage === 3}
              onClick={() => setStage(stage + 1)}
            >
              <IcuMarkdownText value={t.markdown("next")} />
            </Button>
          </div>
        </>
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown(`stage${stage}`, { event: t.markdown(event) })}
        />
      }
    >
      <div
        className="grid grid-cols-3 gap-2 px-6 py-4"
        role="img"
        aria-label={t("diagram", { stage })}
      >
        {["request", "handler", "resume"].map((v, i) => (
          <div
            key={v}
            className={`rounded-md border px-2 py-3 text-center text-xs ${stage > i ? "border-foreground bg-muted" : "text-muted-foreground"}`}
          >
            <IcuMarkdownText value={t.markdown(v)} />
          </div>
        ))}
      </div>
    </DemoFrame>
  );
}
