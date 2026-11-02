"use client";

import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

export default function HomogeneousOdeDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [u, setU] = useState(1);
  const [x, setX] = useState(2);
  const sx = (value: number) => roundSvgNumber(70 + (value / 4) * 368);
  const sy = (value: number) => roundSvgNumber(155 - (value / 8) * 110);
  const number = (value: number) =>
    format.number(value, {
      minimumFractionDigits: 1,
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
            label={t.markdown("ratio")}
            value={u}
            display={`$${number(u)}$`}
            min={-2}
            max={2}
            step={0.1}
            onChange={setU}
          />
          <DemoRange
            label={t.markdown("x")}
            value={x}
            display={`$${number(x)}$`}
            min={0.5}
            max={4}
            step={0.1}
            onChange={setX}
          />
        </>
      }
      conclusion={
        <IcuMarkdownText value={t.markdown("result", { u: number(u) })} />
      }
    >
      <svg viewBox="0 0 500 285" role="img" aria-label={t("label")}>
        <path
          d="M70 155H438M70 155V30"
          fill="none"
          stroke="currentColor"
          strokeOpacity=".25"
        />
        {[-2, -1, 0, 1, 2].map((ratio) => (
          <line
            key={ratio}
            x1={sx(0)}
            y1={sy(0)}
            x2={sx(4)}
            y2={sy(4 * ratio)}
            stroke="currentColor"
            strokeOpacity=".12"
          />
        ))}
        <line
          x1={sx(0)}
          y1={sy(0)}
          x2={sx(4)}
          y2={sy(4 * u)}
          stroke="currentColor"
          strokeWidth="2.75"
        />
        <line
          x1={sx(x)}
          y1={sy(0)}
          x2={sx(x)}
          y2={sy(u * x)}
          stroke="currentColor"
          strokeDasharray="4 4"
        />
        <circle cx={sx(x)} cy={sy(u * x)} r="6" fill="currentColor" />
        <SvgTex
          x={sx(x) + 8}
          y={Math.max(22, sy(u * x) - 22)}
          width={72}
          source={String.raw`y=ux`}
        />
        <SvgTex x={428} y={140} width={28} source="x" />
        <SvgTex x={28} y={28} width={28} source="y" />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <p>
          <Tex
            source={String.raw`y=ux=${number(u * x)},\qquad y'=u=${number(u)}`}
          />
        </p>
      </div>
    </DemoFrame>
  );
}
