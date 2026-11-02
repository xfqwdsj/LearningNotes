"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, useDemoContent } from "./demo-frame";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function FakeCoinDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [coin, setCoin] = useState(1),
    [stage, setStage] = useState(0);
  const group = Math.floor((coin - 1) / 3),
    candidates = Array.from({ length: 3 }, (_, i) => group * 3 + i + 1);
  const compare =
    coin === candidates[0]
      ? "left"
      : coin === candidates[1]
        ? "right"
        : "balanced";
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <div
            role="group"
            aria-label={t("select")}
            className="grid grid-cols-9 gap-1"
          >
            {Array.from({ length: 9 }, (_, i) => i + 1).map((value) => (
              <Button
                key={value}
                type="button"
                size="sm"
                variant={coin === value ? "default" : "outline"}
                aria-label={t("coin", { value })}
                aria-pressed={coin === value}
                className="w-full min-w-0 px-0"
                onClick={() => {
                  setCoin(value);
                  setStage(0);
                }}
              >
                {value}
              </Button>
            ))}
          </div>
          <div className="demo-action-row">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={stage === 2}
              onClick={() => setStage(stage + 1)}
            >
              <IcuMarkdownText value={t.markdown("weigh")} />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={stage === 0}
              onClick={() => setStage(0)}
            >
              <IcuMarkdownText value={t.markdown("reset")} />
            </Button>
          </div>
        </>
      }
      conclusion={
        <IcuMarkdownText
          value={
            stage === 0
              ? t.markdown("start")
              : stage === 1
                ? t.markdown("first", {
                    outcome: t.markdown(
                      group === 0 ? "left" : group === 1 ? "right" : "balanced",
                    ),
                    group: candidates.join(", "),
                  })
                : t.markdown("second", { outcome: t.markdown(compare), coin })
          }
        />
      }
    >
      <div className="px-6 py-4 text-sm">
        <IcuMarkdownText value={t.markdown("setup")} />
      </div>
    </DemoFrame>
  );
}
