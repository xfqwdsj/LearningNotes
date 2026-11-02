"use client";

import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

export default function PartialFractionsDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [x, setX] = useState(1);
  const sx = (value: number) => roundSvgNumber(64 + (value / 3) * 380);
  const sy = (value: number) =>
    roundSvgNumber(230 - (Math.max(-3, Math.min(3, value)) / 3) * 184);
  const curve = (fn: (value: number) => number) =>
    Array.from({ length: 121 }, (_, index) => {
      const value = 0.12 + (2.88 * index) / 120;
      return `${index === 0 ? "M" : "L"}${sx(value)} ${sy(fn(value))}`;
    }).join("");
  const total = 1 / (x * (x + 1));
  const number = (value: number) =>
    format.number(value, {
      minimumFractionDigits: 3,
      maximumFractionDigits: 4,
    });

  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <DemoRange
          label={t.markdown("x")}
          value={x}
          display={`$${number(x)}$`}
          min={0.2}
          max={3}
          step={0.1}
          onChange={setX}
        />
      }
      conclusion={<IcuMarkdownText value={t.markdown("result")} />}
    >
      <svg viewBox="0 0 500 285" role="img" aria-label={t("label")}>
        <path
          d="M64 230H444M64 230V38"
          fill="none"
          stroke="currentColor"
          strokeOpacity=".25"
        />
        <path
          d={curve((value) => 1 / value)}
          fill="none"
          stroke="currentColor"
          strokeOpacity=".55"
          strokeWidth="2"
          strokeDasharray="7 4"
        />
        <path
          d={curve((value) => -1 / (value + 1))}
          fill="none"
          stroke="currentColor"
          strokeOpacity=".35"
          strokeWidth="2"
          strokeDasharray="4 4"
        />
        <path
          d={curve((value) => 1 / (value * (value + 1)))}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.75"
        />
        <line
          x1={sx(x)}
          y1="40"
          x2={sx(x)}
          y2="230"
          stroke="currentColor"
          strokeOpacity=".25"
        />
        <circle cx={sx(x)} cy={sy(total)} r="5" fill="currentColor" />
        <SvgTex x={12} y={24} width={90} source="\frac1x" />
        <SvgTex x={12} y={50} width={110} source="-\frac1{x+1}" />
        <SvgTex x={12} y={76} width={142} source="\frac1{x(x+1)}" />
        <SvgTex x={442} y={214} width={28} source="x" />
        <SvgTex x={28} y={34} width={28} source="y" />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <div>
          <Tex
            source={String.raw`\frac1{x(x+1)}=\frac1x-\frac1{x+1}=${number(total)}`}
            display
          />
        </div>
      </div>
    </DemoFrame>
  );
}
