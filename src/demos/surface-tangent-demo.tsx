"use client";

import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

export default function SurfaceTangentDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [a, setA] = useState(1);
  const [b, setB] = useState(1);
  const z0 = a * a + b * b;
  const project = (x: number, y: number, z: number) =>
    [
      roundSvgNumber(250 + 50 * x - 28 * y),
      roundSvgNumber(220 + 16 * x - 34 * y - 19 * z),
    ] as const;
  const point = project(a, b, z0);
  const plane = [
    project(a - 1, b - 1, z0 - 2 * a - 2 * b),
    project(a + 1, b - 1, z0 + 2 * a - 2 * b),
    project(a + 1, b + 1, z0 + 2 * a + 2 * b),
    project(a - 1, b + 1, z0 - 2 * a + 2 * b),
  ];
  const grid = Array.from({ length: 9 }, (_, index) => -2 + (4 * index) / 8);
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
            label={t.markdown("a")}
            value={a}
            display={`$${number(a)}$`}
            min={-2}
            max={2}
            step={0.1}
            onChange={setA}
          />
          <DemoRange
            label={t.markdown("b")}
            value={b}
            display={`$${number(b)}$`}
            min={-2}
            max={2}
            step={0.1}
            onChange={setB}
          />
        </>
      }
      conclusion={<IcuMarkdownText value={t.markdown("result")} />}
    >
      <svg viewBox="0 0 500 330" role="img" aria-label={t("label")}>
        {grid.map((x) => {
          const start = project(x, -2, x * x + 4);
          const end = project(x, 2, x * x + 4);
          return (
            <line
              key={`x-${x}`}
              x1={start[0]}
              y1={start[1]}
              x2={end[0]}
              y2={end[1]}
              stroke="currentColor"
              strokeOpacity=".12"
            />
          );
        })}
        {grid.map((y) => {
          const start = project(-2, y, 4 + y * y);
          const end = project(2, y, 4 + y * y);
          return (
            <line
              key={`y-${y}`}
              x1={start[0]}
              y1={start[1]}
              x2={end[0]}
              y2={end[1]}
              stroke="currentColor"
              strokeOpacity=".12"
            />
          );
        })}
        <polygon
          points={plane.map((item) => item.join(",")).join(" ")}
          fill="currentColor"
          fillOpacity=".12"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx={point[0]} cy={point[1]} r="7" fill="currentColor" />
        <SvgTex
          x={point[0] + 8}
          y={point[1] - 18}
          width={88}
          source={String.raw`(a,b,z_0)`}
        />
        <SvgTex x={18} y={20} width={112} source="z=x^2+y^2" />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <p>
          <Tex
            source={String.raw`z_0=${number(z0)},\qquad z-z_0=${number(2 * a)}(x-a)+${number(2 * b)}(y-b)`}
          />
        </p>
      </div>
    </DemoFrame>
  );
}
