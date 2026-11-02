"use client";

import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

export default function InverseDerivativeDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [x, setX] = useState(1);
  const y = x ** 3;
  const slope = 3 * x * x;
  const sx = (value: number) => roundSvgNumber(62 + (value / 8) * 382);
  const sy = (value: number) => roundSvgNumber(228 - (value / 8) * 180);
  const original = Array.from({ length: 101 }, (_, index) => {
    const value = (2 * index) / 100;
    return `${index === 0 ? "M" : "L"}${sx(value)} ${sy(value ** 3)}`;
  }).join("");
  const inverse = Array.from({ length: 101 }, (_, index) => {
    const value = (8 * index) / 100;
    return `${index === 0 ? "M" : "L"}${sx(value)} ${sy(Math.cbrt(value))}`;
  }).join("");
  const number = (valueToFormat: number) =>
    format.number(valueToFormat, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 3,
    });

  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <DemoRange
          label={t.markdown("x")}
          value={x}
          display={`$${number(x)}$`}
          min={0.2}
          max={2}
          step={0.1}
          onChange={setX}
        />
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", { inverse: number(1 / slope) })}
        />
      }
    >
      <svg viewBox="0 0 500 280" role="img" aria-label={t("label")}>
        <path
          d={`M62 ${sy(0)}H452M62 ${sy(0)}V38`}
          fill="none"
          stroke="currentColor"
          strokeOpacity=".25"
        />
        <line
          x1={sx(0)}
          y1={sy(0)}
          x2={sx(8)}
          y2={sy(8)}
          stroke="currentColor"
          strokeOpacity=".25"
          strokeDasharray="5 4"
        />
        <path
          d={original}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.75"
        />
        <path
          d={inverse}
          fill="none"
          stroke="currentColor"
          strokeOpacity=".65"
          strokeWidth="2"
          strokeDasharray="6 4"
        />
        <line
          x1={sx(x)}
          y1={sy(y)}
          x2={sx(y)}
          y2={sy(x)}
          stroke="currentColor"
          strokeOpacity=".45"
          strokeDasharray="4 4"
        />
        <circle cx={sx(x)} cy={sy(y)} r="5" fill="currentColor" />
        <circle
          cx={sx(y)}
          cy={sy(x)}
          r="5"
          fill="var(--background)"
          stroke="currentColor"
          strokeWidth="2"
        />
        <SvgTex x={448} y={214} width={28} source="x" />
        <SvgTex x={28} y={34} width={28} source="y" />
        <SvgTex x={300} y={42} width={126} source="y=x^3" />
        <SvgTex x={300} y={210} width={126} source="x=\sqrt[3]{y}" />
        <SvgTex
          x={Math.min(362, sx(y) + 7)}
          y={Math.max(24, sy(x) - 24)}
          width={80}
          source={String.raw`\frac{dx}{dy}=${number(1 / slope)}`}
          height={38}
        />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <div>
          <Tex
            source={String.raw`\frac{\mathrm dy}{\mathrm dx}=${number(slope)},\qquad\frac{\mathrm dx}{\mathrm dy}=${number(1 / slope)}`}
            display
          />
        </div>
      </div>
    </DemoFrame>
  );
}
