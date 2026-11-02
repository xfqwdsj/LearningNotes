"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function TripleSliceDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [z, setZ] = useState(0);
  const radius = Math.sqrt(1 - z * z);
  const cy = 135 - 90 * z;
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <DemoRange
          label={t.markdown("height")}
          value={z}
          display={z.toFixed(1)}
          min={-1}
          max={1}
          step={0.1}
          onChange={setZ}
        />
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", {
            area: (Math.PI * radius * radius).toFixed(3),
          })}
        />
      }
    >
      <svg
        viewBox="0 0 460 275"
        role="img"
        aria-label={t("graph", { z: z.toFixed(1), radius: radius.toFixed(2) })}
      >
        <circle cx="230" cy="135" r="90" fill="currentColor" opacity=".08" />
        <circle
          cx="230"
          cy="135"
          r="90"
          fill="none"
          stroke="currentColor"
          opacity=".45"
        />
        <line
          x1="230"
          y1="25"
          x2="230"
          y2="245"
          stroke="currentColor"
          opacity=".3"
        />
        <ellipse
          cx="230"
          cy={cy}
          rx={90 * radius}
          ry={24 * radius}
          fill="currentColor"
          fillOpacity=".3"
          stroke="currentColor"
          strokeWidth="2"
        />
        <SvgTex
          x={238}
          y={cy - 25}
          width={90}
          source={String.raw`z=${z.toFixed(1)}`}
        />
        <SvgTex x={235} y={15} width={24} source="z" />
      </svg>
      <div className="px-6 py-4 text-sm">
        <Tex source={String.raw`A(z)=\pi(1-z^2)`} />
      </div>
    </DemoFrame>
  );
}
