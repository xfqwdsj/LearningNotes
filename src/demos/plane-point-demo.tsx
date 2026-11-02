"use client";

import { useId, useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

export default function PlanePointDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const marker = useId();
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const z = 3 - 2 * x - y;
  const origin = [230, 228] as const;
  const project = (valueX: number, valueY: number, valueZ: number) =>
    [
      roundSvgNumber(origin[0] + valueX * 42 - valueY * 18),
      roundSvgNumber(origin[1] - valueX * 13 - valueY * 34 - valueZ * 26),
    ] as const;
  const point = project(x, y, z);
  const number = (value: number) => format.number(value);
  const arrow = `url(#${marker})`;

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
            min={-3}
            max={3}
            onChange={setX}
          />
          <DemoRange
            label={t.markdown("y")}
            value={y}
            display={`$${number(y)}$`}
            min={-3}
            max={3}
            onChange={setY}
          />
        </>
      }
      conclusion={<IcuMarkdownText value={t.markdown("result")} />}
    >
      <svg viewBox="0 0 500 310" role="img" aria-label={t("label")}>
        <defs>
          <marker
            id={marker}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M0 0L10 5L0 10Z" fill="currentColor" />
          </marker>
        </defs>
        <polygon
          points={[
            project(-3, -3, 12),
            project(3, -3, 0),
            project(3, 3, -6),
            project(-3, 3, 6),
          ]
            .map((p) => p.join(","))
            .join(" ")}
          fill="currentColor"
          fillOpacity=".08"
          stroke="currentColor"
          strokeOpacity=".5"
        />
        {[-2, 0, 2].map((tick) => (
          <g key={tick}>
            <line
              x1={project(tick, -3, 3)[0]}
              y1={project(tick, -3, 3)[1]}
              x2={project(tick, 3, -3)[0]}
              y2={project(tick, 3, -3)[1]}
              stroke="currentColor"
              strokeOpacity=".12"
            />
            <line
              x1={project(-3, tick, 9)[0]}
              y1={project(-3, tick, 9)[1]}
              x2={project(3, tick, -3)[0]}
              y2={project(3, tick, -3)[1]}
              stroke="currentColor"
              strokeOpacity=".12"
            />
          </g>
        ))}
        <line
          x1={origin[0]}
          y1={origin[1]}
          x2={project(4, 0, 0)[0]}
          y2={project(4, 0, 0)[1]}
          stroke="currentColor"
          markerEnd={arrow}
        />
        <line
          x1={origin[0]}
          y1={origin[1]}
          x2={project(0, 4, 0)[0]}
          y2={project(0, 4, 0)[1]}
          stroke="currentColor"
          markerEnd={arrow}
        />
        <line
          x1={origin[0]}
          y1={origin[1]}
          x2={project(0, 0, 4)[0]}
          y2={project(0, 0, 4)[1]}
          stroke="currentColor"
          markerEnd={arrow}
        />
        <circle cx={point[0]} cy={point[1]} r="7" fill="currentColor" />
        <SvgTex
          x={project(4, 0, 0)[0] + 4}
          y={project(4, 0, 0)[1] - 8}
          width={28}
          source="x"
        />
        <SvgTex
          x={project(0, 4, 0)[0] + 4}
          y={project(0, 4, 0)[1] - 12}
          width={28}
          source="y"
        />
        <SvgTex
          x={project(0, 0, 4)[0] - 8}
          y={project(0, 0, 4)[1] - 22}
          width={28}
          source="z"
        />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <p>
          <Tex
            source={String.raw`P=(${number(x)},${number(y)},${number(z)}),\qquad2x+y+z=3`}
          />
        </p>
      </div>
    </DemoFrame>
  );
}
