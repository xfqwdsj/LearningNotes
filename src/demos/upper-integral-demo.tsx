"use client";

import { useId, useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

export default function UpperIntegralDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const marker = useId();
  const [x, setX] = useState(1);
  const integral = x ** 3 / 3;
  const integrandX = (value: number) =>
    roundSvgNumber(50 + ((value + 2) / 4) * 155);
  const integrandY = (value: number) => roundSvgNumber(144 - (value / 4) * 94);
  const cumulativeX = (value: number) =>
    roundSvgNumber(276 + ((value + 2) / 4) * 176);
  const cumulativeY = (value: number) =>
    roundSvgNumber(144 - (value / (8 / 3)) * 94);
  const left = Math.min(0, x);
  const right = Math.max(0, x);
  const area = `M${integrandX(left)} ${integrandY(0)}${Array.from(
    { length: 41 },
    (_, index) => {
      const value = left + ((right - left) * index) / 40;
      return `L${integrandX(value)} ${integrandY(value * value)}`;
    },
  ).join("")}L${integrandX(right)} ${integrandY(0)}Z`;
  const number = (value: number) =>
    format.number(value, {
      minimumFractionDigits: 3,
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
          min={-2}
          max={2}
          step={0.1}
          onChange={setX}
        />
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", { value: number(x * x) })}
        />
      }
    >
      <svg viewBox="0 0 500 260" role="img" aria-label={t("label")}>
        <defs>
          <marker
            id={marker}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M0 0L10 5L0 10Z" fill="currentColor" />
          </marker>
        </defs>
        <path d={area} fill="currentColor" fillOpacity=".2" />
        <path
          d={`M50 144H205M128 18V210M276 144H452M364 18V210`}
          fill="none"
          stroke="currentColor"
          strokeOpacity=".22"
        />
        <path
          d={Array.from({ length: 81 }, (_, index) => {
            const value = -2 + (4 * index) / 80;
            return `${index === 0 ? "M" : "L"}${integrandX(value)} ${integrandY(value * value)}`;
          }).join("")}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <path
          d={Array.from({ length: 81 }, (_, index) => {
            const value = -2 + (4 * index) / 80;
            return `${index === 0 ? "M" : "L"}${cumulativeX(value)} ${cumulativeY(value ** 3 / 3)}`;
          }).join("")}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <line
          x1={integrandX(x)}
          y1={integrandY(4)}
          x2={integrandX(x)}
          y2={integrandY(0)}
          stroke="currentColor"
          strokeWidth="2"
          markerEnd={`url(#${marker})`}
        />
        <circle
          cx={cumulativeX(x)}
          cy={cumulativeY(integral)}
          r="5"
          fill="currentColor"
        />
        <SvgTex x={16} y={20} width={116} source="t^2" />
        <SvgTex x={45} y={102} width={146} source="\Phi(x)" />
        <SvgTex x={408} y={20} width={44} source="\Phi" />
        <SvgTex
          x={cumulativeX(x) + 6}
          y={Math.max(160, cumulativeY(integral) + 6)}
          width={72}
          source={String.raw`\Phi=${number(integral)}`}
        />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <p>
          <Tex
            source={String.raw`\Phi(x)=${number(integral)},\qquad\Phi'(x)=x^2=${number(x * x)}`}
          />
        </p>
      </div>
    </DemoFrame>
  );
}
