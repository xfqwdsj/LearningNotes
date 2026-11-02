"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function VarianceShiftDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [center, setCenter] = useState(0),
    [distance, setDistance] = useState(2);
  const num = (v: number) => format.number(v, { maximumFractionDigits: 2 });
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label={t.markdown("center")}
            value={center}
            display={num(center)}
            min={-3}
            max={3}
            step={0.5}
            onChange={setCenter}
          />
          <DemoRange
            label={t.markdown("distance")}
            value={distance}
            display={num(distance)}
            min={0}
            max={3}
            step={0.5}
            onChange={setDistance}
          />
        </>
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", {
            center: num(center),
            variance: num(distance * distance),
          })}
        />
      }
    >
      <svg
        viewBox="0 0 460 130"
        role="img"
        aria-label={t("diagram", { variance: num(distance * distance) })}
      >
        <line
          x1="50"
          y1="60"
          x2="410"
          y2="60"
          stroke="currentColor"
          opacity=".3"
        />
        <circle
          cx={230 + 30 * (center - distance)}
          cy="60"
          r="7"
          fill="currentColor"
          opacity=".5"
        />
        <circle
          cx={230 + 30 * (center + distance)}
          cy="60"
          r="7"
          fill="currentColor"
          opacity=".5"
        />
        <circle cx={230 + 30 * center} cy="60" r="5" fill="currentColor" />
        <SvgTex x={37} y={78} width={35} source="-6" />
        <SvgTex x={397} y={78} width={25} source="6" />
      </svg>
    </DemoFrame>
  );
}
