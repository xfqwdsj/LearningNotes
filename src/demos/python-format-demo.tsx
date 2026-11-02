"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function PythonFormatDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [width, setWidth] = useState(8),
    [precision, setPrecision] = useState(2);
  const raw = (3.14159).toFixed(precision),
    formatted = raw.padStart(width, " ");
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label={t.markdown("width")}
            value={width}
            display={String(width)}
            min={1}
            max={10}
            onChange={setWidth}
          />
          <DemoRange
            label={t.markdown("precision")}
            value={precision}
            display={String(precision)}
            min={0}
            max={4}
            onChange={setPrecision}
          />
        </>
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", { length: formatted.length })}
        />
      }
    >
      <div className="grid gap-2 px-6 py-4 text-sm">
        <code>{`format(3.14159, ">${width}.${precision}f")`}</code>
        <code className="bg-muted rounded-md border p-3">
          [{formatted.replaceAll(" ", "·")}]
        </code>
      </div>
    </DemoFrame>
  );
}
