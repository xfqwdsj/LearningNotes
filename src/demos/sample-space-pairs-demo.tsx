"use client";

import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";

export default function SampleSpacePairsDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [first, setFirst] = useState(1);
  const [second, setSecond] = useState(1);
  const sum = first + second;
  const count = Math.min(sum - 1, 13 - sum);
  const cell = 45;
  const start = [125, 42] as const;

  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label={t.markdown("first")}
            value={first}
            display={`$${first}$`}
            min={1}
            max={6}
            onChange={setFirst}
          />
          <DemoRange
            label={t.markdown("second")}
            value={second}
            display={`$${second}$`}
            min={1}
            max={6}
            onChange={setSecond}
          />
        </>
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", { first, second, sum, count })}
        />
      }
    >
      <svg viewBox="0 0 500 345" role="img" aria-label={t("label")}>
        {Array.from({ length: 6 }, (_, column) => (
          <SvgTex
            key={`c-${column}`}
            x={start[0] + column * cell + 8}
            y={start[1] - 26}
            width={cell}
            source={String(column + 1)}
          />
        ))}
        {Array.from({ length: 6 }, (_, row) => (
          <SvgTex
            key={`r-${row}`}
            x={start[0] - 34}
            y={start[1] + row * cell + 8}
            width={cell}
            source={String(row + 1)}
          />
        ))}
        {Array.from({ length: 6 }, (_, row) => (
          <g key={row}>
            {Array.from({ length: 6 }, (_, column) => {
              const value = row + column + 2;
              const selected = row + 1 === first && column + 1 === second;
              return (
                <g key={column}>
                  <rect
                    x={start[0] + column * cell}
                    y={start[1] + row * cell}
                    width={cell - 2}
                    height={cell - 2}
                    rx="4"
                    fill="currentColor"
                    fillOpacity={selected ? 0.3 : value === sum ? 0.1 : 0.025}
                    stroke="currentColor"
                    strokeOpacity={selected ? 1 : 0.16}
                    strokeWidth={selected ? 2 : 1}
                  />
                  <SvgTex
                    x={start[0] + column * cell + 8}
                    y={start[1] + row * cell + 9}
                    width={cell - 12}
                    source={String(value)}
                  />
                </g>
              );
            })}
          </g>
        ))}
        <SvgTex x={start[0] + 116} y={11} width={52} source="\text{second}" />
        <SvgTex x={49} y={start[1] + 112} width={48} source="\text{first}" />
      </svg>
    </DemoFrame>
  );
}
