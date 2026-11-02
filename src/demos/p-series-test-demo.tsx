"use client";

import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

export default function PSeriesTestDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [p, setP] = useState(1.5);
  const [n, setN] = useState(50);
  let current = 0;
  let harmonic = 0;
  const values: number[] = [];
  const harmonicValues: number[] = [];
  for (let index = 0; index < 100; index += 1) {
    current += 1 / (index + 1) ** p;
    harmonic += 1 / (index + 1);
    values.push(current);
    harmonicValues.push(harmonic);
  }
  const ceiling = Math.max(
    5,
    ...values.slice(0, n),
    harmonicValues[n - 1] ?? 0,
  );
  const sx = (index: number) => roundSvgNumber(70 + (388 * index) / 99);
  const sy = (value: number) => roundSvgNumber(230 - (value / ceiling) * 180);
  const path = (numbers: number[]) =>
    numbers
      .map(
        (value, index) => `${index === 0 ? "M" : "L"}${sx(index)} ${sy(value)}`,
      )
      .join(" ");
  const number = (value: number) =>
    format.number(value, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 3,
    });

  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label={t.markdown("power")}
            value={p}
            display={`$${number(p)}$`}
            min={0.5}
            max={2}
            step={0.1}
            onChange={setP}
          />
          <DemoRange
            label={t.markdown("terms")}
            value={n}
            display={`$${n}$`}
            min={1}
            max={100}
            onChange={setN}
          />
        </>
      }
      conclusion={
        <IcuMarkdownText value={t.markdown(p > 1 ? "converges" : "diverges")} />
      }
    >
      <svg viewBox="0 0 500 275" role="img" aria-label={t("label")}>
        <path
          d="M70 40V230H470"
          fill="none"
          stroke="currentColor"
          strokeOpacity=".25"
        />
        {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
          const value = ceiling * fraction;
          return (
            <g key={fraction}>
              <line
                x1="70"
                y1={sy(value)}
                x2="468"
                y2={sy(value)}
                stroke="currentColor"
                strokeOpacity=".08"
              />
              <SvgTex
                x={31}
                y={sy(value) - 10}
                width={34}
                source={number(value)}
              />
            </g>
          );
        })}
        {p !== 1 && (
          <path
            d={path(harmonicValues)}
            fill="none"
            stroke="currentColor"
            strokeOpacity=".4"
            strokeWidth="2"
            strokeDasharray="6 4"
          />
        )}
        <path
          d={path(values.slice(0, n))}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.75"
        />
        <circle
          cx={sx(n - 1)}
          cy={sy(values[n - 1] ?? 0)}
          r="5"
          fill="currentColor"
        />
        {[1, 25, 50, 75, 100].map((tick) => (
          <SvgTex
            key={tick}
            x={sx(tick - 1) - 10}
            y={236}
            width={42}
            source={String(tick)}
          />
        ))}
        <SvgTex x={12} y={28} width={92} source="S_n(p)" />
        <SvgTex x={12} y={50} width={92} source="S_n(1)" />
        <SvgTex x={470} y={216} width={28} source="n" />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <div>
          <Tex
            source={String.raw`S_n(p)=\sum_{k=1}^n\frac1{k^p}=${number(values[n - 1] ?? 0)}`}
            display
          />
        </div>
      </div>
    </DemoFrame>
  );
}
