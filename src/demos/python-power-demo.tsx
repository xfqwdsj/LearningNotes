"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function PythonPowerDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [exponent, setExponent] = useState(2);
  const without = -(2 ** exponent),
    withParens = (-2) ** exponent;
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <DemoRange
          label={t.markdown("exponent")}
          value={exponent}
          display={String(exponent)}
          min={1}
          max={5}
          onChange={setExponent}
        />
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", { without, withParens })}
        />
      }
    >
      <div className="grid grid-cols-2 gap-2 px-6 py-4 text-sm">
        <div className="rounded-md border p-3">
          <code>{`-2**${exponent}`}</code>
          <div className="mt-2">{without}</div>
        </div>
        <div className="rounded-md border p-3">
          <code>{`(-2)**${exponent}`}</code>
          <div className="mt-2">{withParens}</div>
        </div>
      </div>
    </DemoFrame>
  );
}
