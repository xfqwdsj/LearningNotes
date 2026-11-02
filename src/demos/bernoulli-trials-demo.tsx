"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function BernoulliTrialsDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [p, setP] = useState(0.2);
  const [n, setN] = useState(3);
  const probability = 1 - (1 - p) ** n;
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
            label={t.markdown("success")}
            value={p}
            display={`${pct(p)}%`}
            min={0.05}
            max={0.95}
            step={0.05}
            onChange={setP}
          />
          <DemoRange
            label={t.markdown("trials")}
            value={n}
            display={String(n)}
            min={1}
            max={20}
            onChange={setN}
          />
        </>
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", { value: pct(probability) })}
        />
      }
    >
      <svg
        viewBox="0 0 460 120"
        role="img"
        aria-label={t("diagram", { value: pct(probability) })}
      >
        <rect
          x="50"
          y="30"
          width="360"
          height="35"
          fill="currentColor"
          opacity=".12"
        />
        <rect
          x="50"
          y="30"
          width={360 * probability}
          height="35"
          fill="currentColor"
          opacity=".7"
        />
        <SvgTex x={45} y={78} width={25} source="0" />
        <SvgTex x={400} y={78} width={25} source="1" />
      </svg>
    </DemoFrame>
  );
}
