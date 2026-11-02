"use client";

import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

export default function BetweenCurvesDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [b, setB] = useState(1);
  const area = (b * b) / 2 - b ** 3 / 3;
  const sx = (value: number) => roundSvgNumber(58 + 382 * value);
  const sy = (value: number) => roundSvgNumber(226 - 146 * value);
  const curve = (fn: (x: number) => number) =>
    Array.from({ length: 81 }, (_, index) => {
      const x = index / 80;
      return `${index === 0 ? "M" : "L"}${sx(x)} ${sy(fn(x))}`;
    }).join(" ");
  const areaPath = (() => {
    const top = Array.from({ length: 41 }, (_, index) => {
      const x = (b * index) / 40;
      return `${index === 0 ? "M" : "L"}${sx(x)} ${sy(x)}`;
    }).join(" ");
    const bottom = Array.from({ length: 41 }, (_, reverse) => {
      const index = 40 - reverse;
      const x = (b * index) / 40;
      return `L${sx(x)} ${sy(x * x)}`;
    }).join(" ");
    return `${top}${bottom}Z`;
  })();
  const number = (value: number) =>
    format.number(value, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
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
          max={1}
          step={0.05}
          onChange={setB}
        />
      }
      conclusion={
        <IcuMarkdownText value={t.markdown("result", { area: number(area) })} />
      }
    >
      <svg viewBox="0 0 500 285" role="img" aria-label={t("label")}>
        <path d={areaPath} fill="currentColor" fillOpacity=".2" />
        <path
          d={`M${sx(0)} ${sy(0)}H${sx(1)}M${sx(0)} ${sy(0)}V${sy(1.2)}`}
          fill="none"
          stroke="currentColor"
          strokeOpacity=".35"
        />
        <path
          d={curve((x) => x)}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <path
          d={curve((x) => x * x)}
          fill="none"
          stroke="currentColor"
          strokeOpacity=".65"
          strokeWidth="2"
          strokeDasharray="6 4"
        />
        <line
          x1={sx(b)}
          y1={sy(b)}
          x2={sx(b)}
          y2={sy(b * b)}
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx={sx(b)} cy={sy(b)} r="5" fill="currentColor" />
        <circle
          cx={sx(b)}
          cy={sy(b * b)}
          r="5"
          fill="var(--background)"
          stroke="currentColor"
          strokeWidth="2"
        />
        {[0, 0.5, 1].map((tick) => (
          <SvgTex
            key={tick}
            x={sx(tick) - 14}
            y={236}
            width={42}
            source={tick === 0.5 ? "0.5" : String(tick)}
          />
        ))}
        {[0.5, 1, 1.5].map((tick) => (
          <SvgTex
            key={tick}
            x={31}
            y={sy(tick) - 9}
            width={28}
            source={String(tick)}
          />
        ))}
        <SvgTex x={438} y={214} width={30} source="x" />
        <SvgTex x={22} y={48} width={30} source="y" />
        <SvgTex x={384} y={109} width={70} source="y=x" />
        <SvgTex x={350} y={193} width={78} source="y=x^2" />
        <SvgTex
          x={Math.min(405, sx(b) + 8)}
          y={sy((b + b * b) / 2) - 20}
          width={85}
          source={String.raw`A=${number(area)}`}
        />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <div>
          <Tex
            source={String.raw`A(b)=\int_0^b(x-x^2)\,\mathrm dx=\frac{b^2}{2}-\frac{b^3}{3}=${number(area)}`}
            display
          />
        </div>
      </div>
    </DemoFrame>
  );
}
