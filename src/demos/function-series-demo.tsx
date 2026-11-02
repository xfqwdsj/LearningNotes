"use client";

import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

export default function FunctionSeriesDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [x, setX] = useState(1);
  const [n, setN] = useState(5);
  const sx = (value: number) => roundSvgNumber(72 + ((value + 2.5) / 5) * 382);
  const sy = (value: number) => roundSvgNumber(158 - (value / 10) * 112);
  const partial = (value: number) => {
    const ratio = value / 2;
    return Math.abs(ratio - 1) < 1e-9 ? n : (1 - ratio ** n) / (1 - ratio);
  };
  const limit = (value: number) =>
    Math.abs(value) < 2 ? 1 / (1 - value / 2) : Number.NaN;
  const sampled = Array.from({ length: 241 }, (_, index) => -2.5 + index / 48);
  const curve = (fn: (value: number) => number) => {
    let drawing = false;
    return sampled
      .map((value) => {
        const y = fn(value);
        if (!Number.isFinite(y) || Math.abs(y) > 10) {
          drawing = false;
          return "";
        }
        const command = drawing ? "L" : "M";
        drawing = true;
        return `${command}${sx(value)} ${sy(y)}`;
      })
      .join("");
  };
  const currentPartial = partial(x);
  const currentLimit = limit(x);
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
        <>
          <DemoRange
            label={t.markdown("x")}
            value={x}
            display={`$${number(x)}$`}
            min={-2.5}
            max={2.5}
            step={0.1}
            onChange={setX}
          />
          <DemoRange
            label={t.markdown("n")}
            value={n}
            display={`$${n}$`}
            min={1}
            max={20}
            onChange={setN}
          />
        </>
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown(Math.abs(x) < 2 ? "inside" : "outside")}
        />
      }
    >
      <svg viewBox="0 0 500 280" role="img" aria-label={t("label")}>
        <rect
          x={sx(-2)}
          y="34"
          width={sx(2) - sx(-2)}
          height="248"
          fill="currentColor"
          fillOpacity=".05"
        />
        <path
          d={`M66 158H470M${sx(0)} 34V262`}
          fill="none"
          stroke="currentColor"
          strokeOpacity=".25"
        />
        {[-2, 2].map((boundary) => (
          <line
            key={boundary}
            x1={sx(boundary)}
            y1="34"
            x2={sx(boundary)}
            y2="258"
            stroke="currentColor"
            strokeOpacity=".35"
            strokeDasharray="5 4"
          />
        ))}
        <path
          d={curve(limit)}
          fill="none"
          stroke="currentColor"
          strokeOpacity=".55"
          strokeWidth="2"
          strokeDasharray="7 4"
        />
        <path
          d={curve(partial)}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.75"
        />
        <line
          x1={sx(x)}
          y1="34"
          x2={sx(x)}
          y2="258"
          stroke="currentColor"
          strokeOpacity=".3"
        />
        <circle cx={sx(x)} cy={sy(currentPartial)} r="5" fill="currentColor" />
        {Number.isFinite(currentLimit) && (
          <circle
            cx={sx(x)}
            cy={sy(currentLimit)}
            r="5"
            fill="var(--background)"
            stroke="currentColor"
            strokeWidth="2"
          />
        )}
        {[-2.5, -2, 0, 2, 2.5].map((tick) => (
          <SvgTex
            key={tick}
            x={sx(tick) - 14}
            y={246}
            width={44}
            source={
              tick === -2.5
                ? "-2.5"
                : tick === -2
                  ? "-2"
                  : tick === 2.5
                    ? "2.5"
                    : String(tick)
            }
          />
        ))}
        <SvgTex x={12} y={26} width={86} source="S_n(x)" />
        <SvgTex x={12} y={50} width={86} source="S(x)" />
        <SvgTex x={470} y={244} width={28} source="x" />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <p>
          <Tex
            source={
              Number.isFinite(currentLimit)
                ? String.raw`S_n(${number(x)})=${number(currentPartial)},\qquad S(${number(x)})=${number(currentLimit)}`
                : String.raw`S_n(${number(x)})=${number(currentPartial)},\qquad \text{no finite limit}`
            }
          />
        </p>
      </div>
    </DemoFrame>
  );
}
