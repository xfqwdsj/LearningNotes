"use client";

import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

export default function ChainRuleDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [x, setX] = useState(1);
  const u = x * x;
  const y = Math.sin(u);
  const slope = 2 * x * Math.cos(u);
  const sx = (value: number) => roundSvgNumber(246 + value * 90);
  const sy = (value: number) => roundSvgNumber(150 - value * 105);
  const curve = Array.from({ length: 241 }, (_, index) => {
    const value = -2 + index / 60;
    return `${index === 0 ? "M" : "L"}${sx(value)} ${sy(Math.sin(value * value))}`;
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
          min={-2}
          max={2}
          step={0.1}
          onChange={setX}
        />
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", { value: number(slope) })}
        />
      }
    >
      <svg viewBox="0 0 500 290" role="img" aria-label={t("label")}>
        <path
          d="M66 150H434M246 35V265"
          fill="none"
          stroke="currentColor"
          strokeOpacity=".22"
        />
        <path d={curve} fill="none" stroke="currentColor" strokeWidth="2.75" />
        <line
          x1={sx(Math.max(-2, x - 0.28))}
          y1={sy(y + slope * (Math.max(-2, x - 0.28) - x))}
          x2={sx(Math.min(2, x + 0.28))}
          y2={sy(y + slope * (Math.min(2, x + 0.28) - x))}
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx={sx(x)} cy={sy(y)} r="5" fill="currentColor" />
        <SvgTex x={434} y={135} width={28} source="x" />
        <SvgTex x={254} y={28} width={28} source="y" />
        <SvgTex x={18} y={28} width={130} source="y=\sin(x^2)" />
        <SvgTex
          x={Math.min(372, sx(x) + 8)}
          y={Math.max(24, sy(y) - 26)}
          width={72}
          source={String.raw`u=${number(u)}`}
        />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <div>
          <Tex
            source={String.raw`\frac{\mathrm du}{\mathrm dx}=${number(2 * x)},\qquad\frac{\mathrm dy}{\mathrm du}=${number(Math.cos(u))},\qquad\frac{\mathrm dy}{\mathrm dx}=${number(slope)}`}
            display
          />
        </div>
      </div>
    </DemoFrame>
  );
}
