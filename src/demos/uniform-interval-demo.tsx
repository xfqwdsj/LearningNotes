"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";

export default function UniformIntervalDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [threshold, setThreshold] = useState(0.4);
  const value = format.number(threshold, { maximumFractionDigits: 2 });
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <DemoRange
          label={t.markdown("threshold")}
          value={threshold}
          display={value}
          min={0}
          max={1}
          step={0.05}
          onChange={setThreshold}
        />
      }
      conclusion={<IcuMarkdownText value={t.markdown("result", { value })} />}
    >
      <svg
        viewBox="0 0 460 120"
        role="img"
        aria-label={t("diagram", { value })}
      >
        <line
          x1="40"
          y1="55"
          x2="420"
          y2="55"
          stroke="currentColor"
          strokeWidth="6"
          opacity=".2"
        />
        <line
          x1="40"
          y1="55"
          x2={40 + 380 * threshold}
          y2="55"
          stroke="currentColor"
          strokeWidth="6"
        />
        <circle cx={40 + 380 * threshold} cy="55" r="6" fill="currentColor" />
        <SvgTex x={31} y={72} width={25} source="0" />
        <SvgTex x={410} y={72} width={25} source="1" />
      </svg>
    </DemoFrame>
  );
}
