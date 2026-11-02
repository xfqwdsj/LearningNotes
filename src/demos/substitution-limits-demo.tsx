"use client";

import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

export default function SubstitutionLimitsDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [b, setB] = useState(1);
  const uTop = b * b;
  const value = Math.expm1(uTop);
  const sx = (x: number) => roundSvgNumber(68 + (x / 2) * 378);
  const sy = (u: number) => roundSvgNumber(220 - (u / 4) * 164);
  const curve = Array.from({ length: 81 }, (_, index) => {
    const x = (2 * index) / 80;
    return `${index === 0 ? "M" : "L"}${sx(x)} ${sy(x * x)}`;
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
          label={t.markdown("b")}
          value={b}
          display={`$${number(b)}$`}
          min={0}
          max={2}
          step={0.25}
          onChange={setB}
        />
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", { value: number(value) })}
        />
      }
    >
      <svg viewBox="0 0 500 280" role="img" aria-label={t("label")}>
        <path
          d={`M68 ${sy(0)}H452M68 ${sy(0)}V42`}
          fill="none"
          stroke="currentColor"
          strokeOpacity=".25"
        />
        {[0, 0.5, 1, 1.5, 2].map((tick) => (
          <g key={tick}>
            <line
              x1={sx(tick)}
              y1={sy(0)}
              x2={sx(tick)}
              y2={sy(0) + 6}
              stroke="currentColor"
              strokeOpacity=".4"
            />
            <SvgTex
              x={sx(tick) - 12}
              y={230}
              width={40}
              source={String(tick)}
            />
          </g>
        ))}
        {[0, 1, 2, 3, 4].map((tick) => (
          <g key={tick}>
            <line
              x1={68}
              y1={sy(tick)}
              x2={74}
              y2={sy(tick)}
              stroke="currentColor"
              strokeOpacity=".4"
            />
            <SvgTex x={34} y={sy(tick) - 10} width={28} source={String(tick)} />
          </g>
        ))}
        <path d={curve} fill="none" stroke="currentColor" strokeWidth="2.75" />
        <line
          x1={sx(b)}
          y1={sy(0)}
          x2={sx(b)}
          y2={sy(uTop)}
          stroke="currentColor"
          strokeDasharray="5 4"
        />
        <line
          x1={68}
          y1={sy(uTop)}
          x2={sx(b)}
          y2={sy(uTop)}
          stroke="currentColor"
          strokeDasharray="5 4"
        />
        <circle cx={sx(0)} cy={sy(0)} r="5" fill="currentColor" />
        <circle cx={sx(b)} cy={sy(uTop)} r="6" fill="currentColor" />
        <SvgTex x={452} y={206} width={28} source="x" />
        <SvgTex x={44} y={34} width={28} source="u" />
        <SvgTex x={296} y={42} width={80} source="u=x^2" />
        <SvgTex
          x={Math.min(382, sx(b) + 8)}
          y={sy(uTop) - 16}
          width={78}
          source={String.raw`b^2=${number(uTop)}`}
        />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <p>
          <Tex
            source={String.raw`x:0\to${number(b)},\qquad u=x^2:0\to${number(uTop)}`}
          />
        </p>
      </div>
    </DemoFrame>
  );
}
