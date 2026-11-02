"use client";

import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

export default function LagrangeMeanDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [b, setB] = useState(3);
  const a = 1;
  const xi = (a + b) / 2;
  const slope = a + b;
  const ceiling = Math.max(b * b, 1);
  const sx = (x: number) => roundSvgNumber(62 + (x / b) * 382);
  const sy = (y: number) => roundSvgNumber(226 - (y / ceiling) * 176);
  const curve = Array.from({ length: 91 }, (_, index) => {
    const x = (b * index) / 90;
    return `${index === 0 ? "M" : "L"}${sx(x)} ${sy(x * x)}`;
  }).join("");
  const tangent = (x: number) => xi * xi + slope * (x - xi);
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
          value={t.markdown("result", { xi: number(xi), slope: number(slope) })}
        />
      }
    >
      <svg viewBox="0 0 500 280" role="img" aria-label={t("label")}>
        <path
          d={`M${sx(0)} ${sy(0)}H${sx(b)}M${sx(0)} ${sy(0)}V${sy(ceiling)}`}
          fill="none"
          stroke="currentColor"
          strokeOpacity=".25"
        />
        <path d={curve} fill="none" stroke="currentColor" strokeWidth="2.75" />
        <line
          x1={sx(a)}
          y1={sy(a * a)}
          x2={sx(b)}
          y2={sy(b * b)}
          stroke="currentColor"
          strokeOpacity=".45"
          strokeDasharray="6 4"
        />
        <line
          x1={sx(Math.max(0, xi - 0.16 * b))}
          y1={sy(tangent(Math.max(0, xi - 0.16 * b)))}
          x2={sx(Math.min(b, xi + 0.16 * b))}
          y2={sy(tangent(Math.min(b, xi + 0.16 * b)))}
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx={sx(a)} cy={sy(a * a)} r="4" fill="currentColor" />
        <circle cx={sx(b)} cy={sy(b * b)} r="4" fill="currentColor" />
        <circle
          cx={sx(xi)}
          cy={sy(xi * xi)}
          r="5"
          fill="var(--background)"
          stroke="currentColor"
          strokeWidth="2"
        />
        <SvgTex x={448} y={211} width={28} source="x" />
        <SvgTex x={20} y={46} width={34} source="f" />
        <SvgTex x={340} y={32} width={88} source="f=x^2" />
        <SvgTex
          x={Math.min(382, sx(xi) + 7)}
          y={Math.max(24, sy(xi * xi) - 28)}
          width={88}
          source={String.raw`\xi=${number(xi)}`}
        />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <p>
          <Tex
            source={String.raw`\frac{f(b)-f(a)}{b-a}=${number(slope)}=f'(\xi)`}
          />
        </p>
      </div>
    </DemoFrame>
  );
}
