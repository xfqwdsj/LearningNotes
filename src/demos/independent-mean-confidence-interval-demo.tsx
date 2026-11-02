"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function IndependentMeanConfidenceIntervalDemo(
  props: DemoComponentProps,
) {
  const { t } = useDemoContent(props);
  const [difference, setDifference] = useState(1);
  const [n, setN] = useState(10);
  const half = 1.96 * Math.sqrt(13 / n);
  const lo = difference - half,
    hi = difference + half,
    center = difference;
  const scale = (v: number) => 45 + (370 * (v + 10)) / 20;
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label={t.markdown("difference")}
            value={difference}
            display={difference.toFixed(1)}
            min={-4}
            max={4}
            step={0.5}
            onChange={setDifference}
          />
          <DemoRange
            label={t.markdown("n")}
            value={n}
            display={String(n)}
            min={2}
            max={100}
            onChange={setN}
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
          x1={scale(0)}
          y1="35"
          x2={scale(0)}
          y2="140"
          stroke="currentColor"
          strokeOpacity=".45"
          strokeDasharray="4 4"
        />
        <SvgTex x={scale(0) - 8} y={145} width={24} source="0" />
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
        <Tex source={String.raw`(\bar X-\bar Y)\pm1.96\sqrt{13/n}`} />
        <Tex source={String.raw`[${lo.toFixed(3)},${hi.toFixed(3)}]`} />
      </div>
    </DemoFrame>
  );
}
