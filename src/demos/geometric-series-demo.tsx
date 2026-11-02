"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function GeometricSeriesDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [r, setR] = useState(0.5);
  const [n, setN] = useState(5);
  const sum = r === 1 ? n : (1 - r ** n) / (1 - r);
  const limit = Math.abs(r) < 1 ? 1 / (1 - r) : null;
  const points = Array.from({ length: n }, (_, i) =>
    Array.from({ length: i + 1 }, (_, j) => r ** j).reduce((a, b) => a + b, 0),
  );
  const values = [...points, 0, ...(limit === null ? [] : [limit])];
  const low = Math.min(...values),
    high = Math.max(...values);
  const padding = Math.max((high - low) * 0.12, 0.5);
  const x = (i: number) => 48 + (i * 360) / Math.max(n - 1, 1);
  const y = (v: number) =>
    185 - ((v - low + padding) / (high - low + 2 * padding)) * 160;
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label={t.markdown("ratio")}
            value={r}
            display={r.toFixed(1)}
            min={-1.1}
            max={1.1}
            step={0.1}
            onChange={setR}
          />
          <DemoRange
            label={t.markdown("terms")}
            value={n}
            display={String(n)}
            min={1}
            max={20}
            onChange={setN}
          />
        </>
      }
      conclusion={
        <IcuMarkdownText
          value={
            limit === null
              ? t.markdown("diverges")
              : t.markdown("converges", { limit: limit.toFixed(3) })
          }
        />
      }
    >
      <p className="px-6 pt-4 text-sm">
        <IcuMarkdownText value={t.raw("graphNote") as string} />
      </p>
      <svg
        viewBox="0 0 460 225"
        role="img"
        aria-label={t("graphLabel", { n, sum: sum.toFixed(3) })}
      >
        <line
          x1="48"
          y1="185"
          x2="410"
          y2="185"
          stroke="currentColor"
          opacity=".3"
        />
        {limit !== null && (
          <line
            x1="48"
            y1={y(limit)}
            x2="410"
            y2={y(limit)}
            stroke="currentColor"
            strokeDasharray="5 4"
            opacity=".55"
          />
        )}
        <line
          x1="48"
          y1={y(0)}
          x2="410"
          y2={y(0)}
          stroke="currentColor"
          opacity=".2"
        />
        <polyline
          points={points.map((v, i) => `${x(i)},${y(v)}`).join(" ")}
          fill="none"
          stroke="currentColor"
          opacity=".5"
          strokeWidth="1.5"
        />
        {points.map((v, i) => (
          <circle
            key={i}
            cx={x(i)}
            cy={y(v)}
            r={i === n - 1 ? 4 : 2.5}
            fill="currentColor"
          />
        ))}
        <SvgTex x={15} y={y(0) - 10} width={24} source="0" />
        {limit !== null && (
          <SvgTex x={12} y={y(limit) - 10} width={35} source="S" />
        )}
        <SvgTex x={390} y={193} width={60} source={String.raw`n=${n}`} />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <p>
          <Tex source={String.raw`S_n=1+r+\cdots+r^{n-1}=${sum.toFixed(3)}`} />
        </p>
        <p>
          <Tex source={String.raw`r^n=${(r ** n).toFixed(3)}`} />
        </p>
      </div>
    </DemoFrame>
  );
}
