"use client";

import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

export default function ParametricSlopeDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [parameter, setParameter] = useState(1);
  const slope = (3 * parameter) / 2;
  const sx = (x: number) => roundSvgNumber(62 + (x / 4) * 382);
  const sy = (y: number) => roundSvgNumber(228 - (y / 8) * 180);
  const curve = Array.from({ length: 121 }, (_, index) => {
    const value = (2 * index) / 120;
    return `${index === 0 ? "M" : "L"}${sx(value * value)} ${sy(value ** 3)}`;
  }).join("");
  const currentX = parameter * parameter;
  const currentY = parameter ** 3;
  const number = (value: number) =>
    format.number(value, {
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
          label={t.markdown("parameter")}
          value={parameter}
          display={`$${number(parameter)}$`}
          min={0.2}
          max={2}
          step={0.1}
          onChange={setParameter}
        />
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", { slope: number(slope) })}
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
        <path d={curve} fill="none" stroke="currentColor" strokeWidth="2.75" />
        <line
          x1={sx(Math.max(0, currentX - 0.55))}
          y1={sy(Math.max(0, currentY - 0.55 * slope))}
          x2={sx(Math.min(4, currentX + 0.55))}
          y2={sy(currentY + 0.55 * slope)}
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx={sx(currentX)} cy={sy(currentY)} r="6" fill="currentColor" />
        <SvgTex x={452} y={214} width={28} source="x" />
        <SvgTex x={28} y={34} width={28} source="y" />
        <SvgTex x={18} y={22} width={156} source="x=t^2,\ y=t^3" />
        <SvgTex
          x={Math.min(370, sx(currentX) + 8)}
          y={Math.max(24, sy(currentY) - 26)}
          width={74}
          source={String.raw`t=${number(parameter)}`}
        />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <div>
          <Tex
            source={String.raw`\frac{\mathrm dy}{\mathrm dx}=\frac{3t^2}{2t}=\frac{3t}{2}=${number(slope)}`}
            display
          />
        </div>
      </div>
    </DemoFrame>
  );
}
