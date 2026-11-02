"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function PoissonCountDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [rate, setRate] = useState(2);
  const [count, setCount] = useState(2);
  let value = Math.exp(-rate);
  for (let i = 1; i <= count; i++) value *= rate / i;
  const num = (x: number) => format.number(x, { maximumFractionDigits: 3 });
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label={t.markdown("rate")}
            value={rate}
            display={num(rate)}
            min={0.5}
            max={8}
            step={0.5}
            onChange={setRate}
          />
          <DemoRange
            label={t.markdown("count")}
            value={count}
            display={String(count)}
            min={0}
            max={15}
            onChange={setCount}
          />
        </>
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", { count, value: num(value) })}
        />
      }
    >
      <svg
        viewBox="0 0 460 110"
        role="img"
        aria-label={t("diagram", { value: num(value) })}
      >
        <rect
          x="50"
          y="30"
          width="360"
          height="30"
          fill="currentColor"
          opacity=".1"
        />
        <rect
          x="50"
          y="30"
          width={360 * value}
          height="30"
          fill="currentColor"
          opacity=".7"
        />
        <SvgTex x={45} y={70} width={25} source="0" />
        <SvgTex x={400} y={70} width={25} source="1" />
      </svg>
    </DemoFrame>
  );
}
