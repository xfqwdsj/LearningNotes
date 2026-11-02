"use client";

import { useId, useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

export default function VectorAdditionDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const marker = useId();
  const [x, setX] = useState(1);
  const [y, setY] = useState(2);
  const sx = (value: number) => roundSvgNumber(220 + value * 46);
  const sy = (value: number) => roundSvgNumber(154 - value * 46);
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
            display={`$${x}$`}
            min={-3}
            max={3}
            onChange={setX}
          />
          <DemoRange
            label={t.markdown("y")}
            value={y}
            display={`$${y}$`}
            min={-3}
            max={3}
            onChange={setY}
          />
        </>
      }
      conclusion={<IcuMarkdownText value={t.markdown("result")} />}
    >
      <svg viewBox="0 0 460 300" role="img" aria-label={t("label")}>
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
        {[-3, -2, -1, 1, 2, 3].map((tick) => (
          <g key={tick}>
            <line
              x1={sx(tick)}
              y1="42"
              x2={sx(tick)}
              y2="266"
              stroke="currentColor"
              strokeOpacity=".08"
            />
            <line
              x1="82"
              y1={sy(tick)}
              x2="358"
              y2={sy(tick)}
              stroke="currentColor"
              strokeOpacity=".08"
            />
          </g>
        ))}
        <path
          d="M82 154H358M220 42V266"
          fill="none"
          stroke="currentColor"
          strokeOpacity=".3"
        />
        <polygon
          points={`220,154 ${sx(2)},${sy(1)} ${sx(2 + x)},${sy(1 + y)} ${sx(x)},${sy(y)}`}
          fill="currentColor"
          fillOpacity=".06"
        />
        <line
          x1="220"
          y1="154"
          x2={sx(2)}
          y2={sy(1)}
          stroke="currentColor"
          strokeWidth="2.5"
          markerEnd={arrow}
        />
        <line
          x1="220"
          y1="154"
          x2={sx(x)}
          y2={sy(y)}
          stroke="currentColor"
          strokeOpacity=".55"
          strokeWidth="2"
          strokeDasharray="5 4"
          markerEnd={arrow}
        />
        <line
          x1={sx(2)}
          y1={sy(1)}
          x2={sx(2 + x)}
          y2={sy(1 + y)}
          stroke="currentColor"
          strokeWidth="2"
          markerEnd={arrow}
        />
        <line
          x1="220"
          y1="154"
          x2={sx(2 + x)}
          y2={sy(1 + y)}
          stroke="currentColor"
          strokeWidth="3"
          markerEnd={arrow}
        />
        <circle cx="220" cy="154" r="4" fill="currentColor" />
        <SvgTex
          x={sx(1) - 4}
          y={sy(0.5) - 18}
          width={36}
          source={String.raw`\mathbf a`}
        />
        <SvgTex
          x={sx(x / 2) - 8}
          y={sy(y / 2) + 8}
          width={36}
          source={String.raw`\mathbf b`}
        />
        <SvgTex
          x={sx(1 + x / 2) - 10}
          y={sy(0.5 + y / 2) + 8}
          width={36}
          source={String.raw`\mathbf b`}
        />
        <SvgTex
          x={sx((2 + x) / 2) - 20}
          y={sy((1 + y) / 2) - 22}
          width={62}
          source={String.raw`\mathbf a+\mathbf b`}
        />
        <SvgTex x={352} y={132} width={28} source="x" />
        <SvgTex x={228} y={34} width={28} source="y" />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <p>
          <Tex
            source={String.raw`\mathbf a=(2,1),\quad\mathbf b=(${x},${y}),\quad\mathbf a+\mathbf b=(${2 + x},${1 + y})`}
          />
        </p>
      </div>
    </DemoFrame>
  );
}
