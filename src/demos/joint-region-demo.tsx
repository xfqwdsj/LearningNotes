"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function JointRegionDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [a, setA] = useState(0.7);
  const num = (v: number) => format.number(v, { maximumFractionDigits: 3 });
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <DemoRange
          label={t.markdown("threshold")}
          value={a}
          display={num(a)}
          min={0}
          max={1}
          step={0.05}
          onChange={setA}
        />
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", { value: num((a * a) / 2) })}
        />
      }
    >
      <svg
        viewBox="0 0 420 300"
        role="img"
        aria-label={t("diagram", { value: num((a * a) / 2) })}
      >
        <rect
          x="50"
          y="30"
          width="220"
          height="220"
          fill="currentColor"
          opacity=".08"
        />
        <polygon
          points={`50,250 ${50 + 220 * a},250 50,${250 - 220 * a}`}
          fill="currentColor"
          opacity=".6"
        />
        <rect
          x="50"
          y="30"
          width="220"
          height="220"
          fill="none"
          stroke="currentColor"
        />
        <SvgTex x={40} y={255} width={25} source="0" />
        <SvgTex x={260} y={255} width={25} source="1" />
        <SvgTex x={15} y={25} width={25} source="1" />
        <SvgTex x={280} y={245} width={25} source="x" />
        <SvgTex x={20} y={5} width={25} source="y" />
      </svg>
    </DemoFrame>
  );
}
