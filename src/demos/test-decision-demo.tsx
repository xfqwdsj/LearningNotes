"use client";

import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

const normal = (value: number) =>
  Math.exp(-(value * value) / 2) / Math.sqrt(2 * Math.PI);

export default function TestDecisionDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [mean, setMean] = useState(100);
  const z = (mean - 100) / 2;
  const rejected = Math.abs(z) > 1.96;
  const sx = (value: number) => roundSvgNumber(250 + value * 47);
  const sy = (value: number) => roundSvgNumber(222 - value * 330);
  const curve = Array.from({ length: 161 }, (_, index) => {
    const value = -4 + index / 20;
    return `${index === 0 ? "M" : "L"}${sx(value)} ${sy(normal(value))}`;
  }).join("");
  const tail = (start: number, end: number) =>
    `${Array.from({ length: 31 }, (_, index) => {
      const value = start + ((end - start) * index) / 30;
      return `${index === 0 ? "M" : "L"}${sx(value)} ${sy(normal(value))}`;
    }).join("")}L${sx(end)} ${sy(0)}L${sx(start)} ${sy(0)}Z`;
  const number = (value: number) =>
    format.number(value, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <DemoRange
          label={t.markdown("mean")}
          value={mean}
          display={`$${mean}$`}
          min={94}
          max={106}
          onChange={setMean}
        />
      }
      conclusion={
        <IcuMarkdownText value={t.markdown(rejected ? "reject" : "keep")} />
      }
    >
      <svg viewBox="0 0 500 270" role="img" aria-label={t("label")}>
        <path d={`${tail(-4, -1.96)}`} fill="currentColor" fillOpacity=".2" />
        <path d={`${tail(1.96, 4)}`} fill="currentColor" fillOpacity=".2" />
        <path d={curve} fill="none" stroke="currentColor" strokeWidth="2.5" />
        <line
          x1="62"
          y1={sy(0)}
          x2="438"
          y2={sy(0)}
          stroke="currentColor"
          strokeOpacity=".25"
        />
        <line
          x1={sx(-1.96)}
          y1="42"
          x2={sx(-1.96)}
          y2={sy(0)}
          stroke="currentColor"
          strokeDasharray="4 4"
        />
        <line
          x1={sx(1.96)}
          y1="42"
          x2={sx(1.96)}
          y2={sy(0)}
          stroke="currentColor"
          strokeDasharray="4 4"
        />
        <line
          x1={sx(z)}
          y1="34"
          x2={sx(z)}
          y2={sy(0)}
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <circle cx={sx(z)} cy="34" r="5" fill="currentColor" />
        <SvgTex x={sx(z) - 9} y={12} width={42} source="z" />
        <SvgTex x={sx(-1.96) - 12} y={230} width={42} source="-1.96" />
        <SvgTex x={sx(1.96) - 8} y={230} width={36} source="1.96" />
        <SvgTex x={28} y={34} width={90} source={String.raw`z=${number(z)}`} />
      </svg>
    </DemoFrame>
  );
}
