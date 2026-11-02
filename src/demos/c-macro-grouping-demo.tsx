"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function CMacroGroupingDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [n, setN] = useState(2);
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <DemoRange
          label={t.markdown("operand")}
          value={n}
          display={String(n)}
          min={0}
          max={8}
          onChange={setN}
        />
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", { bad: 1 + 2 * n, good: (1 + n) ** 2 })}
        />
      }
    >
      <div className="grid gap-2 px-6 py-4 text-sm">
        <div className="rounded-md border p-3">
          <code>{`1 + ${n} * 1 + ${n}`}</code>
        </div>
        <div className="rounded-md border p-3">
          <code>{`(1 + ${n}) * (1 + ${n})`}</code>
        </div>
      </div>
    </DemoFrame>
  );
}
