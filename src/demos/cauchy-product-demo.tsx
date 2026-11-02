"use client";

import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";

export default function CauchyProductDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [n, setN] = useState(2);
  const terms = Array.from(
    { length: n + 1 },
    (_, index) => 2 ** -index * 3 ** -(n - index),
  );
  const sum = terms.reduce((total, value) => total + value, 0);
  const cell = 34;
  const start = [105, 58] as const;
  const number = (value: number) =>
    format.number(value, {
      minimumFractionDigits: 4,
      maximumFractionDigits: 5,
    });

  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <DemoRange
          label={t.markdown("index")}
          value={n}
          display={`$${n}$`}
          min={0}
          max={8}
          onChange={setN}
        />
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", { n, coefficient: number(sum) })}
        />
      }
    >
      <svg viewBox="0 0 500 330" role="img" aria-label={t("label")}>
        {Array.from({ length: 9 }, (_, column) => (
          <SvgTex
            key={`c-${column}`}
            x={start[0] + column * cell + 5}
            y={start[1] - 24}
            width={cell}
            source={String(column)}
          />
        ))}
        {Array.from({ length: 9 }, (_, row) => (
          <SvgTex
            key={`r-${row}`}
            x={start[0] - 28}
            y={start[1] + row * cell + 5}
            width={cell}
            source={String(row)}
          />
        ))}
        {Array.from({ length: 9 }, (_, row) =>
          Array.from({ length: 9 }, (_, column) => {
            const selected = row + column === n;
            return (
              <rect
                key={`${row}-${column}`}
                x={start[0] + column * cell}
                y={start[1] + row * cell}
                width={cell - 2}
                height={cell - 2}
                fill="currentColor"
                fillOpacity={selected ? 0.35 : 0.035}
                stroke="currentColor"
                strokeOpacity=".16"
              />
            );
          }),
        )}
        <SvgTex x={400} y={start[1] + 4} width={28} source="j" />
        <SvgTex x={start[0] - 2} y={18} width={78} source="i+j=n" />
        <SvgTex x={98} y={296} width={66} source={String.raw`C_n=\sum`} />
        <SvgTex x={192} y={296} width={88} source={number(sum)} />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <div>
          <Tex
            source={String.raw`C_n=\sum_{k=0}^n a_kb_{n-k}=${number(sum)}`}
            display
          />
        </div>
      </div>
    </DemoFrame>
  );
}
