"use client";

import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

export default function LikelihoodBernoulliDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [success, setSuccess] = useState(3);
  const [p, setP] = useState(0.5);
  const sx = (value: number) => roundSvgNumber(70 + value * 360);
  const sy = (value: number) => roundSvgNumber(230 - value * 180);
  const likelihood = (value: number) =>
    value ** success * (1 - value) ** (5 - success);
  const peak = success / 5;
  const curve = Array.from({ length: 201 }, (_, index) => {
    const value = index / 200;
    return `${index === 0 ? "M" : "L"}${sx(value)} ${sy(likelihood(value))}`;
  }).join("");
  const current = likelihood(p);
  const number = (value: number) =>
    format.number(value, {
      minimumFractionDigits: 3,
      maximumFractionDigits: 5,
    });

  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label={t.markdown("success")}
            value={success}
            display={`$${success}$`}
            min={0}
            max={5}
            onChange={setSuccess}
          />
          <DemoRange
            label={t.markdown("p")}
            value={p}
            display={`$${roundSvgNumber(p).toFixed(2)}$`}
            min={0}
            max={1}
            step={0.05}
            onChange={setP}
          />
        </>
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", { estimate: number(peak) })}
        />
      }
    >
      <svg viewBox="0 0 500 280" role="img" aria-label={t("label")}>
        <path
          d={`M70 ${sy(0)}H434M70 ${sy(0)}V38`}
          fill="none"
          stroke="currentColor"
          strokeOpacity=".25"
        />
        <path d={curve} fill="none" stroke="currentColor" strokeWidth="2.75" />
        <line
          x1={sx(p)}
          y1="38"
          x2={sx(p)}
          y2={sy(0)}
          stroke="currentColor"
          strokeDasharray="4 4"
        />
        <line
          x1={sx(peak)}
          y1="38"
          x2={sx(peak)}
          y2={sy(0)}
          stroke="currentColor"
          strokeOpacity=".35"
          strokeDasharray="5 4"
        />
        <circle cx={sx(p)} cy={sy(current)} r="6" fill="currentColor" />
        <SvgTex x={sx(peak) - 12} y={16} width={54} source="\hat p" />
        {[0, 0.2, 0.4, 0.6, 0.8, 1].map((tick) => (
          <SvgTex
            key={tick}
            x={sx(tick) - 12}
            y={236}
            width={42}
            source={String(tick)}
          />
        ))}
        <SvgTex x={19} y={22} width={74} source="L(p)" />
        <SvgTex x={440} y={214} width={28} source="p" />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <p>
          <Tex
            source={String.raw`L(p)=p^{${success}}(1-p)^{${5 - success}},\qquad L(${roundSvgNumber(p).toFixed(2)})=${number(current)}`}
          />
        </p>
      </div>
    </DemoFrame>
  );
}
