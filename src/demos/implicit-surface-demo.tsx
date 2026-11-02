"use client";

import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

export default function ImplicitSurfaceDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [x, setX] = useState(0.3);
  const [y, setY] = useState(0.4);
  const z = Math.sqrt(1 - x * x - y * y);
  const project = (px: number, py: number, pz: number) =>
    [
      roundSvgNumber(250 + 88 * px - 30 * py),
      roundSvgNumber(220 + 20 * px - 42 * py - 44 * pz),
    ] as const;
  const point = project(x, y, z);
  const dxEnd = project(x + 0.28, y, z - (x / z) * 0.28);
  const dyEnd = project(x, y + 0.28, z - (y / z) * 0.28);
  const number = (value: number) =>
    format.number(value, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 3,
    });

  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label={t.markdown("x")}
            value={x}
            display={`$${number(x)}$`}
            min={-0.6}
            max={0.6}
            step={0.1}
            onChange={setX}
          />
          <DemoRange
            label={t.markdown("y")}
            value={y}
            display={`$${number(y)}$`}
            min={-0.6}
            max={0.6}
            step={0.1}
            onChange={setY}
          />
        </>
      }
      conclusion={<IcuMarkdownText value={t.markdown("result")} />}
    >
      <svg viewBox="0 0 500 315" role="img" aria-label={t("label")}>
        {[0.5, 0.8, 1].map((radius) => (
          <ellipse
            key={radius}
            cx="250"
            cy={220 - radius * 30}
            rx={radius * 88}
            ry={radius * 34}
            fill="none"
            stroke="currentColor"
            strokeOpacity=".13"
          />
        ))}
        <path
          d="M250 220C250 130 190 62 154 108C118 154 170 232 250 278C330 232 382 154 346 108C310 62 250 130 250 220"
          fill="currentColor"
          fillOpacity=".05"
          stroke="currentColor"
          strokeOpacity=".25"
        />
        <line
          x1={point[0]}
          y1={point[1]}
          x2={dxEnd[0]}
          y2={dxEnd[1]}
          stroke="currentColor"
          strokeWidth="2"
        />
        <line
          x1={point[0]}
          y1={point[1]}
          x2={dyEnd[0]}
          y2={dyEnd[1]}
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="5 4"
        />
        <circle cx={point[0]} cy={point[1]} r="7" fill="currentColor" />
        <SvgTex
          x={point[0] + 7}
          y={point[1] - 18}
          width={58}
          source="P(x,y,z)"
        />
        <SvgTex x={dxEnd[0] + 5} y={dxEnd[1] - 12} width={44} source="z_x" />
        <SvgTex x={dyEnd[0] + 5} y={dyEnd[1] - 12} width={44} source="z_y" />
        <SvgTex x={18} y={20} width={160} source="x^2+y^2+z^2=1" />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <p>
          <Tex
            source={String.raw`z=${number(z)},\qquad z_x=${number(-x / z)},\qquad z_y=${number(-y / z)}`}
          />
        </p>
      </div>
    </DemoFrame>
  );
}
