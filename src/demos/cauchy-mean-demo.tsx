"use client";

import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

export default function CauchyMeanDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [b, setB] = useState(2);
  const ratio = (b * b - 1) / (b ** 3 - 1);
  const xi = 2 / (3 * ratio);
  const gMax = b ** 3;
  const fMax = b * b;
  const sx = (g: number) => roundSvgNumber(62 + (g / gMax) * 382);
  const sy = (f: number) => roundSvgNumber(226 - (f / fMax) * 176);
  const curve = Array.from({ length: 81 }, (_, index) => {
    const x = 1 + ((b - 1) * index) / 80;
    return `${index === 0 ? "M" : "L"}${sx(x ** 3)} ${sy(x * x)}`;
  }).join("");
  const ratioSlope = fMax / gMax;
  const tangentX1 = xi ** 3 - 0.22 * b ** 3;
  const tangentX2 = xi ** 3 + 0.22 * b ** 3;
  const tangent = (g: number) => xi * xi + ratioSlope * (g - xi ** 3);
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
          label={t.markdown("b")}
          value={b}
          display={`$${number(b)}$`}
          min={2}
          max={8}
          onChange={setB}
        />
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", { xi: number(xi), ratio: number(ratio) })}
        />
      }
    >
      <svg viewBox="0 0 500 280" role="img" aria-label={t("label")}>
        <path
          d={`M${sx(0)} ${sy(0)}H${sx(gMax)}M${sx(0)} ${sy(0)}V${sy(fMax)}`}
          fill="none"
          stroke="currentColor"
          strokeOpacity=".25"
        />
        <line
          x1={sx(1)}
          y1={sy(1)}
          x2={sx(gMax)}
          y2={sy(fMax)}
          stroke="currentColor"
          strokeOpacity=".45"
          strokeDasharray="6 4"
        />
        <path d={curve} fill="none" stroke="currentColor" strokeWidth="2.75" />
        <line
          x1={sx(tangentX1)}
          y1={sy(tangent(tangentX1))}
          x2={sx(tangentX2)}
          y2={sy(tangent(tangentX2))}
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx={sx(1)} cy={sy(1)} r="4" fill="currentColor" />
        <circle cx={sx(gMax)} cy={sy(fMax)} r="4" fill="currentColor" />
        <circle
          cx={sx(xi ** 3)}
          cy={sy(xi * xi)}
          r="5"
          fill="var(--background)"
          stroke="currentColor"
          strokeWidth="2"
        />
        <SvgTex x={458} y={211} width={34} source="g" />
        <SvgTex x={20} y={46} width={34} source="f" />
        <SvgTex
          x={Math.min(376, sx(xi ** 3) + 8)}
          y={Math.max(22, sy(xi * xi) - 28)}
          width={96}
          source={String.raw`\xi=${number(xi)}`}
        />
        <SvgTex x={12} y={24} width={112} source="g=x^3,\ f=x^2" />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <div>
          <Tex
            source={String.raw`\frac{\Delta f}{\Delta g}=${number(ratio)},\qquad\frac{f'(\xi)}{g'(\xi)}=${number(ratio)}`}
            display
          />
        </div>
      </div>
    </DemoFrame>
  );
}
