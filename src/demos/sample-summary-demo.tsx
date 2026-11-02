"use client";

import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

export default function SampleSummaryDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [x, setX] = useState(4);
  const sample = [2, x, 6];
  const mean = (x + 8) / 3;
  const squared = sample.reduce(
    (total, value) => total + (value - mean) ** 2,
    0,
  );
  const sx = (value: number) => roundSvgNumber(70 + value * 36);
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
          label={t.markdown("sample")}
          value={x}
          display={`$${x}$`}
          min={0}
          max={10}
          onChange={setX}
        />
      }
      conclusion={<IcuMarkdownText value={t.markdown("result")} />}
    >
      <svg viewBox="0 0 500 280" role="img" aria-label={t("label")}>
        <line
          x1="70"
          y1="155"
          x2="430"
          y2="155"
          stroke="currentColor"
          strokeOpacity=".25"
        />
        <line
          x1={sx(mean)}
          y1="50"
          x2={sx(mean)}
          y2="225"
          stroke="currentColor"
          strokeDasharray="5 4"
        />
        {sample.map((value, index) => (
          <g key={index}>
            <line
              x1={sx(mean)}
              y1={120 + index * 24}
              x2={sx(value)}
              y2={120 + index * 24}
              stroke="currentColor"
              strokeOpacity=".35"
            />
            <circle cx={sx(value)} cy={155} r="6" fill="currentColor" />
            <SvgTex
              x={sx(value) - 8}
              y={166}
              width={30}
              source={String.raw`x_${index + 1}`}
            />
          </g>
        ))}
        <SvgTex
          x={sx(mean) - 18}
          y={28}
          width={62}
          source={String.raw`\bar x=${number(mean)}`}
        />
        <SvgTex x={18} y={38} width={60} source="\text{deviations}" />
        {[0, 2, 4, 6, 8, 10].map((tick) => (
          <SvgTex
            key={tick}
            x={sx(tick) - 9}
            y={218}
            width={30}
            source={String(tick)}
          />
        ))}
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <p>
          <Tex
            source={String.raw`\bar x=${number(mean)},\quad s^2=${number(squared / 2)},\quad B_2=${number(squared / 3)}`}
          />
        </p>
      </div>
    </DemoFrame>
  );
}
