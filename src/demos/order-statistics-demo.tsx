"use client";

import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

export default function OrderStatisticsDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [x, setX] = useState(4);
  const [k, setK] = useState(2);
  const original = [6, x, 2, 4, 9];
  const ordered = [...original].sort((left, right) => left - right);
  const sx = (value: number) => roundSvgNumber(70 + value * 36);

  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label={t.markdown("sample")}
            value={x}
            display={`$${x}$`}
            min={0}
            max={10}
            onChange={setX}
          />
          <DemoRange
            label={t.markdown("rank")}
            value={k}
            display={`$${k}$`}
            min={1}
            max={5}
            onChange={setK}
          />
        </>
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", { k, value: ordered[k - 1] ?? 0 })}
        />
      }
    >
      <svg viewBox="0 0 500 280" role="img" aria-label={t("label")}>
        <line
          x1="70"
          y1="90"
          x2="430"
          y2="90"
          stroke="currentColor"
          strokeOpacity=".2"
        />
        <line
          x1="70"
          y1="190"
          x2="430"
          y2="190"
          stroke="currentColor"
          strokeOpacity=".2"
        />
        <SvgTex x={20} y={70} width={76} source="\text{original}" />
        <SvgTex x={20} y={170} width={66} source="\text{sorted}" />
        {original.map((value, index) => (
          <g key={`original-${index}`}>
            <circle
              cx={sx(value)}
              cy={90}
              r="5"
              fill="currentColor"
              opacity=".7"
            />
            <SvgTex
              x={sx(value) - 8}
              y={100}
              width={30}
              source={String.raw`x_${index + 1}`}
            />
          </g>
        ))}
        {ordered.map((value, index) => (
          <g key={`ordered-${index}`}>
            <circle
              cx={sx(value)}
              cy={190}
              r={index === k - 1 ? 7 : 4}
              fill={index === k - 1 ? "var(--background)" : "currentColor"}
              stroke="currentColor"
              strokeWidth={index === k - 1 ? 2.5 : 0}
            />
            <SvgTex
              x={sx(value) - 10}
              y={202}
              width={42}
              source={String.raw`x_{(${index + 1})}`}
            />
          </g>
        ))}
        {[0, 2, 4, 6, 8, 10].map((tick) => (
          <SvgTex
            key={tick}
            x={sx(tick) - 9}
            y={236}
            width={30}
            source={String(tick)}
          />
        ))}
        <SvgTex x={438} y={178} width={28} source="x" />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <p>
          <Tex
            source={String.raw`X_{(1)}\le\cdots\le X_{(5)},\qquad X_{(${k})}=${ordered[k - 1] ?? 0}`}
          />
        </p>
      </div>
    </DemoFrame>
  );
}
