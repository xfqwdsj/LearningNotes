"use client";

import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

export default function RolleDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [b, setB] = useState(4);
  const xi = b / 2;
  const ceiling = Math.max(1, (b * b) / 4);
  const sx = (x: number) => roundSvgNumber(62 + (x / b) * 382);
  const sy = (y: number) => roundSvgNumber(54 - (y / ceiling) * 164);
  const curve = Array.from({ length: 101 }, (_, index) => {
    const x = (b * index) / 100;
    return `${index === 0 ? "M" : "L"}${sx(x)} ${sy(x * (x - b))}`;
  }).join("");
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
        <DemoRange
          label={t.markdown("b")}
          value={b}
          display={`$${number(b)}$`}
          min={1}
          max={8}
          onChange={setB}
        />
      }
      conclusion={
        <IcuMarkdownText value={t.markdown("result", { xi: number(xi) })} />
      }
    >
      <svg viewBox="0 0 500 280" role="img" aria-label={t("label")}>
        <path
          d={`M${sx(0)} ${sy(0)}H${sx(b)}M${sx(0)} ${sy(0)}V${sy(-ceiling)}`}
          fill="none"
          stroke="currentColor"
          strokeOpacity=".25"
        />
        <path d={curve} fill="none" stroke="currentColor" strokeWidth="2.75" />
        <line
          x1={sx(0)}
          y1={sy(0)}
          x2={sx(b)}
          y2={sy(0)}
          stroke="currentColor"
          strokeOpacity=".45"
          strokeDasharray="6 4"
        />
        <line
          x1={sx(xi - b * 0.16)}
          y1={sy(-ceiling)}
          x2={sx(xi + b * 0.16)}
          y2={sy(-ceiling)}
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx={sx(0)} cy={sy(0)} r="4" fill="currentColor" />
        <circle cx={sx(b)} cy={sy(0)} r="4" fill="currentColor" />
        <circle
          cx={sx(xi)}
          cy={sy(-ceiling)}
          r="5"
          fill="var(--background)"
          stroke="currentColor"
          strokeWidth="2"
        />
        <SvgTex x={448} y={44} width={28} source="x" />
        <SvgTex x={20} y={44} width={34} source="f" />
        <SvgTex x={338} y={44} width={122} source="f=x(x-b)" />
        <SvgTex
          x={Math.min(382, sx(xi) + 8)}
          y={sy(-ceiling) + 8}
          width={82}
          source={String.raw`\xi=${number(xi)}`}
        />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <p>
          <Tex
            source={String.raw`f(0)=f(${number(b)})=0,\qquad f'(\xi)=2\xi-${number(b)}=0`}
          />
        </p>
      </div>
    </DemoFrame>
  );
}
