"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function UniformScaleDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [start, setStart] = useState(2),
    [width, setWidth] = useState(4),
    [fraction, setFraction] = useState(0.5);
  const num = (v: number) => format.number(v, { maximumFractionDigits: 2 });
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label={t.markdown("start")}
            value={start}
            display={num(start)}
            min={-4}
            max={4}
            onChange={setStart}
          />
          <DemoRange
            label={t.markdown("width")}
            value={width}
            display={num(width)}
            min={1}
            max={8}
            onChange={setWidth}
          />
          <DemoRange
            label={t.markdown("fraction")}
            value={fraction}
            display={num(fraction)}
            min={0}
            max={1}
            step={0.05}
            onChange={setFraction}
          />
        </>
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", {
            start: num(start),
            end: num(start + width),
            x: num(start + width * fraction),
            probability: num(fraction),
          })}
        />
      }
    >
      <svg
        viewBox="0 0 460 130"
        role="img"
        aria-label={t("diagram", { probability: num(fraction) })}
      >
        <line
          x1="50"
          y1="60"
          x2="410"
          y2="60"
          stroke="currentColor"
          strokeWidth="7"
          opacity=".15"
        />
        <line
          x1="50"
          y1="60"
          x2={50 + 360 * fraction}
          y2="60"
          stroke="currentColor"
          strokeWidth="7"
        />
        <circle cx={50 + 360 * fraction} cy="60" r="6" fill="currentColor" />
        <SvgTex x={40} y={75} width={25} source="a" />
        <SvgTex x={400} y={75} width={25} source="b" />
      </svg>
    </DemoFrame>
  );
}
