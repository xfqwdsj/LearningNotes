"use client";

import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

export default function AbsoluteConvergenceDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [n, setN] = useState(30);
  let signed = 0;
  let absolute = 0;
  const signedValues: number[] = [];
  const absoluteValues: number[] = [];
  for (let index = 0; index < n; index += 1) {
    const term = 1 / (index + 1);
    signed += index % 2 === 0 ? term : -term;
    absolute += term;
    signedValues.push(signed);
    absoluteValues.push(absolute);
  }
  const sx = (index: number) =>
    roundSvgNumber(72 + (388 * index) / Math.max(1, n - 1));
  const sy = (value: number) => roundSvgNumber(232 - (value / 6) * 184);
  const path = (values: number[]) =>
    values
      .map(
        (value, index) => `${index === 0 ? "M" : "L"}${sx(index)} ${sy(value)}`,
      )
      .join(" ");
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
          label={t.markdown("terms")}
          value={n}
          display={`$${n}$`}
          min={1}
          max={100}
          onChange={setN}
        />
      }
      conclusion={<IcuMarkdownText value={t.markdown("result")} />}
    >
      <svg viewBox="0 0 500 280" role="img" aria-label={t("label")}>
        <path
          d="M72 48V232H462"
          fill="none"
          stroke="currentColor"
          strokeOpacity=".25"
        />
        {[0, 2, 4, 6].map((tick) => (
          <g key={tick}>
            <line
              x1="72"
              y1={sy(tick)}
              x2="460"
              y2={sy(tick)}
              stroke="currentColor"
              strokeOpacity=".08"
            />
            <SvgTex x={42} y={sy(tick) - 10} width={25} source={String(tick)} />
          </g>
        ))}
        <path
          d={path(absoluteValues)}
          fill="none"
          stroke="currentColor"
          strokeOpacity=".7"
          strokeWidth="2.5"
          strokeDasharray="7 4"
        />
        <path
          d={path(signedValues)}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.75"
        />
        <circle
          cx={sx(n - 1)}
          cy={sy(absolute)}
          r="5"
          fill="var(--background)"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx={sx(n - 1)} cy={sy(signed)} r="5" fill="currentColor" />
        <SvgTex x={370} y={22} width={48} source={String.raw`A_n`} />
        <SvgTex x={326} y={48} width={48} source={String.raw`S_n`} />
        <SvgTex x={72} y={238} width={25} source="1" />
        <SvgTex x={sx(n - 1) - 12} y={238} width={42} source={String(n)} />
        <SvgTex x={464} y={216} width={26} source="n" />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <div>
          <Tex
            source={String.raw`S_n=${number(signed)},\qquad A_n=\sum_{k=1}^n\frac1k=${number(absolute)}`}
            display
          />
        </div>
      </div>
    </DemoFrame>
  );
}
