"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function RegressionSlopeInferenceDemo(
  props: DemoComponentProps,
) {
  const { t } = useDemoContent(props);
  const [estimate, setEstimate] = useState(0.5);
  const se = 1 / Math.sqrt(10),
    half = 2.228 * se,
    lo = estimate - half,
    hi = estimate + half;
  const x = (v: number) => 230 + 75 * v;
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <DemoRange
          label={t.markdown("slope")}
          value={estimate}
          display={estimate.toFixed(1)}
          min={-2}
          max={2}
          step={0.1}
          onChange={setEstimate}
        />
      }
      conclusion={
        <IcuMarkdownText
          value={t.raw(lo <= 0 && hi >= 0 ? "contains" : "excludes") as string}
        />
      }
    >
      <svg
        viewBox="0 0 460 180"
        role="img"
        aria-label={t("graph", { lo: lo.toFixed(2), hi: hi.toFixed(2) })}
      >
        <line
          x1="25"
          y1="105"
          x2="435"
          y2="105"
          stroke="currentColor"
          strokeOpacity=".3"
        />
        <line
          x1={x(0)}
          y1="25"
          x2={x(0)}
          y2="135"
          stroke="currentColor"
          strokeDasharray="4 4"
          strokeOpacity=".5"
        />
        <line
          x1={x(lo)}
          y1="90"
          x2={x(hi)}
          y2="90"
          stroke="currentColor"
          strokeWidth="5"
        />
        <circle cx={x(estimate)} cy="90" r="5" fill="currentColor" />
        <SvgTex x={x(0) - 9} y={140} width={25} source="0" />
      </svg>
      <div className="grid gap-2 px-6 pb-4 text-sm">
        <Tex source={String.raw`[${lo.toFixed(3)},${hi.toFixed(3)}]`} />
        <Tex
          source={String.raw`T=\frac{\hat\beta_1}{s/\sqrt{L_{xx}}}=${(estimate / se).toFixed(3)}`}
        />
      </div>
    </DemoFrame>
  );
}
