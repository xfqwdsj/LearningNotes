"use client";

import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

export default function MultivariableLimitDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [m, setM] = useState(1);
  const [x, setX] = useState(0.5);
  const value = m / (1 + m * m);
  const sx = (valueX: number) => roundSvgNumber(250 + valueX * 170);
  const sy = (valueY: number) => roundSvgNumber(155 - valueY * 70);
  const number = (valueToFormat: number) =>
    format.number(valueToFormat, {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    });

  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro").toString()}
      controls={
        <>
          <DemoRange
            label={t.markdown("m")}
            value={m}
            display={`$${number(m)}$`}
            min={-2}
            max={2}
            step={0.1}
            onChange={setM}
          />
          <DemoRange
            label={t.markdown("x")}
            value={x}
            display={`$${number(x)}$`}
            min={0.05}
            max={1}
            step={0.05}
            onChange={setX}
          />
        </>
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", { value: number(value) })}
        />
      }
    >
      <svg viewBox="0 0 500 310" role="img" aria-label={t("label")}>
        <path
          d="M75 155H425M250 20V290"
          fill="none"
          stroke="currentColor"
          strokeOpacity=".25"
        />
        {[-2, -1, 0, 1, 2].map((slope) => (
          <line
            key={slope}
            x1={sx(-1)}
            y1={sy(-slope)}
            x2={sx(1)}
            y2={sy(slope)}
            stroke="currentColor"
            strokeOpacity=".12"
          />
        ))}
        <line
          x1={sx(-1)}
          y1={sy(-m)}
          x2={sx(1)}
          y2={sy(m)}
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <circle cx={sx(x)} cy={sy(m * x)} r="7" fill="currentColor" />
        <circle
          cx="250"
          cy="155"
          r="5"
          fill="var(--background)"
          stroke="currentColor"
          strokeWidth="2"
        />
        <SvgTex x={410} y={134} width={28} source="x" />
        <SvgTex x={258} y={18} width={28} source="y" />
        <SvgTex x={258} y={164} width={28} source="O" />
        <SvgTex
          x={Math.min(360, sx(x) + 8)}
          y={Math.max(26, sy(m * x) - 24)}
          width={102}
          source={String.raw`y=${number(m)}x`}
        />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <div>
          <Tex
            source={String.raw`\frac{xy}{x^2+y^2}=\frac{m}{1+m^2}=${number(value)}`}
            display
          />
        </div>
      </div>
    </DemoFrame>
  );
}
