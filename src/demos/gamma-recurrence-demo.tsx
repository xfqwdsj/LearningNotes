"use client";

import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

export default function GammaRecurrenceDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [n, setN] = useState(3);
  const values = Array.from({ length: 9 }, (_, index) => {
    let factorial = 1;
    for (let factor = 2; factor <= index; factor += 1) factorial *= factor;
    return factorial;
  });
  const sx = (index: number) => roundSvgNumber(72 + (index / 8) * 370);
  const sy = (value: number) =>
    roundSvgNumber(228 - (Math.log10(value) / Math.log10(40320)) * 180);
  const path = values
    .map(
      (value, index) => `${index === 0 ? "M" : "L"}${sx(index)} ${sy(value)}`,
    )
    .join("");
  const factorial = values[n] ?? 1;
  const number = (value: number) => format.number(value);

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
          max={8}
          onChange={setN}
        />
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", { n, value: number(factorial) })}
        />
      }
    >
      <svg viewBox="0 0 500 270" role="img" aria-label={t("label")}>
        <path
          d="M72 43V228H452"
          fill="none"
          stroke="currentColor"
          strokeOpacity=".25"
        />
        {[1, 10, 100, 1000, 10000].map((tick) => (
          <g key={tick}>
            <line
              x1="72"
              y1={sy(tick)}
              x2="450"
              y2={sy(tick)}
              stroke="currentColor"
              strokeOpacity=".08"
            />
            <SvgTex
              x={22}
              y={sy(tick) - 10}
              width={46}
              source={tick === 1 ? "1" : `10^{${Math.log10(tick)}}`}
            />
          </g>
        ))}
        <path d={path} fill="none" stroke="currentColor" strokeWidth="2.75" />
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
        {[0, 2, 4, 6, 8].map((tick) => (
          <SvgTex
            key={tick}
            x={sx(tick) - 8}
            y={234}
            width={28}
            source={String(tick)}
          />
        ))}
        <SvgTex x={440} y={212} width={28} source="n" />
        <SvgTex x={18} y={20} width={110} source="\log\Gamma(n+1)" />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <p>
          <Tex
            source={String.raw`\Gamma(${n + 1})=${n}!=${number(factorial)}`}
          />
        </p>
      </div>
    </DemoFrame>
  );
}
