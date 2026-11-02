"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import { bayesPosterior } from "./models";
import type { DemoComponentProps } from "./types";
export default function BayesDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [prior, setPrior] = useState(0.2),
    [givenA, setGivenA] = useState(0.8),
    [givenOther, setGivenOther] = useState(0.1);
  const percent = (value: number) =>
    format.number(value * 100, { maximumFractionDigits: 1 });
  const width = 360 * prior;
  const posterior = bayesPosterior(prior, givenA, givenOther)!;
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
            label={t.markdown("givenA")}
            value={givenA}
            display={`${percent(givenA)}%`}
            min={0.05}
            max={1}
            step={0.05}
            onChange={setGivenA}
          />
          <DemoRange
            label={t.markdown("givenOther")}
            value={givenOther}
            display={`${percent(givenOther)}%`}
            min={0}
            max={1}
            step={0.05}
            onChange={setGivenOther}
          />
        </>
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", { value: percent(posterior) })}
        />
      }
    >
      <svg
        viewBox="0 0 460 300"
        role="img"
        aria-label={t("diagram", { value: percent(posterior) })}
      >
        <rect
          x="50"
          y="25"
          width={width}
          height="220"
          fill="currentColor"
          opacity=".08"
        />
        <rect
          x={50 + width}
          y="25"
          width={360 - width}
          height="220"
          fill="currentColor"
          opacity=".03"
        />
        <rect
          x="50"
          y="25"
          width={width}
          height={givenA * 220}
          fill="currentColor"
          opacity=".65"
        />
        <rect
          x={50 + width}
          y="25"
          width={360 - width}
          height={givenOther * 220}
          fill="currentColor"
          opacity=".25"
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
        <SvgTex x={35 + width / 2} y={260} width={30} source="A" />
        <SvgTex
          x={50 + width + (360 - width) / 2 - 15}
          y={260}
          width={30}
          source={"\\bar A"}
        />
      </svg>
    </DemoFrame>
  );
}
