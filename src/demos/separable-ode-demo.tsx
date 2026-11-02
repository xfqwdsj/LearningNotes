"use client";

import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

export default function SeparableOdeDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [k, setK] = useState(1);
  const [x, setX] = useState(1);
  const sx = (value: number) => roundSvgNumber(62 + (value / 2) * 382);
  const sy = (value: number) => roundSvgNumber(226 - (value / 11) * 180);
  const curve = (rate: number) =>
    Array.from({ length: 81 }, (_, index) => {
      const value = (2 * index) / 80;
      return `${index === 0 ? "M" : "L"}${sx(value)} ${sy(2 * Math.exp(rate * value))}`;
    }).join("");
  const y = 2 * Math.exp(k * x);
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
        <>
          <DemoRange
            label={t.markdown("k")}
            value={k}
            display={`$${number(k)}$`}
            min={-1}
            max={1}
            step={0.1}
            onChange={setK}
          />
          <DemoRange
            label={t.markdown("x")}
            value={x}
            display={`$${number(x)}$`}
            min={0}
            max={2}
            step={0.1}
            onChange={setX}
          />
        </>
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", { slope: number(k * y) })}
        />
      }
    >
      <svg viewBox="0 0 500 285" role="img" aria-label={t("label")}>
        <path
          d="M62 226H452M62 226V34"
          fill="none"
          stroke="currentColor"
          strokeOpacity=".25"
        />
        {[-1, 0, 1].map((rate) => (
          <path
            key={rate}
            d={curve(rate)}
            fill="none"
            stroke="currentColor"
            strokeOpacity=".18"
            strokeWidth="1.5"
          />
        ))}
        <path
          d={curve(k)}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.75"
        />
        <circle cx={sx(x)} cy={sy(y)} r="6" fill="currentColor" />
        <SvgTex
          x={sx(x) + 8}
          y={Math.max(24, sy(y) - 22)}
          width={78}
          source={String.raw`y=${number(y)}`}
        />
        <SvgTex x={448} y={210} width={28} source="x" />
        <SvgTex x={28} y={28} width={28} source="y" />
        <SvgTex x={14} y={14} width={116} source="y=2e^{kx}" />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <p>
          <Tex source={String.raw`y'=ky=${number(k * y)}`} />
        </p>
      </div>
    </DemoFrame>
  );
}
