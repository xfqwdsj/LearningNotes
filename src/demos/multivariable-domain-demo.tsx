"use client";

import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

export default function MultivariableDomainDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const radicand = 1 - x * x - y * y;
  const valid = radicand >= -1e-9;
  const sx = (value: number) => roundSvgNumber(250 + value * 105);
  const sy = (value: number) => roundSvgNumber(155 - value * 105);
  const number = (value: number) =>
    format.number(value, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label={t.markdown("x")}
            value={x}
            display={`$${number(x)}$`}
            min={-1.5}
            max={1.5}
            step={0.1}
            onChange={setX}
          />
          <DemoRange
            label={t.markdown("y")}
            value={y}
            display={`$${number(y)}$`}
            min={-1.5}
            max={1.5}
            step={0.1}
            onChange={setY}
          />
        </>
      }
      conclusion={
        <IcuMarkdownText value={t.markdown(valid ? "inside" : "outside")} />
      }
    >
      <svg viewBox="0 0 500 310" role="img" aria-label={t("label")}>
        <circle
          cx="250"
          cy="155"
          r="105"
          fill="currentColor"
          fillOpacity=".1"
        />
        <circle
          cx="250"
          cy="155"
          r="105"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <path
          d="M110 155H390M250 15V295"
          fill="none"
          stroke="currentColor"
          strokeOpacity=".25"
        />
        <circle
          cx={sx(x)}
          cy={sy(y)}
          r="7"
          fill={valid ? "currentColor" : "var(--background)"}
          stroke="currentColor"
          strokeWidth="2"
        />
        <SvgTex
          x={Math.min(385, sx(x) + 8)}
          y={Math.max(18, sy(y) - 20)}
          width={82}
          source={String.raw`r^2=${number(x * x + y * y)}`}
        />
        <SvgTex x={103} y={155} width={54} source="-1" />
        <SvgTex x={354} y={155} width={34} source="1" />
        <SvgTex x={387} y={137} width={28} source="x" />
        <SvgTex x={258} y={8} width={28} source="y" />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <p>
          <Tex
            source={String.raw`1-x^2-y^2=${number(radicand)},\qquad f(x,y)=${valid ? number(Math.sqrt(Math.max(0, radicand))) : `\\text{${t("undefinedLabel")}}`}`}
          />
        </p>
      </div>
    </DemoFrame>
  );
}
