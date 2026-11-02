"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import { roundSvgNumber } from "./svg";
import type { DemoComponentProps } from "./types";
export default function OneMeanTestDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [mean, setMean] = useState(10),
    [n, setN] = useState(9);
  const z = ((mean - 10) * Math.sqrt(n)) / 2;
  const bound = Math.max(4, Math.abs(z) + 0.5);
  const sx = (value: number) => roundSvgNumber(230 + (value / bound) * 175);
  const sy = (value: number) =>
    roundSvgNumber(
      200 - (Math.exp((-value * value) / 2) / Math.sqrt(2 * Math.PI)) * 390,
    );
  const curve = Array.from(
    { length: 201 },
    (_, i) => -bound + (2 * bound * i) / 200,
  )
    .map((value) => `${sx(value)},${sy(value)}`)
    .join(" ");
  const tail = (low: number, high: number) => {
    const values = Array.from(
      { length: 81 },
      (_, i) => low + ((high - low) * i) / 80,
    );
    return `${sx(low)},200 ${values.map((value) => `${sx(value)},${sy(value)}`).join(" ")} ${sx(high)},200`;
  };
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label={t.markdown("mean")}
            value={mean}
            display={mean.toFixed(1)}
            min={7}
            max={13}
            step={0.5}
            onChange={setMean}
          />
          <DemoRange
            label={t.markdown("n")}
            value={n}
            display={String(n)}
            min={2}
            max={25}
            onChange={setN}
          />
        </>
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown(Math.abs(z) > 1.96 ? "reject" : "keep")}
        />
      }
    >
      <svg
        viewBox="0 0 460 240"
        role="img"
        aria-label={t("graphLabel", { z: z.toFixed(3) })}
      >
        <line
          x1="55"
          y1="200"
          x2="405"
          y2="200"
          stroke="currentColor"
          strokeOpacity=".35"
        />
        <polygon
          points={tail(-bound, -1.96)}
          fill="currentColor"
          fillOpacity=".2"
        />
        <polygon
          points={tail(1.96, bound)}
          fill="currentColor"
          fillOpacity=".2"
        />
        <polyline
          points={curve}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <line
          x1={sx(z)}
          y1="35"
          x2={sx(z)}
          y2="200"
          stroke="currentColor"
          strokeDasharray="3 3"
        />
        <SvgTex x={sx(-1.96) - 18} y={205} width={45} source="-1.96" />
        <SvgTex x={sx(1.96) - 15} y={205} width={45} source="1.96" />
        <SvgTex
          x={Math.max(55, Math.min(405, sx(z))) - 10}
          y={20}
          width={30}
          source="Z"
        />
      </svg>
      <div className="px-6 py-4 text-sm">
        <Tex
          source={String.raw`Z=\frac{\bar x-10}{2/\sqrt n}\approx${z.toFixed(3)}`}
        />
      </div>
    </DemoFrame>
  );
}
