"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, useDemoContent } from "./demo-frame";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function CpuCycleDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [stage, setStage] = useState(0);
  const stages = ["ready", "fetch", "decode", "execute", "write"];
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
              value={t.markdown("progress", { stage, total: 4 })}
            />
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={stage === 4}
            onClick={() => setStage(stage + 1)}
          >
            <IcuMarkdownText value={t.markdown("next")} />
          </Button>
        </div>
      }
      conclusion={<IcuMarkdownText value={t.markdown(stages[stage]!)} />}
    >
      <div className="grid grid-cols-2 gap-2 px-6 py-4 text-sm">
        {[
          { name: "PC", value: stage === 0 ? "0x00400000" : "0x00400004" },
          { name: "IR", value: stage === 0 ? "—" : "sub $t0, $t1, $t2" },
          { name: "ALU", value: stage >= 3 ? "9 − 4 = 5" : "—" },
          { name: "$t0", value: stage === 4 ? "5" : "—" },
        ].map(({ name, value }) => (
          <div key={name} className="min-w-0 rounded-md border p-3">
            <div className="text-muted-foreground text-xs">
              <code>{name}</code>
            </div>
            <code className="text-xs">{value}</code>
          </div>
        ))}
      </div>
    </DemoFrame>
  );
}
