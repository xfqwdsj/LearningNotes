"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
const means = [-2.3, -1.8, -1.1, -0.6, -0.2, 0.1, 0.5, 1, 1.5, 2.1];
export default function ConfidenceIntervalDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [index, setIndex] = useState(1);
  const mean = means[index - 1] ?? 0;
  const lo = mean - 1.96,
    hi = mean + 1.96;
  const x = (v: number) => 230 + v * 42;
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <DemoRange
          label={t.markdown("sample")}
          value={index}
          display={String(index)}
          min={1}
          max={10}
          onChange={setIndex}
        />
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown(lo <= 0 && hi >= 0 ? "covers" : "misses")}
        />
      }
    >
      <svg
        viewBox="0 0 460 285"
        role="img"
        aria-label={t("graph", {
          index,
          lower: lo.toFixed(2),
          upper: hi.toFixed(2),
        })}
      >
        <line
          x1={x(0)}
          y1="25"
          x2={x(0)}
          y2="250"
          stroke="currentColor"
          strokeOpacity=".5"
          strokeDasharray="4 4"
        />
        {means.map((v, i) => {
          const selected = i === index - 1;
          const cover = Math.abs(v) <= 1.96;
          return (
            <g key={i}>
              <line
                x1={x(v - 1.96)}
                y1={40 + i * 21}
                x2={x(v + 1.96)}
                y2={40 + i * 21}
                stroke="currentColor"
                strokeDasharray={cover ? undefined : "4 3"}
                strokeWidth={selected ? 5 : 2}
                opacity={selected ? 1 : 0.55}
              />
              <circle
                cx={x(v)}
                cy={40 + i * 21}
                r={selected ? 4 : 2.5}
                fill="currentColor"
              />
            </g>
          );
        })}
        <SvgTex x={218} y={253} width={40} source={String.raw`\mu=0`} />
      </svg>
      <div className="px-6 py-4 text-sm">
        <Tex
          source={String.raw`[\bar x-1.96,\bar x+1.96]=[${lo.toFixed(2)},${hi.toFixed(2)}]`}
        />
      </div>
    </DemoFrame>
  );
}
