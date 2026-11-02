"use client";

import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

export default function OdeSolutionDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [c, setC] = useState(1);
  const [x, setX] = useState(0);
  const currentY = (x * x) / 2 + c;
  const sx = (value: number) => roundSvgNumber(250 + value * 92);
  const sy = (value: number) => roundSvgNumber(155 - value * 28);
  const curve = (constant: number) =>
    Array.from({ length: 81 }, (_, index) => {
      const value = -2 + (4 * index) / 80;
      return `${index === 0 ? "M" : "L"}${sx(value)} ${sy((value * value) / 2 + constant)}`;
    }).join("");
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
            label={t.markdown("initial")}
            value={c}
            display={`$${number(c)}$`}
            min={-3}
            max={3}
            step={0.5}
            onChange={setC}
          />
          <DemoRange
            label={t.markdown("x")}
            value={x}
            display={`$${number(x)}$`}
            min={-2}
            max={2}
            step={0.1}
            onChange={setX}
          />
        </>
      }
      conclusion={
        <IcuMarkdownText value={t.markdown("result", { c: number(c) })} />
      }
    >
      <svg viewBox="0 0 500 300" role="img" aria-label={t("label")}>
        <path
          d="M64 155H436M250 24V286"
          fill="none"
          stroke="currentColor"
          strokeOpacity=".22"
        />
        {[-2, -1, 0, 2].map((constant) => (
          <path
            key={constant}
            d={curve(constant)}
            fill="none"
            stroke="currentColor"
            strokeOpacity=".18"
            strokeWidth="1.5"
          />
        ))}
        <path
          d={curve(c)}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.75"
        />
        <circle cx={sx(x)} cy={sy(currentY)} r="6" fill="currentColor" />
        <SvgTex
          x={sx(x) + 8}
          y={Math.max(24, sy(currentY) - 22)}
          width={82}
          source={String.raw`C=${number(c)}`}
        />
        <SvgTex x={405} y={139} width={28} source="x" />
        <SvgTex x={258} y={16} width={28} source="y" />
        <SvgTex x={14} y={22} width={124} source="y=\frac{x^2}{2}+C" />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <p>
          <Tex
            source={String.raw`y(${number(x)})=${number(currentY)},\qquad y'=x`}
          />
        </p>
      </div>
    </DemoFrame>
  );
}
