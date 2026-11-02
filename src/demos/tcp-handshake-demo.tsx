"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, useDemoContent } from "./demo-frame";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function TcpHandshakeDemo(props: DemoComponentProps) {
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
              value={t.markdown("progress", { step, total: 3 })}
            />
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={step === 3}
            onClick={() => setStep(step + 1)}
          >
            <IcuMarkdownText value={t.markdown("next")} />
          </Button>
        </div>
      }
      conclusion={<IcuMarkdownText value={t.markdown(`stage${step}`)} />}
    >
      <div
        className="grid gap-2 px-6 py-4 text-sm"
        role="img"
        aria-label={t("diagram", { step })}
      >
        {[t("first"), t("second"), t("third")].map((v, i) => (
          <div
            key={v}
            className={`rounded-md border px-3 py-2 ${i < step ? "border-foreground bg-muted" : "text-muted-foreground opacity-40"}`}
          >
            {v}
          </div>
        ))}
      </div>
    </DemoFrame>
  );
}
