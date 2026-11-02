"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
function choose(n: number, k: number) {
  if (k < 0 || k > n) return 0;
  let result = 1;
  for (let i = 1; i <= Math.min(k, n - k); i++)
    result = (result * (n - i + 1)) / i;
  return result;
}
export default function HypergeometricDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [target, setTarget] = useState(3),
    [draw, setDraw] = useState(4),
    [count, setCount] = useState(1);
  const n = 10,
    total = choose(n, draw),
    favorable = choose(target, count) * choose(n - target, draw - count),
    value = favorable / total;
  const result = format.number(value, { maximumFractionDigits: 3 });
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label={t.markdown("target")}
            value={target}
            display={String(target)}
            min={0}
            max={10}
            onChange={setTarget}
          />
          <DemoRange
            label={t.markdown("draw")}
            value={draw}
            display={String(draw)}
            min={0}
            max={10}
            onChange={setDraw}
          />
          <DemoRange
            label={t.markdown("count")}
            value={count}
            display={String(count)}
            min={0}
            max={10}
            onChange={setCount}
          />
        </>
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", { favorable, total, result })}
        />
      }
    >
      <svg
        viewBox="0 0 460 110"
        role="img"
        aria-label={t("diagram", { result })}
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
