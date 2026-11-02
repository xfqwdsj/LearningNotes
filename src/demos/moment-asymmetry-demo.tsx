"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function MomentAsymmetryDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [p, setP] = useState(0.4);
  const mean = 3 * p - 1,
    m2 = 1 + 3 * p,
    m3 = -1 + 9 * p,
    center3 = (1 - p) * (-1 - mean) ** 3 + p * (2 - mean) ** 3;
  const num = (v: number) => format.number(v, { maximumFractionDigits: 3 });
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <DemoRange
          label={t.markdown("probability")}
          value={p}
          display={num(p)}
          min={0.05}
          max={0.95}
          step={0.05}
          onChange={setP}
        />
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", {
            mean: num(mean),
            second: num(m2),
            third: num(m3),
            central: num(center3),
          })}
        />
      }
    >
      <svg
        viewBox="0 0 460 190"
        role="img"
        aria-label={t("diagram", { mean: num(mean) })}
      >
        <line
          x1="50"
          y1="145"
          x2="410"
          y2="145"
          stroke="currentColor"
          opacity=".3"
        />
        <rect
          x="110"
          y={145 - 100 * (1 - p)}
          width="70"
          height={100 * (1 - p)}
          fill="currentColor"
          opacity=".4"
        />
        <rect
          x="280"
          y={145 - 100 * p}
          width="70"
          height={100 * p}
          fill="currentColor"
          opacity=".7"
        />
        <SvgTex x={110} y={150} width={70} align="center" source="-1" />
        <SvgTex x={280} y={150} width={70} align="center" source="2" />
      </svg>
    </DemoFrame>
  );
}
