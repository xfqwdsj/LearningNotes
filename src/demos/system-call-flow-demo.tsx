"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, useDemoContent } from "./demo-frame";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function SystemCallFlowDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [step, setStep] = useState(0);
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
            disabled={step === 0}
            onClick={() => setStep(step - 1)}
          >
            <IcuMarkdownText value={t.markdown("previous")} />
          </Button>
          <span>
            <IcuMarkdownText
              value={t.markdown("progress", { step, total: 4 })}
            />
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={step === 4}
            onClick={() => setStep(step + 1)}
          >
            <IcuMarkdownText value={t.markdown("next")} />
          </Button>
        </div>
      }
      conclusion={<IcuMarkdownText value={t.markdown(`stage${step}`)} />}
    >
      <div
        className="grid grid-cols-2 gap-2 px-6 py-4"
        role="img"
        aria-label={t("diagram", { step })}
      >
        {["user", "kernel"].map((v, i) => (
          <div
            key={v}
            className={`rounded-md border px-3 py-4 text-center text-sm ${(step === 0 || step === 4 ? i === 0 : i === 1) ? "border-foreground bg-muted" : "text-muted-foreground"}`}
          >
            <IcuMarkdownText value={t.markdown(v)} />
          </div>
        ))}
      </div>
    </DemoFrame>
  );
}
