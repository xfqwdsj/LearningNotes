"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function PolarAreaDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [r, setR] = useState(1);
  const dr = 0.5,
    theta = Math.PI / 3,
    scale = 65;
  const point = (radius: number, angle: number) =>
    `${120 + scale * radius * Math.cos(angle)},${235 - scale * radius * Math.sin(angle)}`;
  const wedge = `M${point(r, 0)} L${point(r + dr, 0)} A${scale * (r + dr)} ${scale * (r + dr)} 0 0 0 ${point(r + dr, theta)} L${point(r, theta)} A${scale * r} ${scale * r} 0 0 1 ${point(r, 0)} Z`;
  const exact = (theta * ((r + dr) ** 2 - r * r)) / 2;
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <DemoRange
          label={t.markdown("radius")}
          value={r}
          display={r.toFixed(1)}
          min={0}
          max={3}
          step={0.1}
          onChange={setR}
        />
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", {
            area: exact.toFixed(3),
            approx: (r * dr * theta).toFixed(3),
          })}
        />
      }
    >
      <svg
        viewBox="0 0 460 280"
        role="img"
        aria-label={t("graphLabel", { r: r.toFixed(1) })}
      >
        <line
          x1="120"
          y1="235"
          x2="375"
          y2="235"
          stroke="currentColor"
          strokeOpacity=".3"
        />
        <line
          x1="120"
          y1="245"
          x2="120"
          y2="5"
          stroke="currentColor"
          strokeOpacity=".3"
        />
        <path
          d={wedge}
          fill="currentColor"
          fillOpacity=".3"
          stroke="currentColor"
          strokeWidth="2"
        />
        <line
          x1="120"
          y1="235"
          x2="347"
          y2="235"
          stroke="currentColor"
          strokeOpacity=".45"
        />
        <line
          x1="120"
          y1="235"
          x2="233.75"
          y2="38.0"
          stroke="currentColor"
          strokeOpacity=".45"
        />
        <SvgTex x={375} y={237} width={25} source="x" />
        <SvgTex x={98} y={5} width={25} source="y" />
        <SvgTex x={145} y={207} width={44} source={String.raw`\frac{\pi}{3}`} />
      </svg>
      <div className="px-6 py-4 text-sm">
        <Tex
          source={String.raw`\Delta A=\frac12\big((r+\Delta r)^2-r^2\big)\Delta\theta\approx r\,\Delta r\,\Delta\theta`}
          display
        />
      </div>
    </DemoFrame>
  );
}
