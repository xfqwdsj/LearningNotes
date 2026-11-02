"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import { roundSvgNumber } from "./svg";
import type { DemoComponentProps } from "./types";
export default function ExponentialTailDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [rate, setRate] = useState(1);
  const [time, setTime] = useState(1);
  const p = Math.exp(-rate * time);
  const num = (v: number) => format.number(v, { maximumFractionDigits: 2 });
  const points = Array.from({ length: 81 }, (_, i) => {
    const x = (4 * i) / 80;
    return `${roundSvgNumber(40 + x * 95)},${roundSvgNumber(210 - 160 * Math.exp(-rate * x))}`;
  }).join(" ");
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label={t.markdown("rate")}
            value={rate}
            display={num(rate)}
            min={0.25}
            max={2}
            step={0.25}
            onChange={setRate}
          />
          <DemoRange
            label={t.markdown("time")}
            value={time}
            display={num(time)}
            min={0}
            max={4}
            step={0.25}
            onChange={setTime}
          />
        </>
      }
      conclusion={
        <IcuMarkdownText value={t.markdown("result", { value: num(p) })} />
      }
    >
      <svg
        viewBox="0 0 460 270"
        role="img"
        aria-label={t("diagram", { value: num(p) })}
      >
        <line
          x1="40"
          y1="210"
          x2="420"
          y2="210"
          stroke="currentColor"
          opacity=".35"
        />
        <line
          x1="40"
          y1="50"
          x2="40"
          y2="210"
          stroke="currentColor"
          opacity=".35"
        />
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        />
        <circle
          cx={40 + 95 * time}
          cy={roundSvgNumber(210 - 160 * p)}
          r="6"
          fill="currentColor"
        />
        <SvgTex x={25} y={220} width={25} source="0" />
        <SvgTex x={405} y={220} width={25} source="4" />
        <SvgTex x={7} y={45} width={25} source="1" />
      </svg>
    </DemoFrame>
  );
}
