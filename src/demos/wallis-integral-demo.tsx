"use client";

import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

export default function WallisIntegralDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [n, setN] = useState(4);
  const values = [Math.PI / 2, 1];
  for (let index = 2; index <= 12; index += 1) {
    values[index] = ((index - 1) / index) * (values[index - 2] ?? 0);
  }
  const limit = Math.sqrt(Math.PI / 2);
  const sx = (index: number) => roundSvgNumber(72 + (index / 12) * 370);
  const sy = (value: number) => roundSvgNumber(224 - (value / 1.7) * 178);
  const series = (parity: number) =>
    values
      .map((value, index) =>
        index % 2 === parity
          ? `${index === parity ? "M" : "L"}${sx(index)} ${sy(value)}`
          : "",
      )
      .join("");
  const number = (value: number) =>
    format.number(value, {
      minimumFractionDigits: 4,
      maximumFractionDigits: 5,
    });

  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <DemoRange
          label={t.markdown("n")}
          value={n}
          display={`$${n}$`}
          min={0}
          max={12}
          onChange={setN}
        />
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", { value: number(values[n] ?? 0) })}
        />
      }
    >
      <svg viewBox="0 0 500 270" role="img" aria-label={t("label")}>
        <path
          d="M72 40V224H452"
          fill="none"
          stroke="currentColor"
          strokeOpacity=".25"
        />
        <line
          x1={72}
          y1={sy(limit)}
          x2={450}
          y2={sy(limit)}
          stroke="currentColor"
          strokeOpacity=".35"
          strokeDasharray="5 4"
        />
        <path
          d={series(0)}
          fill="none"
          stroke="currentColor"
          strokeOpacity=".65"
          strokeWidth="2"
          strokeDasharray="6 4"
        />
        <path
          d={series(1)}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        {values.map((value, index) => (
          <circle
            key={index}
            cx={sx(index)}
            cy={sy(value)}
            r={index === n ? 6 : 3}
            fill={index === n ? "var(--background)" : "currentColor"}
            stroke="currentColor"
            strokeWidth={index === n ? 2 : 0}
          />
        ))}
        {[0, 4, 8, 12].map((tick) => (
          <SvgTex
            key={tick}
            x={sx(tick) - 8}
            y={230}
            width={28}
            source={String(tick)}
          />
        ))}
        <SvgTex x={438} y={208} width={28} source="n" />
        <SvgTex x={20} y={22} width={88} source="I_n" />
        <SvgTex x={338} y={sy(limit) - 22} width={110} source="\sqrt{\pi/2}" />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <p>
          <Tex
            source={String.raw`I_n=\frac{n-1}{n}I_{n-2},\qquad I_n\to\sqrt{\pi/2}`}
          />
        </p>
      </div>
    </DemoFrame>
  );
}
