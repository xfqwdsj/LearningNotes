"use client";
import { useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
function samplePath(initialSeed: number) {
  let seed = initialSeed;
  let sum = 0;
  const values: number[] = [];
  for (let i = 0; i < 500; i++) {
    seed = (seed * 16807) % 2147483647;
    sum += seed / 2147483647 < 0.5 ? 1 : 0;
    values.push(sum);
  }
  return values;
}
export default function LargeNumbersDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [n, setN] = useState(100);
  const [seed, setSeed] = useState(7129);
  const values = useMemo(() => samplePath(seed), [seed]);
  const points = values
    .slice(0, n)
    .map((sum, i) => `${40 + (380 * i) / 499},${215 - (180 * sum) / (i + 1)}`)
    .join(" ");
  const frequency = values[n - 1]! / n;
  const num = (v: number) => format.number(v, { maximumFractionDigits: 3 });
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label={t.markdown("trials")}
            value={n}
            display={String(n)}
            min={10}
            max={500}
            step={10}
            onChange={setN}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setSeed(Math.floor(Math.random() * 2147483646) + 1)}
          >
            <RefreshCw />
            <IcuMarkdownText value={t.markdown("refresh")} />
          </Button>
        </>
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", { n, value: num(frequency) })}
        />
      }
    >
      <svg
        viewBox="0 0 460 260"
        role="img"
        aria-label={t("diagram", { value: num(frequency) })}
      >
        <line
          x1="40"
          y1="125"
          x2="420"
          y2="125"
          stroke="currentColor"
          strokeDasharray="5 5"
          opacity=".4"
        />
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M40 35 V215 H420"
          fill="none"
          stroke="currentColor"
          opacity=".3"
        />
        <SvgTex x={5} y={25} width={25} source="1" />
        <SvgTex x={2} y={115} width={35} source="1/2" />
        <SvgTex x={5} y={205} width={25} source="0" />
        <SvgTex x={385} y={220} width={45} source="500" />
      </svg>
    </DemoFrame>
  );
}
