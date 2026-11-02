"use client";

import { useId, useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

export default function CurveTangentDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const marker = useId();
  const [parameter, setParameter] = useState(1);
  const project = (x: number, y: number, z: number) =>
    [
      roundSvgNumber(250 + 66 * x - 30 * y),
      roundSvgNumber(190 + 18 * x - 33 * y - 23 * z),
    ] as const;
  const current = project(parameter, parameter ** 2, parameter ** 3);
  const derivative = [1, 2 * parameter, 3 * parameter ** 2] as const;
  const length = Math.hypot(...derivative);
  const tangentEnd = project(
    parameter + (0.9 * derivative[0]) / length,
    parameter ** 2 + (0.9 * derivative[1]) / length,
    parameter ** 3 + (0.9 * derivative[2]) / length,
  );
  const curve = Array.from({ length: 121 }, (_, index) => {
    const value = -1.4 + (2.8 * index) / 120;
    return project(value, value * value, value ** 3);
  })
    .map((point, index) => `${index === 0 ? "M" : "L"}${point[0]} ${point[1]}`)
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
          value={parameter}
          display={`$${number(parameter)}$`}
          min={-1.4}
          max={1.4}
          step={0.1}
          onChange={setParameter}
        />
      }
      conclusion={<IcuMarkdownText value={t.markdown("result")} />}
    >
      <svg viewBox="0 0 500 325" role="img" aria-label={t("label")}>
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
          x1={current[0]}
          y1={current[1]}
          x2={tangentEnd[0]}
          y2={tangentEnd[1]}
          stroke="currentColor"
          strokeWidth="2.5"
          markerEnd={`url(#${marker})`}
        />
        <circle cx={current[0]} cy={current[1]} r="6" fill="currentColor" />
        <SvgTex
          x={current[0] + 8}
          y={current[1] - 20}
          width={54}
          source="\mathbf r(t)"
        />
        <SvgTex
          x={tangentEnd[0] + 8}
          y={tangentEnd[1] - 20}
          width={72}
          source="\mathbf r'(t)"
        />
        <SvgTex x={18} y={20} width={132} source="(t,t^2,t^3)" />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <p>
          <Tex
            source={String.raw`\mathbf r'(${number(parameter)})≈(1,${number(2 * parameter)},${number(3 * parameter ** 2)})`}
          />
        </p>
      </div>
    </DemoFrame>
  );
}
