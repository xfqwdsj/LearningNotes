"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function ProbabilityAdditionDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [a, setA] = useState(0.5),
    [bInA, setBInA] = useState(0.4),
    [bOutside, setBOutside] = useState(0.4);
  const overlap = a * bInA,
    b = overlap + (1 - a) * bOutside,
    union = a + b - overlap;
  const num = (x: number) => format.number(x, { maximumFractionDigits: 3 });
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label={t.markdown("a")}
            value={a}
            display={num(a)}
            min={0.05}
            max={0.95}
            step={0.05}
            onChange={setA}
          />
          <DemoRange
            label={t.markdown("bInA")}
            value={bInA}
            display={num(bInA)}
            min={0}
            max={1}
            step={0.05}
            onChange={setBInA}
          />
          <DemoRange
            label={t.markdown("bOutside")}
            value={bOutside}
            display={num(bOutside)}
            min={0}
            max={1}
            step={0.05}
            onChange={setBOutside}
          />
        </>
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", {
            a: num(a),
            b: num(b),
            overlap: num(overlap),
            union: num(union),
          })}
        />
      }
    >
      <svg
        viewBox="0 0 460 260"
        role="img"
        aria-label={t("diagram", { union: num(union) })}
      >
        <rect
          x="50"
          y="25"
          width="360"
          height="200"
          fill="currentColor"
          opacity=".05"
        />
        <rect
          x="50"
          y="25"
          width={360 * a}
          height="200"
          fill="currentColor"
          opacity=".28"
        />
        <rect
          x="50"
          y="25"
          width={360 * a}
          height={200 * bInA}
          fill="currentColor"
          opacity=".55"
        />
        <rect
          x={50 + 360 * a}
          y="25"
          width={360 * (1 - a)}
          height={200 * bOutside}
          fill="currentColor"
          opacity=".55"
        />
        <rect
          x="50"
          y="25"
          width="360"
          height="200"
          fill="none"
          stroke="currentColor"
          opacity=".3"
        />
      </svg>
    </DemoFrame>
  );
}
