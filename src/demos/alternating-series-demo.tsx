"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function AlternatingSeriesDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [n, setN] = useState(5);
  const sum = Array.from(
    { length: n },
    (_, i) => (i % 2 === 0 ? 1 : -1) / (i + 1),
  ).reduce((a, b) => a + b, 0);
  const points = Array.from({ length: n }, (_, i) =>
    Array.from(
      { length: i + 1 },
      (_, j) => (j % 2 === 0 ? 1 : -1) / (j + 1),
    ).reduce((a, b) => a + b, 0),
  );
  const graphX = (index: number) => 42 + (index * 370) / Math.max(1, n - 1);
  const graphY = (value: number) => 190 - ((value - 0.45) / 0.6) * 165;
  const line = points
    .map((value, index) => `${graphX(index)},${graphY(value)}`)
    .join(" ");
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <DemoRange
          label={t.markdown("terms")}
          value={n}
          display={String(n)}
          min={1}
          max={100}
          onChange={setN}
        />
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", { bound: (1 / (n + 1)).toFixed(4) })}
        />
      }
    >
      <p className="px-6 pt-4 text-sm">
        <IcuMarkdownText value={t.raw("graphNote") as string} />
      </p>
      <svg
        viewBox="0 0 460 230"
        role="img"
        aria-label={t("graphLabel", { n, sum: sum.toFixed(4) })}
      >
        <line
          x1="42"
          y1="190"
          x2="415"
          y2="190"
          stroke="currentColor"
          opacity=".3"
        />
        <line
          x1="42"
          y1="25"
          x2="42"
          y2="190"
          stroke="currentColor"
          opacity=".3"
        />
        <line
          x1="42"
          y1={graphY(Math.LN2)}
          x2="415"
          y2={graphY(Math.LN2)}
          stroke="currentColor"
          opacity=".5"
          strokeDasharray="5 4"
        />
        <SvgTex
          x={5}
          y={graphY(Math.LN2) - 11}
          width={38}
          source={String.raw`\ln 2`}
        />
        <polyline
          points={line}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          opacity=".45"
        />
        {points.map((value, index) => (
          <circle
            key={index}
            cx={graphX(index)}
            cy={graphY(value)}
            r={index === n - 1 ? 4 : 2.5}
            fill="currentColor"
          />
        ))}
        <SvgTex x={40} y={198} width={30} source="1" />
        <SvgTex x={390} y={198} width={55} source={String.raw`n=${n}`} />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <p>
          <Tex source={String.raw`S_n = ${sum.toFixed(4)}`} />
        </p>
        <p>
          <Tex source={String.raw`\ln 2 \approx ${Math.LN2.toFixed(4)}`} />
        </p>
      </div>
    </DemoFrame>
  );
}
