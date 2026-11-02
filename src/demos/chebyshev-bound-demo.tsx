"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function ChebyshevBoundDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [epsilon, setEpsilon] = useState(0.75);
  const actual = epsilon <= 0.5 ? 1 : 0,
    bound = Math.min(1, 0.25 / (epsilon * epsilon));
  const num = (v: number) => format.number(v, { maximumFractionDigits: 3 });
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <DemoRange
          label={t.markdown("epsilon")}
          value={epsilon}
          display={num(epsilon)}
          min={0.1}
          max={1.5}
          step={0.05}
          onChange={setEpsilon}
        />
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", {
            actual: num(actual),
            bound: num(bound),
          })}
        />
      }
    >
      <svg
        viewBox="0 0 460 150"
        role="img"
        aria-label={t("diagram", { actual: num(actual), bound: num(bound) })}
      >
        <rect
          x="80"
          y="25"
          width="330"
          height="25"
          fill="currentColor"
          opacity=".1"
        />
        <rect
          x="80"
          y="25"
          width={330 * actual}
          height="25"
          fill="currentColor"
          opacity=".7"
        />
        <rect
          x="80"
          y="85"
          width="330"
          height="25"
          fill="currentColor"
          opacity=".1"
        />
        <rect
          x="80"
          y="85"
          width={330 * bound}
          height="25"
          fill="currentColor"
          opacity=".45"
        />
        <SvgTex x={10} y={25} width={65} source="P" />
        <SvgTex x={10} y={85} width={65} source="\\min(1,B)" />
      </svg>
    </DemoFrame>
  );
}
