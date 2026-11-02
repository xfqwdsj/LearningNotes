"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function DistributionFunctionDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [p, setP] = useState(0.4);
  const [x, setX] = useState(0);
  const f = x < 0 ? 0 : x < 2 ? p : 1;
  const number = (v: number) => format.number(v, { maximumFractionDigits: 2 });
  const y = (v: number) => 220 - 170 * v;
  const sx = (v: number) => 80 + 100 * (v + 1);
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label={t.markdown("probability")}
            value={p}
            display={number(p)}
            min={0.05}
            max={0.95}
            step={0.05}
            onChange={setP}
          />
          <DemoRange
            label={t.markdown("position")}
            value={x}
            display={number(x)}
            min={-1}
            max={2.5}
            step={0.25}
            onChange={setX}
          />
        </>
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", { x: number(x), value: number(f) })}
        />
      }
    >
      <svg
        viewBox="0 0 460 270"
        role="img"
        aria-label={t("diagram", { x: number(x), value: number(f) })}
      >
        <line
          x1="60"
          y1="220"
          x2="440"
          y2="220"
          stroke="currentColor"
          opacity=".35"
        />
        <line
          x1="80"
          y1="30"
          x2="80"
          y2="230"
          stroke="currentColor"
          opacity=".35"
        />
        <path
          d={`M 80 220 H 180 M 180 ${y(p)} H 380 M 380 50 H 440`}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        />
        <circle
          cx="180"
          cy="220"
          r="5"
          fill="var(--background)"
          stroke="currentColor"
        />
        <circle cx="180" cy={y(p)} r="5" fill="currentColor" />
        <circle
          cx="380"
          cy={y(p)}
          r="5"
          fill="var(--background)"
          stroke="currentColor"
        />
        <circle cx="380" cy="50" r="5" fill="currentColor" />
        <circle cx={sx(x)} cy={y(f)} r="8" fill="currentColor" opacity=".6" />
        <SvgTex x={168} y={230} width={24} source="0" />
        <SvgTex x={368} y={230} width={24} source="2" />
        <SvgTex x={48} y={42} width={22} source="1" />
      </svg>
    </DemoFrame>
  );
}
