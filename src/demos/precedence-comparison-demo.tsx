"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function PrecedenceComparisonDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [a, setA] = useState(2),
    [b, setB] = useState(3),
    [c, setC] = useState(2);
  const cValue = a & (b === c ? 1 : 0),
    pythonValue = (a & b) === c;
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label="a"
            value={a}
            display={String(a)}
            min={0}
            max={7}
            onChange={setA}
          />
          <DemoRange
            label="b"
            value={b}
            display={String(b)}
            min={0}
            max={7}
            onChange={setB}
          />
          <DemoRange
            label="c"
            value={c}
            display={String(c)}
            min={0}
            max={7}
            onChange={setC}
          />
        </>
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", {
            cValue,
            pythonValue: pythonValue ? "True" : "False",
          })}
        />
      }
    >
      <div className="grid gap-2 px-6 py-4 text-sm">
        <div className="rounded-md border p-3">
          <strong>C</strong> <code>a &amp; (b == c)</code> → {cValue}
        </div>
        <div className="rounded-md border p-3">
          <strong>Python</strong> <code>(a &amp; b) == c</code> →{" "}
          {pythonValue ? "True" : "False"}
        </div>
      </div>
    </DemoFrame>
  );
}
