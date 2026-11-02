"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function TotalProbabilityDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [prior, setPrior] = useState(0.6);
  const [first, setFirst] = useState(0.2);
  const [second, setSecond] = useState(0.5);
  const percent = (v: number) =>
    format.number(100 * v, { maximumFractionDigits: 1 });
  const total = prior * first + (1 - prior) * second;
  const width = 360 * prior;
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label={t.markdown("prior")}
            value={prior}
            display={`${percent(prior)}%`}
            min={0.05}
            max={0.95}
            step={0.05}
            onChange={setPrior}
          />
          <DemoRange
            label={t.markdown("first")}
            value={first}
            display={`${percent(first)}%`}
            min={0}
            max={1}
            step={0.05}
            onChange={setFirst}
          />
          <DemoRange
            label={t.markdown("second")}
            value={second}
            display={`${percent(second)}%`}
            min={0}
            max={1}
            step={0.05}
            onChange={setSecond}
          />
        </>
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", {
            value: percent(total),
            first: percent(prior * first),
            second: percent((1 - prior) * second),
          })}
        />
      }
    >
      <svg
        viewBox="0 0 460 300"
        role="img"
        aria-label={t("diagram", { value: percent(total) })}
      >
        <rect
          x="50"
          y="25"
          width="360"
          height="220"
          fill="currentColor"
          opacity=".07"
        />
        <rect
          x="50"
          y="25"
          width={width}
          height={first * 220}
          fill="currentColor"
          opacity=".7"
        />
        <rect
          x={50 + width}
          y="25"
          width={360 - width}
          height={second * 220}
          fill="currentColor"
          opacity=".4"
        />
        <rect
          x="50"
          y="25"
          width="360"
          height="220"
          fill="none"
          stroke="currentColor"
          opacity=".3"
        />
        <line
          x1={50 + width}
          x2={50 + width}
          y1="25"
          y2="245"
          stroke="currentColor"
          opacity=".3"
        />
        <SvgTex x={35 + width / 2} y={260} width={30} source="B_1" />
        <SvgTex
          x={35 + width + (360 - width) / 2}
          y={260}
          width={30}
          source="B_2"
        />
      </svg>
    </DemoFrame>
  );
}
