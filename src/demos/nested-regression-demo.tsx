"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function NestedRegressionDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [gain, setGain] = useState(3);
  const sse = 9,
    restricted = sse + gain;
  const width = (v: number) => v * 15;
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <DemoRange
          label={t.markdown("gain")}
          value={gain}
          display={gain.toFixed(1)}
          min={0}
          max={12}
          step={0.5}
          onChange={setGain}
        />
      }
      conclusion={
        <IcuMarkdownText value={t.markdown("result", { f: gain.toFixed(1) })} />
      }
    >
      <svg
        viewBox="0 0 460 175"
        role="img"
        aria-label={t("graph", {
          restricted: restricted.toFixed(1),
          full: sse,
        })}
      >
        <line
          x1="95"
          y1="135"
          x2="425"
          y2="135"
          stroke="currentColor"
          strokeOpacity=".3"
        />
        <rect
          x="95"
          y="38"
          width={width(restricted)}
          height="28"
          fill="currentColor"
          fillOpacity=".35"
        />
        <rect
          x="95"
          y="88"
          width={width(sse)}
          height="28"
          fill="currentColor"
          fillOpacity=".6"
        />
        <SvgTex x={16} y={42} width={75} source={String.raw`SSE_R`} />
        <SvgTex x={16} y={92} width={75} source={String.raw`SSE_F`} />
      </svg>
      <div className="px-6 py-4 text-sm">
        <Tex
          source={String.raw`F=\frac{(SSE_R-SSE_F)/1}{SSE_F/9}=${gain.toFixed(1)}`}
          display
        />
      </div>
    </DemoFrame>
  );
}
