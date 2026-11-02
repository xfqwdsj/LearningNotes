"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function SystemReliabilityDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [p, setP] = useState(0.8);
  const [n, setN] = useState(2);
  const series = p ** n,
    parallel = 1 - (1 - p) ** n;
  const pct = (x: number) =>
    format.number(x * 100, { maximumFractionDigits: 1 });
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label={t.markdown("component")}
            value={p}
            display={`${pct(p)}%`}
            min={0}
            max={1}
            step={0.05}
            onChange={setP}
          />
          <DemoRange
            label={t.markdown("count")}
            value={n}
            display={String(n)}
            min={1}
            max={8}
            onChange={setN}
          />
        </>
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", {
            series: pct(series),
            parallel: pct(parallel),
          })}
        />
      }
    >
      <svg
        viewBox="0 0 460 160"
        role="img"
        aria-label={t("diagram", {
          series: pct(series),
          parallel: pct(parallel),
        })}
      >
        <rect
          x="80"
          y="30"
          width="330"
          height="30"
          fill="currentColor"
          opacity=".1"
        />
        <rect
          x="80"
          y="30"
          width={330 * series}
          height="30"
          fill="currentColor"
          opacity=".55"
        />
        <rect
          x="80"
          y="90"
          width="330"
          height="30"
          fill="currentColor"
          opacity=".1"
        />
        <rect
          x="80"
          y="90"
          width={330 * parallel}
          height="30"
          fill="currentColor"
          opacity=".8"
        />
        <SvgTex x={10} y={30} width={60} source="p^n" />
        <SvgTex x={5} y={90} width={70} source="1-(1-p)^n" />
      </svg>
    </DemoFrame>
  );
}
