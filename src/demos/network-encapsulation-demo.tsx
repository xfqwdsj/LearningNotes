"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, useDemoContent } from "./demo-frame";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
const steps = ["application", "transport", "network", "link"] as const;
export default function NetworkEncapsulationDemo(props: DemoComponentProps) {
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
              value={t.markdown("progress", {
                step: step + 1,
                total: steps.length,
              })}
            />
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={step === steps.length - 1}
            onClick={() => setStep(step + 1)}
          >
            <IcuMarkdownText value={t.markdown("next")} />
          </Button>
        </div>
      }
      conclusion={
        <IcuMarkdownText value={t.markdown(`${steps[step]}Description`)} />
      }
    >
      <div
        className="flex flex-wrap gap-1 px-6 py-5"
        role="img"
        aria-label={t("diagram", { layer: t(steps[step]!) })}
      >
        {["link", "network", "transport", "application"].map((s, i) => (
          <div
            key={s}
            className={`rounded-md border px-3 py-2 text-xs ${3 - i <= step ? "border-foreground bg-muted" : "text-muted-foreground opacity-40"}`}
          >
            <IcuMarkdownText value={t.markdown(s)} />
          </div>
        ))}
      </div>
    </DemoFrame>
  );
}
