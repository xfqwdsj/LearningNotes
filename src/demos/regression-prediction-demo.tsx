"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function RegressionPredictionDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [x0, setX0] = useState(0);
  const center = (x: number) => 1 + x;
  const meanWidth = (x: number) => 2.306 * 0.5 * Math.sqrt(0.1 + (x * x) / 10);
  const predWidth = (x: number) =>
    2.306 * 0.5 * Math.sqrt(1 + 0.1 + (x * x) / 10);
  const px = (x: number) => 230 + 55 * x,
    py = (y: number) => 115 - 16 * y;
  const samples = Array.from({ length: 61 }, (_, i) => -3 + i * 0.1);
  const path = (f: (x: number) => number) =>
    samples.map((x) => `${px(x)},${py(f(x))}`).join(" ");
  const m = meanWidth(x0),
    p = predWidth(x0),
    y = center(x0);
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <DemoRange
          label={t.markdown("position")}
          value={x0}
          display={x0.toFixed(1)}
          min={-3}
          max={3}
          step={0.1}
          onChange={setX0}
        />
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", {
            mean: m.toFixed(3),
            prediction: p.toFixed(3),
          })}
        />
      }
    >
      <svg
        viewBox="0 0 460 245"
        role="img"
        aria-label={t("graph", {
          x: x0.toFixed(1),
          mean: m.toFixed(3),
          prediction: p.toFixed(3),
        })}
      >
        <line
          x1="50"
          y1={py(0)}
          x2="410"
          y2={py(0)}
          stroke="currentColor"
          strokeOpacity=".25"
        />
        <line
          x1={px(0)}
          y1="15"
          x2={px(0)}
          y2="220"
          stroke="currentColor"
          strokeOpacity=".25"
        />
        {[1, -1].map((sign) => (
          <g key={sign}>
            <polyline
              points={path((x) => center(x) + sign * predWidth(x))}
              fill="none"
              stroke="currentColor"
              strokeOpacity=".45"
              strokeDasharray="5 4"
            />
            <polyline
              points={path((x) => center(x) + sign * meanWidth(x))}
              fill="none"
              stroke="currentColor"
              strokeOpacity=".65"
            />
          </g>
        ))}
        <polyline
          points={path(center)}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <line
          x1={px(x0)}
          y1={py(y - p)}
          x2={px(x0)}
          y2={py(y + p)}
          stroke="currentColor"
          strokeOpacity=".4"
        />
        <line
          x1={px(x0)}
          y1={py(y - m)}
          x2={px(x0)}
          y2={py(y + m)}
          stroke="currentColor"
          strokeWidth="4"
        />
        <circle cx={px(x0)} cy={py(y)} r="4" fill="currentColor" />
        <SvgTex x={410} y={py(0) + 4} width={25} source="x" />
        <SvgTex x={px(0) + 5} y={15} width={25} source="y" />
      </svg>
      <div className="grid gap-2 px-6 pb-4 text-sm">
        <Tex
          source={String.raw`\hat y_0=${y.toFixed(2)},\quad d_{\mathrm{mean}}=${m.toFixed(3)},\quad d_{\mathrm{pred}}=${p.toFixed(3)}`}
        />
      </div>
    </DemoFrame>
  );
}
