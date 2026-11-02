"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function AnovaGroupsDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [difference, setDifference] = useState(1);
  const centers = [-difference, 0, difference];
  const x = (v: number) => 230 + v * 40;
  const f = 3 * difference * difference;
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <DemoRange
          label={t.markdown("separation")}
          value={difference}
          display={difference.toFixed(1)}
          min={0}
          max={3}
          step={0.1}
          onChange={setDifference}
        />
      }
      conclusion={
        <IcuMarkdownText value={t.markdown("result", { f: f.toFixed(2) })} />
      }
    >
      <svg
        viewBox="0 0 460 210"
        role="img"
        aria-label={t("graph", {
          difference: difference.toFixed(1),
          f: f.toFixed(2),
        })}
      >
        <line
          x1="35"
          y1="165"
          x2="425"
          y2="165"
          stroke="currentColor"
          strokeOpacity=".3"
        />
        <line
          x1={x(0)}
          y1="20"
          x2={x(0)}
          y2="165"
          stroke="currentColor"
          strokeOpacity=".35"
          strokeDasharray="4 4"
        />
        {centers.map((mean, i) => (
          <g key={i}>
            {[-1, 0, 1].map((v, j) => (
              <circle
                key={j}
                cx={x(mean + v)}
                cy={42 + i * 45}
                r="5"
                fill="currentColor"
                fillOpacity=".45"
              />
            ))}
            <line
              x1={x(mean)}
              y1={30 + i * 45}
              x2={x(mean)}
              y2={54 + i * 45}
              stroke="currentColor"
              strokeWidth="3"
            />
            <SvgTex
              x={20}
              y={30 + i * 45}
              width={40}
              source={String.raw`\text{${String.fromCharCode(65 + i)}}`}
            />
          </g>
        ))}
        <SvgTex x={x(0) - 8} y={170} width={28} source="0" />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <Tex
          source={String.raw`S_A=${(6 * difference * difference).toFixed(2)},\quad S_E=6`}
        />
        <Tex source={String.raw`F=\frac{S_A/2}{S_E/6}=${f.toFixed(2)}`} />
      </div>
    </DemoFrame>
  );
}
