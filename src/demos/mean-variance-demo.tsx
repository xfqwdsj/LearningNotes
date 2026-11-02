"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function MeanVarianceDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [p, setP] = useState(0.5);
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
          min={0}
          max={1}
          step={0.05}
          onChange={setP}
        />
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", {
            mean: num(2 * p),
            variance: num(4 * p * (1 - p)),
          })}
        />
      }
    >
      <svg
        viewBox="0 0 460 200"
        role="img"
        aria-label={t("diagram", {
          mean: num(2 * p),
          variance: num(4 * p * (1 - p)),
        })}
      >
        <line
          x1="60"
          y1="150"
          x2="400"
          y2="150"
          stroke="currentColor"
          opacity=".3"
        />
        <rect
          x="105"
          y={150 - 100 * (1 - p)}
          width="70"
          height={100 * (1 - p)}
          fill="currentColor"
          opacity=".5"
        />
        <rect
          x="285"
          y={150 - 100 * p}
          width="70"
          height={100 * p}
          fill="currentColor"
          opacity=".8"
        />
        <SvgTex x={105} y={160} width={70} align="center" source="0" />
        <SvgTex x={285} y={160} width={70} align="center" source="2" />
      </svg>
    </DemoFrame>
  );
}
