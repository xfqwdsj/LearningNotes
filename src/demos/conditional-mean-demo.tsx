"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function ConditionalMeanDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [weight, setWeight] = useState(0.4),
    [first, setFirst] = useState(3),
    [second, setSecond] = useState(5);
  const mean = weight * first + (1 - weight) * second;
  const num = (v: number) => format.number(v, { maximumFractionDigits: 2 });
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label={t.markdown("weight")}
            value={weight}
            display={num(weight)}
            min={0.05}
            max={0.95}
            step={0.05}
            onChange={setWeight}
          />
          <DemoRange
            label={t.markdown("first")}
            value={first}
            display={num(first)}
            min={0}
            max={10}
            onChange={setFirst}
          />
          <DemoRange
            label={t.markdown("second")}
            value={second}
            display={num(second)}
            min={0}
            max={10}
            onChange={setSecond}
          />
        </>
      }
      conclusion={
        <IcuMarkdownText value={t.markdown("result", { mean: num(mean) })} />
      }
    >
      <svg
        viewBox="0 0 460 130"
        role="img"
        aria-label={t("diagram", { mean: num(mean) })}
      >
        <line
          x1="50"
          y1="60"
          x2="410"
          y2="60"
          stroke="currentColor"
          opacity=".35"
        />
        <circle
          cx={50 + 36 * first}
          cy="60"
          r="7"
          fill="currentColor"
          opacity=".4"
        />
        <circle
          cx={50 + 36 * second}
          cy="60"
          r="7"
          fill="currentColor"
          opacity=".4"
        />
        <circle cx={50 + 36 * mean} cy="60" r="9" fill="currentColor" />
        <SvgTex x={40} y={75} width={25} source="0" />
        <SvgTex x={395} y={75} width={35} source="10" />
      </svg>
    </DemoFrame>
  );
}
