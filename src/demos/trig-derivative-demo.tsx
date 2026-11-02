"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

const left = 58;
const right = 416;
const top = 42;
const bottom = 252;
const sx = (radians: number) =>
  roundSvgNumber(left + (radians / (2 * Math.PI)) * (right - left));
const sy = (value: number) => roundSvgNumber((top + bottom) / 2 - value * 78);

export default function TrigDerivativeDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [degrees, setDegrees] = useState(45);
  const radians = (degrees * Math.PI) / 180;
  const sin = Math.sin(radians);
  const slope = Math.cos(radians);
  const curve = Array.from({ length: 121 }, (_, index) => {
    const x = (index / 120) * 2 * Math.PI;
    return `${index ? "L" : "M"}${sx(x)},${sy(Math.sin(x))}`;
  }).join(" ");
  const tangent = (offset: number) => ({
    x: sx(radians + offset),
    y: sy(sin + slope * offset),
  });
  const start = tangent(-0.8);
  const end = tangent(0.8);
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <DemoRange
          label={t.markdown("angleLabel")}
          value={degrees}
          display={`$${format.number(degrees)}^\\circ$`}
          min={0}
          max={360}
          step={1}
          onChange={setDegrees}
        />
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", {
            angle: format.number(degrees),
            sin: format.number(sin, { maximumFractionDigits: 3 }),
            cos: format.number(slope, { maximumFractionDigits: 3 }),
            slope: format.number(slope, { maximumFractionDigits: 3 }),
          })}
        />
      }
    >
      <svg
        viewBox="0 0 460 300"
        role="img"
        aria-label={t("diagram", { angle: degrees })}
      >
        <path
          d={`M${left} ${sy(0)}H${right}M${sx(0)} ${top}V${bottom}`}
          stroke="currentColor"
          strokeOpacity=".2"
        />
        <path d={curve} fill="none" stroke="currentColor" strokeWidth="2" />
        <path
          d={`M${start.x} ${start.y}L${end.x} ${end.y}`}
          stroke="currentColor"
          strokeDasharray="5 5"
          strokeOpacity=".7"
        />
        <circle cx={sx(radians)} cy={sy(sin)} r="5" fill="currentColor" />
        <SvgTex x={sx(Math.PI) - 12} y={sy(0) + 12} width={24} source="\pi" />
        <SvgTex
          x={right + 6}
          y={sy(0) + 10}
          width={34}
          height={22}
          source="2\pi"
        />
        <SvgTex
          x={right + 8}
          y={sy(0) - 26}
          width={18}
          height={22}
          source="x"
        />
        <SvgTex x={sx(0) + 5} y={top - 4} width={18} source="y" />
        <SvgTex x={sx(0) - 9} y={sy(0) + 12} width={18} source="0" />
      </svg>
    </DemoFrame>
  );
}
