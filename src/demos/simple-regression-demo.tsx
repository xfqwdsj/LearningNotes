"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function SimpleRegressionDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [last, setLast] = useState(5);
  const data = [
    { x: 1, y: 2 },
    { x: 2, y: 3 },
    { x: 3, y: last },
  ];
  const slope = (last - 2) / 2,
    intercept = (5 + last) / 3 - 2 * slope;
  const px = (x: number) => 70 + 95 * x,
    py = (y: number) => 250 - 27 * y;
  const sse = data.reduce(
    (sum, p) => sum + (p.y - intercept - slope * p.x) ** 2,
    0,
  );
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <DemoRange
          label={t.markdown("last")}
          value={last}
          display={last.toFixed(1)}
          min={3}
          max={7}
          step={0.1}
          onChange={setLast}
        />
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", { sse: sse.toFixed(3) })}
        />
      }
    >
      <svg
        viewBox="0 0 460 290"
        role="img"
        aria-label={t("graph", {
          slope: slope.toFixed(2),
          intercept: intercept.toFixed(2),
        })}
      >
        <line
          x1="70"
          y1="250"
          x2="395"
          y2="250"
          stroke="currentColor"
          strokeOpacity=".35"
        />
        <line
          x1="70"
          y1="250"
          x2="70"
          y2="25"
          stroke="currentColor"
          strokeOpacity=".35"
        />
        <line
          x1={px(0.5)}
          y1={py(intercept + slope * 0.5)}
          x2={px(3.3)}
          y2={py(intercept + slope * 3.3)}
          stroke="currentColor"
          strokeWidth="2"
        />
        {data.map((p) => (
          <g key={p.x}>
            <line
              x1={px(p.x)}
              y1={py(p.y)}
              x2={px(p.x)}
              y2={py(intercept + slope * p.x)}
              stroke="currentColor"
              strokeDasharray="3 3"
            />
            <circle cx={px(p.x)} cy={py(p.y)} r="5" fill="currentColor" />
          </g>
        ))}
        <SvgTex x={400} y={253} width={25} source="x" />
        <SvgTex x={48} y={16} width={25} source="y" />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <Tex
          source={String.raw`\hat y=${intercept.toFixed(2)}+(${slope.toFixed(2)})x`}
        />
        <Tex source={String.raw`SSE=${sse.toFixed(3)}`} />
      </div>
    </DemoFrame>
  );
}
