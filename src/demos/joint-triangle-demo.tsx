"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function JointTriangleDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [a, setA] = useState(0.5);
  const val = format.number(2 * a - a * a, { maximumFractionDigits: 3 });
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <DemoRange
          label={t.markdown("boundary")}
          value={a}
          display={format.number(a)}
          min={0}
          max={1}
          step={0.05}
          onChange={setA}
        />
      }
      conclusion={<IcuMarkdownText value={t.markdown("result", { val })} />}
    >
      <svg viewBox="0 0 420 300" role="img" aria-label={t("diagram", { val })}>
        <polygon
          points="50,250 50,50 350,50"
          fill="currentColor"
          opacity=".1"
        />
        <polygon
          points={`50,250 50,50 ${50 + 300 * a},50 ${50 + 300 * a},${250 - 200 * a}`}
          fill="currentColor"
          opacity=".6"
        />
        <path d="M50 250 L50 50 L350 50 Z" fill="none" stroke="currentColor" />
        <SvgTex x={35} y={255} width={25} source="0" />
        <SvgTex x={340} y={255} width={25} source="1" />
        <SvgTex x={20} y={40} width={25} source="1" />
        <SvgTex x={370} y={240} width={25} source="x" />
        <SvgTex x={20} y={12} width={25} source="y" />
      </svg>
    </DemoFrame>
  );
}
