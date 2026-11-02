"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import { tDensity } from "./distribution-density";
import type { DemoComponentProps } from "./types";
export default function PairedTestDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [d, setD] = useState(1),
    [n, setN] = useState(10);
  const value = (d * Math.sqrt(n)) / 2;
  const bound = Math.max(4, Math.abs(value) + 0.5),
    sx = (x: number) => 230 + (x / bound) * 175,
    sy = (y: number) => 200 - (y / 0.45) * 160;
  const curve = Array.from(
    { length: 201 },
    (_, i) => -bound + (2 * bound * i) / 200,
  )
    .map((x) => `${sx(x)},${sy(tDensity(x, n - 1))}`)
    .join(" ");
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label={t.markdown("d")}
            value={d}
            display={d.toFixed(1)}
            min={-3}
            max={3}
            step={0.5}
            onChange={setD}
          />
          <DemoRange
            label={t.markdown("n")}
            value={n}
            display={String(n)}
            min={2}
            max={30}
            onChange={setN}
          />
        </>
      }
      conclusion={
        <IcuMarkdownText value={t.markdown("result", { df: n - 1 })} />
      }
    >
      <p className="px-6 pt-4 text-sm">
        <IcuMarkdownText value={t.raw("graphNote") as string} />
      </p>
      <svg
        viewBox="0 0 460 240"
        role="img"
        aria-label={t("graphLabel", { df: n - 1, value: value.toFixed(3) })}
      >
        <line
          x1="55"
          y1="200"
          x2="405"
          y2="200"
          stroke="currentColor"
          strokeOpacity=".35"
        />
        <polyline
          points={curve}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <line
          x1={sx(value)}
          y1="35"
          x2={sx(value)}
          y2="200"
          stroke="currentColor"
          strokeDasharray="4 3"
        />
        <SvgTex x={sx(value) - 10} y={205} width={30} source="T" />
        <SvgTex x={46} y={205} width={45} source={(-bound).toFixed(1)} />
        <SvgTex x={380} y={205} width={45} source={bound.toFixed(1)} />
      </svg>
      <div className="px-6 py-4 text-sm">
        <Tex
          source={String.raw`T=\frac{\bar d}{2/\sqrt n}\approx${value.toFixed(3)}`}
        />
      </div>
    </DemoFrame>
  );
}
