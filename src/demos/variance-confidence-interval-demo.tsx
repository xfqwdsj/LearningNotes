"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function VarianceConfidenceIntervalDemo(
  props: DemoComponentProps,
) {
  const { t } = useDemoContent(props);
  const [s, setS] = useState(4);
  const lo = (9 * s) / 19.023,
    hi = (9 * s) / 2.7,
    center = s;
  const scale = (v: number) => 45 + (370 * v) / 35;
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label={t.markdown("s")}
            value={s}
            display={s.toFixed(1)}
            min={0.5}
            max={10}
            step={0.5}
            onChange={setS}
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
          source={String.raw`\left[\frac{9s^2}{19.023},\frac{9s^2}{2.700}\right]`}
          display
        />
        <Tex source={String.raw`[${lo.toFixed(3)},${hi.toFixed(3)}]`} />
      </div>
    </DemoFrame>
  );
}
