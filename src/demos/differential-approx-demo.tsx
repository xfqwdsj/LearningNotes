"use client";

import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

export default function DifferentialApproxDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [dx, setDx] = useState(0.5);
  const approx = 2 + dx / 4;
  const exact = Math.sqrt(4 + dx);
  const pointX = 4 + dx;
  const sx = (x: number) => roundSvgNumber(62 + ((x - 1.5) / 5) * 376);
  const sy = (y: number) => roundSvgNumber(232 - ((y - 0.8) / 2.2) * 182);
  const curve = Array.from({ length: 101 }, (_, index) => {
    const x = 1.5 + (5 * index) / 100;
    return `${index === 0 ? "M" : "L"}${sx(x)} ${sy(Math.sqrt(x))}`;
  }).join("");
  const tangent = (x: number) => 2 + (x - 4) / 4;
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
          label={t.markdown("dx")}
          value={dx}
          display={`$${number(dx)}$`}
          min={-2}
          max={2}
          step={0.1}
          onChange={setDx}
        />
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", {
            error: format.number(approx - exact, {
              minimumFractionDigits: 3,
              maximumFractionDigits: 5,
            }),
          })}
        />
      }
    >
      <svg viewBox="0 0 500 280" role="img" aria-label={t("label")}>
        <path
          d="M62 232H442M74 232V38"
          fill="none"
          stroke="currentColor"
          strokeOpacity=".25"
        />
        <path d={curve} fill="none" stroke="currentColor" strokeWidth="2.75" />
        <line
          x1={sx(1.8)}
          y1={sy(tangent(1.8))}
          x2={sx(6.5)}
          y2={sy(tangent(6.5))}
          stroke="currentColor"
          strokeOpacity=".55"
          strokeWidth="2"
          strokeDasharray="6 4"
        />
        <line
          x1={sx(pointX)}
          y1={sy(exact)}
          x2={sx(pointX)}
          y2={sy(approx)}
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx={sx(4)} cy={sy(2)} r="4" fill="currentColor" />
        <circle cx={sx(pointX)} cy={sy(exact)} r="5" fill="currentColor" />
        <circle
          cx={sx(pointX)}
          cy={sy(approx)}
          r="5"
          fill="var(--background)"
          stroke="currentColor"
          strokeWidth="2"
        />
        <SvgTex x={438} y={216} width={28} source="x" />
        <SvgTex x={27} y={38} width={30} source="y" />
        <SvgTex x={14} y={22} width={118} source="f(x)=\sqrt x" />
        <SvgTex
          x={Math.min(384, sx(pointX) + 7)}
          y={Math.max(24, sy((exact + approx) / 2) - 12)}
          width={88}
          source={String.raw`\Delta x=${number(dx)}`}
        />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <p>
          <Tex
            source={String.raw`f(4+\Delta x)\approx${number(approx)},\qquad f(4+\Delta x)=${number(exact)}`}
          />
        </p>
      </div>
    </DemoFrame>
  );
}
