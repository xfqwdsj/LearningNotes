"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function DensityAreaDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [a, setA] = useState(0.6);
  const num = (v: number) => format.number(v, { maximumFractionDigits: 2 });
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <DemoRange
          label={t.markdown("boundary")}
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
          value={t.markdown("result", {
            height: num(2 * a),
            probability: num(a * a),
          })}
        />
      }
    >
      <svg
        viewBox="0 0 460 250"
        role="img"
        aria-label={t("diagram", { probability: num(a * a) })}
      >
        <path
          d={`M50 205 L${50 + 340 * a} ${205 - 170 * a} L${50 + 340 * a} 205 Z`}
          fill="currentColor"
          opacity=".25"
        />
        <path
          d="M50 205 L390 35"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          d="M50 20 V205 H410"
          fill="none"
          stroke="currentColor"
          opacity=".3"
        />
        <circle
          cx={50 + 340 * a}
          cy={205 - 170 * a}
          r="6"
          fill="currentColor"
        />
        <SvgTex x={40} y={210} width={25} source="0" />
        <SvgTex x={380} y={210} width={25} source="1" />
        <SvgTex x={15} y={25} width={25} source="2" />
      </svg>
    </DemoFrame>
  );
}
