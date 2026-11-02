"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function MultipleRegressionPredictionDemo(
  props: DemoComponentProps,
) {
  const { t } = useDemoContent(props);
  const [h, setH] = useState(0.5);
  const mean = 2.262 * Math.sqrt(h),
    prediction = 2.262 * Math.sqrt(1 + h);
  const sx = (v: number) => 230 + v * 36;
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <DemoRange
          label={t.markdown("leverage")}
          value={h}
          display={h.toFixed(1)}
          min={0.1}
          max={3}
          step={0.1}
          onChange={setH}
        />
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", {
            mean: mean.toFixed(3),
            prediction: prediction.toFixed(3),
          })}
        />
      }
    >
      <svg
        viewBox="0 0 460 190"
        role="img"
        aria-label={t("graph", {
          mean: mean.toFixed(3),
          prediction: prediction.toFixed(3),
        })}
      >
        <line
          x1="40"
          y1="145"
          x2="420"
          y2="145"
          stroke="currentColor"
          strokeOpacity=".3"
        />
        <line
          x1="230"
          y1="20"
          x2="230"
          y2="145"
          stroke="currentColor"
          strokeOpacity=".4"
          strokeDasharray="4 4"
        />
        <line
          x1={sx(-mean)}
          y1="65"
          x2={sx(mean)}
          y2="65"
          stroke="currentColor"
          strokeWidth="4"
        />
        <line
          x1={sx(-prediction)}
          y1="110"
          x2={sx(prediction)}
          y2="110"
          stroke="currentColor"
          strokeOpacity=".5"
          strokeWidth="4"
          strokeDasharray="6 4"
        />
        <circle cx="230" cy="65" r="4" fill="currentColor" />
        <circle cx="230" cy="110" r="4" fill="currentColor" />
        <SvgTex x={12} y={55} width={35} source={String.raw`\mu`} />
        <SvgTex x={12} y={100} width={35} source={String.raw`Y_0`} />
        <SvgTex x={222} y={150} width={30} source="0" />
      </svg>
      <div className="px-6 py-4 text-sm">
        <Tex
          source={String.raw`d_\mu=2.262\sqrt h,\quad d_{\mathrm{pred}}=2.262\sqrt{1+h}`}
        />
      </div>
    </DemoFrame>
  );
}
