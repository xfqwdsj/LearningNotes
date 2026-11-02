"use client";

import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

export default function RevolutionSurfaceDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [r, setR] = useState(1);
  const [angle, setAngle] = useState(45);
  const radians = (angle * Math.PI) / 180;
  const project = (radius: number, theta: number) =>
    [
      roundSvgNumber(250 + radius * Math.cos(theta) * 92),
      roundSvgNumber(
        230 - radius * radius * 45 - radius * Math.sin(theta) * 30,
      ),
    ] as const;
  const ring = (radius: number) =>
    Array.from({ length: 97 }, (_, index) => {
      const theta = (2 * Math.PI * index) / 96;
      const [x, y] = project(radius, theta);
      return `${index === 0 ? "M" : "L"}${x} ${y}`;
    }).join("");
  const profile = Array.from({ length: 61 }, (_, index) => {
    const radius = (2 * index) / 60;
    const [x, y] = project(radius, 0);
    return `${index === 0 ? "M" : "L"}${x} ${y}`;
  }).join("");
  const current = project(r, radians);
  const number = (value: number) =>
    format.number(value, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label={t.markdown("r")}
            value={r}
            display={`$${number(r)}$`}
            min={0}
            max={2}
            step={0.1}
            onChange={setR}
          />
          <DemoRange
            label={t.markdown("angle")}
            value={angle}
            display={`$${angle}^{\\circ}$`}
            min={0}
            max={360}
            step={15}
            onChange={setAngle}
          />
        </>
      }
      conclusion={<IcuMarkdownText value={t.markdown("result")} />}
    >
      <svg viewBox="0 0 500 310" role="img" aria-label={t("label")}>
        {[0.5, 1, 1.5, 2].map((radius) => (
          <path
            key={radius}
            d={ring(radius)}
            fill="none"
            stroke="currentColor"
            strokeOpacity=".18"
          />
        ))}
        <path d={profile} fill="none" stroke="currentColor" strokeWidth="2.5" />
        <circle cx={current[0]} cy={current[1]} r="7" fill="currentColor" />
        <line
          x1="250"
          y1="230"
          x2={current[0]}
          y2={current[1]}
          stroke="currentColor"
          strokeDasharray="4 4"
        />
        <SvgTex x={current[0] + 8} y={current[1] - 16} width={42} source="P" />
        <SvgTex x={18} y={20} width={92} source="z=x^2+y^2" />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <p>
          <Tex
            source={String.raw`(x,y,z)\approx(${number(r * Math.cos(radians))},${number(r * Math.sin(radians))},${number(r * r)})`}
          />
        </p>
      </div>
    </DemoFrame>
  );
}
