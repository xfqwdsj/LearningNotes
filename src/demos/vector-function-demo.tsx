"use client";

import { useId, useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

export default function VectorFunctionDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const marker = useId();
  const [angle, setAngle] = useState(90);
  const parameter = (angle * Math.PI) / 180;
  const project = (x: number, y: number, z: number) =>
    [
      roundSvgNumber(250 + 92 * x - 32 * y),
      roundSvgNumber(220 + 22 * x - 42 * y - 28 * z),
    ] as const;
  const point = project(Math.cos(parameter), Math.sin(parameter), parameter);
  const derivative = [-Math.sin(parameter), Math.cos(parameter), 1] as const;
  const tangentEnd = project(
    Math.cos(parameter) + 0.75 * derivative[0],
    Math.sin(parameter) + 0.75 * derivative[1],
    parameter + 0.75,
  );
  const curve = Array.from({ length: 145 }, (_, index) => {
    const value = (2 * Math.PI * index) / 144;
    return project(Math.cos(value), Math.sin(value), value);
  })
    .map(
      (screen, index) => `${index === 0 ? "M" : "L"}${screen[0]} ${screen[1]}`,
    )
    .join("");
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
        <DemoRange
          label={t.markdown("parameter")}
          value={angle}
          display={`$${angle}^{\\circ}$`}
          min={0}
          max={360}
          step={15}
          onChange={setAngle}
        />
      }
      conclusion={<IcuMarkdownText value={t.markdown("result")} />}
    >
      <svg viewBox="0 0 500 330" role="img" aria-label={t("label")}>
        <defs>
          <marker
            id={marker}
            viewBox="0 0 8 8"
            refX="7"
            refY="4"
            markerWidth="8"
            markerHeight="8"
            markerUnits="userSpaceOnUse"
            orient="auto-start-reverse"
          >
            <path d="M0 0L8 4L0 8Z" fill="currentColor" />
          </marker>
        </defs>
        <path d={curve} fill="none" stroke="currentColor" strokeWidth="2.75" />
        <line
          x1={point[0]}
          y1={point[1]}
          x2={tangentEnd[0]}
          y2={tangentEnd[1]}
          stroke="currentColor"
          strokeWidth="2.5"
          markerEnd={`url(#${marker})`}
        />
        <circle cx={point[0]} cy={point[1]} r="7" fill="currentColor" />
        <SvgTex
          x={point[0] + 8}
          y={point[1] - 20}
          width={54}
          source="\mathbf r(t)"
        />
        <SvgTex
          x={tangentEnd[0] + 8}
          y={tangentEnd[1] - 20}
          width={72}
          source="\mathbf r'(t)"
        />
        <SvgTex x={18} y={20} width={172} source="(\cos t,\sin t,t)" />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <p>
          <Tex
            source={String.raw`\mathbf r'(${number(parameter)})≈(${number(-Math.sin(parameter))},${number(Math.cos(parameter))},1)`}
          />
        </p>
      </div>
    </DemoFrame>
  );
}
