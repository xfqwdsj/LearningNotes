"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function CorrelationCurveDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [a, setA] = useState(0);
  const rho = (2 * a) / Math.sqrt(2 * (2.8 + 2 * a * a));
  const num = (v: number) => format.number(v, { maximumFractionDigits: 3 });
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <DemoRange
          label={t.markdown("slope")}
          value={a}
          display={num(a)}
          min={-3}
          max={3}
          step={0.25}
          onChange={setA}
        />
      }
      conclusion={
        <IcuMarkdownText value={t.markdown("result", { rho: num(rho) })} />
      }
    >
      <svg
        viewBox="0 0 460 270"
        role="img"
        aria-label={t("diagram", { rho: num(rho) })}
      >
        <path
          d="M50 180 H410 M230 25 V245"
          fill="none"
          stroke="currentColor"
          opacity=".3"
        />
        {[-2, -1, 0, 1, 2].map((x) => (
          <circle
            key={x}
            cx={230 + 70 * x}
            cy={180 - 10 * (x * x + a * x)}
            r="7"
            fill="currentColor"
          />
        ))}
        <SvgTex x={412} y={180} width={25} source="x" />
        <SvgTex x={235} y={10} width={25} source="y" />
      </svg>
    </DemoFrame>
  );
}
