"use client";

import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

export default function ElementSumDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [n, setN] = useState(5);
  const width = 1 / n;
  const sum = Array.from(
    { length: n },
    (_, index) => ((index + 0.5) / n) ** 2 * width,
  ).reduce((total, value) => total + value, 0);
  const sx = (value: number) => roundSvgNumber(62 + 394 * value);
  const sy = (value: number) => roundSvgNumber(229 - 174 * value);
  const number = (value: number) =>
    format.number(value, {
      minimumFractionDigits: 5,
      maximumFractionDigits: 5,
    });

  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <DemoRange
          label={t.markdown("n")}
          value={n}
          display={`$${n}$`}
          min={1}
          max={30}
          onChange={setN}
        />
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", { error: number(1 / 3 - sum) })}
        />
      }
    >
      <svg viewBox="0 0 500 280" role="img" aria-label={t("label")}>
        {Array.from({ length: n }, (_, index) => {
          const x0 = index * width;
          const height = (x0 + width / 2) ** 2;
          return (
            <rect
              key={index}
              x={sx(x0)}
              y={sy(height)}
              width={sx(x0 + width) - sx(x0)}
              height={sy(0) - sy(height)}
              fill="currentColor"
              fillOpacity=".2"
              stroke="currentColor"
              strokeOpacity=".35"
              strokeWidth=".8"
            />
          );
        })}
        <path
          d={`M${sx(0)} ${sy(0)}H${sx(1)}M${sx(0)} ${sy(0)}V${sy(1)}`}
          fill="none"
          stroke="currentColor"
          strokeOpacity=".3"
        />
        <path
          d={Array.from({ length: 101 }, (_, index) => {
            const x = index / 100;
            return `${index === 0 ? "M" : "L"}${sx(x)} ${sy(x * x)}`;
          }).join("")}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <SvgTex x={458} y={215} width={28} source="x" />
        <SvgTex x={20} y={48} width={30} source="y" />
        <SvgTex x={450} y={40} width={42} source="x^2" />
        <SvgTex x={62} y={235} width={24} source="0" />
        <SvgTex x={440} y={235} width={24} source="1" />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <div>
          <Tex
            source={String.raw`\sum_{i=1}^n\left(\frac{i-1/2}{n}\right)^2\frac1n=${number(sum)}`}
            display
          />
        </div>
      </div>
    </DemoFrame>
  );
}
