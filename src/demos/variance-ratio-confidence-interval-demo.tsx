"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function VarianceRatioConfidenceIntervalDemo(
  props: DemoComponentProps,
) {
  const { t } = useDemoContent(props);
  const [ratio, setRatio] = useState(1);
  const lo = ratio / 39,
    hi = ratio * 39,
    center = ratio;
  const scale = (v: number) =>
    45 + (370 * (Math.log10(v) + 3)) / (Math.log10(200) + 3);
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label={t.markdown("ratio")}
            value={ratio}
            display={ratio.toFixed(1)}
            min={0.1}
            max={3}
            step={0.1}
            onChange={setRatio}
          />
        </>
      }
      conclusion={<IcuMarkdownText value={t.raw("result") as string} />}
    >
      <svg
        viewBox="0 0 460 180"
        role="img"
        aria-label={t("graph", {
          lo: lo.toFixed(3),
          hi: hi.toFixed(3),
          center: center.toFixed(3),
        })}
      >
        <line
          x1="45"
          y1="110"
          x2="415"
          y2="110"
          stroke="currentColor"
          strokeOpacity=".3"
        />
        <line
          x1={scale(1)}
          y1="35"
          x2={scale(1)}
          y2="140"
          stroke="currentColor"
          strokeOpacity=".45"
          strokeDasharray="4 4"
        />
        <SvgTex x={scale(1) - 8} y={145} width={24} source="1" />
        <line
          x1={scale(lo)}
          y1="95"
          x2={scale(hi)}
          y2="95"
          stroke="currentColor"
          strokeWidth="5"
        />
        <circle cx={scale(lo)} cy="95" r="3" fill="currentColor" />
        <circle cx={scale(hi)} cy="95" r="3" fill="currentColor" />
        <circle cx={scale(center)} cy="95" r="5" fill="currentColor" />
      </svg>
      <div className="grid gap-2 px-6 pb-4 text-sm">
        <Tex
          source={String.raw`\left[\frac{s_1^2/s_2^2}{39},39\frac{s_1^2}{s_2^2}\right]`}
          display
        />
        <Tex source={String.raw`[${lo.toFixed(3)},${hi.toFixed(3)}]`} />
      </div>
    </DemoFrame>
  );
}
