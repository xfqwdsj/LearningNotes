"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function DoubleSumDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [n, setN] = useState(3);
  const sum = Array.from({ length: n * n }, (_, i) => {
    const x = ((i % n) + 0.5) / n,
      y = (Math.floor(i / n) + 0.5) / n;
    return (x * x + y * y) / (n * n);
  }).reduce((a, b) => a + b, 0);
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
          max={20}
          onChange={setN}
        />
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", { sum: sum.toFixed(4) })}
        />
      }
    >
      <svg viewBox="0 0 420 290" role="img" aria-label={t("graphLabel", { n })}>
        {Array.from({ length: n * n }, (_, i) => {
          const column = i % n,
            row = Math.floor(i / n);
          const x = (column + 0.5) / n,
            y = (row + 0.5) / n;
          return (
            <rect
              key={i}
              x={80 + (220 * column) / n}
              y={245 - (220 * (row + 1)) / n}
              width={220 / n}
              height={220 / n}
              fill="currentColor"
              fillOpacity={0.08 + (0.55 * (x * x + y * y)) / 2}
              stroke="var(--background)"
              strokeWidth=".7"
            />
          );
        })}
        <rect
          x="80"
          y="25"
          width="220"
          height="220"
          fill="none"
          stroke="currentColor"
          strokeOpacity=".5"
        />
        <SvgTex x={305} y={248} width={25} source="x" />
        <SvgTex x={58} y={12} width={25} source="y" />
        <SvgTex x={295} y={250} width={20} source="1" />
        <SvgTex x={57} y={20} width={20} source="1" />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <p>
          <Tex source={String.raw`\Delta A=\frac1{n^2}`} />
        </p>
        <div>
          <Tex
            source={String.raw`\iint(x^2+y^2)\,\mathrm dA=\frac23\approx0.6667`}
            display
          />
        </div>
      </div>
    </DemoFrame>
  );
}
