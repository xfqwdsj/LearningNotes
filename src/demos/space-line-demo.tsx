"use client";

import { useId, useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

export default function SpaceLineDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const marker = useId();
  const [parameter, setParameter] = useState(0);
  const project = (x: number, y: number, z: number) =>
    [
      roundSvgNumber(235 + 36 * x - 18 * y),
      roundSvgNumber(230 + 10 * x - 29 * y - 29 * z),
    ] as const;
  const start = [0, 1, 3] as const;
  const point = [
    start[0] + 2 * parameter,
    start[1] - parameter,
    start[2] + parameter,
  ] as const;
  const clamp = (value: number) => Math.max(-3.2, Math.min(3.2, value));
  const lineStart = project(
    start[0] + 2 * clamp(-3.5 - parameter),
    start[1] - clamp(-3.5 - parameter),
    start[2] + clamp(-3.5 - parameter),
  );
  const lineEnd = project(
    start[0] + 2 * clamp(3.5 - parameter),
    start[1] - clamp(3.5 - parameter),
    start[2] + clamp(3.5 - parameter),
  );
  const current = project(point[0], point[1], point[2]);
  const anchor = project(start[0], start[1], start[2]);
  const number = (value: number) =>
    format.number(value, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 2,
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
          min={-3}
          max={3}
          step={0.1}
          onChange={setParameter}
        />
      }
      conclusion={<IcuMarkdownText value={t.markdown("result")} />}
    >
      <svg viewBox="0 0 500 320" role="img" aria-label={t("label")}>
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
        <line
          x1={lineStart[0]}
          y1={lineStart[1]}
          x2={lineEnd[0]}
          y2={lineEnd[1]}
          stroke="currentColor"
          strokeWidth="3"
          markerEnd={`url(#${marker})`}
        />
        <line
          x1={anchor[0]}
          y1={anchor[1]}
          x2={current[0]}
          y2={current[1]}
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="5 4"
        />
        <circle cx={anchor[0]} cy={anchor[1]} r="5" fill="currentColor" />
        <circle
          cx={current[0]}
          cy={current[1]}
          r="7"
          fill="var(--background)"
          stroke="currentColor"
          strokeWidth="2"
        />
        <SvgTex x={anchor[0] + 7} y={anchor[1] + 6} width={60} source="P_0" />
        <SvgTex
          x={current[0] + 7}
          y={current[1] - 18}
          width={42}
          source="P(t)"
        />
        <SvgTex x={24} y={22} width={120} source="(2,-1,1)" />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <p>
          <Tex
            source={String.raw`P(t)=(${number(point[0])},${number(point[1])},${number(point[2])})`}
          />
        </p>
      </div>
    </DemoFrame>
  );
}
