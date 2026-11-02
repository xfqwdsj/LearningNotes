"use client";

import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

export default function ImplicitSlopeDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [x, setX] = useState(0.5);
  const y = Math.sqrt(1 - x * x);
  const slope = -x / y;
  const sx = (value: number) => roundSvgNumber(226 + value * 112);
  const sy = (value: number) => roundSvgNumber(155 - value * 112);
  const tangent = (value: number) => y + slope * (value - x);
  const upper = Array.from({ length: 101 }, (_, index) => {
    const value = -1 + index / 50;
    return `${index === 0 ? "M" : "L"}${sx(value)} ${sy(Math.sqrt(1 - value * value))}`;
  }).join("");
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
          min={-0.9}
          max={0.9}
          step={0.1}
          onChange={setX}
        />
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", { slope: number(slope) })}
        />
      }
    >
      <svg viewBox="0 0 500 290" role="img" aria-label={t("label")}>
        <path
          d="M82 155H370M226 30V280"
          fill="none"
          stroke="currentColor"
          strokeOpacity=".22"
        />
        <circle
          cx={sx(0)}
          cy={sy(0)}
          r="112"
          fill="none"
          stroke="currentColor"
          strokeOpacity=".16"
          strokeDasharray="5 5"
        />
        <path d={upper} fill="none" stroke="currentColor" strokeWidth="2.75" />
        <line
          x1={sx(Math.max(-1.4, x - 0.28))}
          y1={sy(tangent(Math.max(-1.4, x - 0.28)))}
          x2={sx(Math.min(1.4, x + 0.28))}
          y2={sy(tangent(Math.min(1.4, x + 0.28)))}
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx={sx(x)} cy={sy(y)} r="6" fill="currentColor" />
        <line
          x1={sx(x)}
          y1={sy(y)}
          x2={sx(x)}
          y2={sy(0)}
          stroke="currentColor"
          strokeOpacity=".45"
          strokeDasharray="4 4"
        />
        <SvgTex x={366} y={142} width={28} source="x" />
        <SvgTex x={234} y={24} width={28} source="y" />
        <SvgTex x={14} y={28} width={130} source="x^2+y^2=1" />
        <SvgTex
          x={Math.min(385, sx(x) + 7)}
          y={Math.max(24, sy(y) - 24)}
          width={82}
          source={String.raw`k=${number(slope)}`}
        />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <div>
          <Tex
            source={String.raw`2x+2y\frac{\mathrm dy}{\mathrm dx}=0,\qquad\frac{\mathrm dy}{\mathrm dx}=-\frac{x}{y}=${number(slope)}`}
            display
          />
        </div>
      </div>
    </DemoFrame>
  );
}
