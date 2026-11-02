"use client";

import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

export default function MultivariableContinuityDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [dx, setDx] = useState(0.5);
  const [dy, setDy] = useState(0.5);
  const distance = Math.hypot(dx, dy);
  const value = (1 + dx) ** 2 + (1 + dy) ** 2;
  const sx = (valueX: number) => roundSvgNumber(250 + (valueX - 1) * 150);
  const sy = (valueY: number) => roundSvgNumber(155 - (valueY - 1) * 115);
  const number = (valueToFormat: number) =>
    format.number(valueToFormat, {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    });

  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label={t.markdown("dx")}
            value={dx}
            display={`$${number(dx)}$`}
            min={-1}
            max={1}
            step={0.1}
            onChange={setDx}
          />
          <DemoRange
            label={t.markdown("dy")}
            value={dy}
            display={`$${number(dy)}$`}
            min={-1}
            max={1}
            step={0.1}
            onChange={setDy}
          />
        </>
      }
      conclusion={<IcuMarkdownText value={t.markdown("result")} />}
    >
      <svg viewBox="0 0 500 310" role="img" aria-label={t("label")}>
        <path
          d="M92 155H408M250 20V290"
          fill="none"
          stroke="currentColor"
          strokeOpacity=".25"
        />
        {[0.25, 0.5, 0.75, 1].map((radius) => (
          <circle
            key={radius}
            cx="250"
            cy="155"
            r={radius * 115}
            fill="none"
            stroke="currentColor"
            strokeOpacity=".12"
            strokeDasharray="4 4"
          />
        ))}
        <line
          x1="250"
          y1="155"
          x2={sx(1 + dx)}
          y2={sy(1 + dy)}
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx="250" cy="155" r="6" fill="currentColor" />
        <circle
          cx={sx(1 + dx)}
          cy={sy(1 + dy)}
          r="7"
          fill="var(--background)"
          stroke="currentColor"
          strokeWidth="2"
        />
        <SvgTex x={257} y={140} width={64} source="(1,1)" />
        <SvgTex
          x={Math.min(376, sx(1 + dx) + 8)}
          y={Math.max(24, sy(1 + dy) - 20)}
          width={90}
          source={String.raw`\rho=${number(distance)}`}
        />
        <SvgTex x={405} y={136} width={28} source="x" />
        <SvgTex x={258} y={16} width={28} source="y" />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <p>
          <Tex
            source={String.raw`\|(\Delta x,\Delta y)\|=${number(distance)},\qquad f(${number(1 + dx)},${number(1 + dy)})=${number(value)}`}
          />
        </p>
      </div>
    </DemoFrame>
  );
}
