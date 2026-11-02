"use client";

import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

export default function PartsBoundaryDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [b, setB] = useState(1);
  const boundary = b * Math.exp(b);
  const remaining = Math.expm1(b);
  const value = boundary - remaining;
  const ceiling = Math.max(1, 3 * Math.exp(3));
  const sx = (x: number) => roundSvgNumber(62 + (x / 3) * 382);
  const sy = (y: number) => roundSvgNumber(228 - (y / ceiling) * 180);
  const area = `M${sx(0)} ${sy(0)}${Array.from({ length: 61 }, (_, index) => {
    const x = (b * index) / 60;
    return `L${sx(x)} ${sy(x * Math.exp(x))}`;
  }).join("")}L${sx(b)} ${sy(0)}Z`;
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
        <DemoRange
          label={t.markdown("b")}
          value={b}
          display={`$${number(b)}$`}
          min={0}
          max={3}
          step={0.1}
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
        <path d={area} fill="currentColor" fillOpacity=".2" />
        <path
          d={`M62 ${sy(0)}H452M62 ${sy(0)}V38`}
          fill="none"
          stroke="currentColor"
          strokeOpacity=".25"
        />
        <path
          d={Array.from({ length: 91 }, (_, index) => {
            const x = (3 * index) / 90;
            return `${index === 0 ? "M" : "L"}${sx(x)} ${sy(x * Math.exp(x))}`;
          }).join("")}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.75"
        />
        <line
          x1={sx(b)}
          y1={sy(0)}
          x2={sx(b)}
          y2={sy(b * Math.exp(b))}
          stroke="currentColor"
          strokeWidth="2"
        />
        <SvgTex x={448} y={214} width={28} source="x" />
        <SvgTex x={28} y={34} width={28} source="y" />
        <SvgTex x={314} y={162} width={132} source="y=xe^x" />
        <SvgTex
          x={Math.min(362, sx(b) + 7)}
          y={sy((b * Math.exp(b)) / 2) - 18}
          width={92}
          source={String.raw`I=${number(value)}`}
        />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <div>
          <Tex
            source={String.raw`[xe^x]_0^b=${number(boundary)},\qquad\int_0^be^x\,\mathrm dx=${number(remaining)}`}
            display
          />
        </div>
      </div>
    </DemoFrame>
  );
}
