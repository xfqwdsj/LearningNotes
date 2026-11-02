"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function ChiSquareDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [n, setN] = useState(3);
  const sample = [1, -0.5, 2, 0.25, -1, 1.5];
  const sum = sample.slice(0, n).reduce((v, x) => v + x * x, 0);
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <DemoRange
          label={t.markdown("n")}
          value={n}
          display={String(n)}
          min={1}
          max={6}
          onChange={setN}
        />
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", { mean: n, variance: 2 * n })}
        />
      }
    >
      <svg
        viewBox="0 0 460 220"
        role="img"
        aria-label={t("graphLabel", { n, sum: sum.toFixed(3) })}
      >
        <line
          x1="55"
          y1="175"
          x2="425"
          y2="175"
          stroke="currentColor"
          strokeOpacity=".4"
        />
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const value = sample[i] ?? 0;
          return (
            <g key={i}>
              <rect
                x={67 + i * 58}
                y={175 - value * value * 32}
                width="32"
                height={value * value * 32}
                fill="currentColor"
                fillOpacity={i < n ? 0.75 : 0.12}
              />
              <SvgTex
                x={67 + i * 58}
                y={180}
                width={32}
                align="center"
                source={String.raw`z_${i + 1}`}
              />
            </g>
          );
        })}
        <SvgTex x={18} y={38} width={34} source="4" />
        <SvgTex x={20} y={165} width={28} source="0" />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <p>
          <Tex source={String.raw`z=(${sample.slice(0, n).join(", ")})`} />
        </p>
        <p>
          <Tex source={String.raw`\sum z_i^2=${sum.toFixed(3)}`} />
        </p>
      </div>
    </DemoFrame>
  );
}
