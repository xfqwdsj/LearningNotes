"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, useDemoContent } from "./demo-frame";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
const stages = ["firmware", "loader", "kernel", "userspace"] as const;
export default function BootStagesDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [stage, setStage] = useState(0);
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
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
              value={t.markdown("progress", { stage: stage + 1, total: 4 })}
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
      }
      conclusion={
        <IcuMarkdownText value={t.markdown(`${stages[stage]}Description`)} />
      }
    >
      <div
        className="grid grid-cols-2 gap-2 px-6 py-4"
        role="img"
        aria-label={t("diagram", { stage: t(stages[stage]!) })}
      >
        {stages.map((v, i) => (
          <div
            key={v}
            className={`rounded-md border px-3 py-3 text-center text-sm ${stage === i ? "border-foreground bg-muted font-bold" : "text-muted-foreground"}`}
          >
            <IcuMarkdownText value={t.markdown(v)} />
          </div>
        ))}
      </div>
    </DemoFrame>
  );
}
