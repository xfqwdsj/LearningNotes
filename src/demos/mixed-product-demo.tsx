"use client";

import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

export default function MixedProductDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [height, setHeight] = useState(1);
  const project = (x: number, y: number, z: number) =>
    [
      roundSvgNumber(220 + 64 * x - 38 * y),
      roundSvgNumber(225 + 18 * x - 38 * y - 44 * z),
    ] as const;
  const p000 = project(0, 0, 0);
  const p100 = project(1, 0, 0);
  const p010 = project(0, 1, 0);
  const p110 = project(1, 1, 0);
  const p001 = project(0, 0, height);
  const p101 = project(1, 0, height);
  const p011 = project(0, 1, height);
  const p111 = project(1, 1, height);
  const edges = [
    [p000, p001],
    [p100, p101],
    [p010, p011],
    [p110, p111],
  ] as const;
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
          label={t.markdown("height")}
          value={height}
          display={`$${number(height)}$`}
          min={-3}
          max={3}
          step={0.1}
          onChange={setHeight}
        />
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown(
            height === 0 ? "flat" : height > 0 ? "positive" : "negative",
          )}
        />
      }
    >
      <svg viewBox="0 0 500 330" role="img" aria-label={t("label")}>
        <polygon
          points={[p000, p100, p110, p010]
            .map((point) => point.join(","))
            .join(" ")}
          fill="currentColor"
          fillOpacity=".08"
          stroke="currentColor"
          strokeOpacity=".45"
        />
        <polygon
          points={[p000, p100, p101, p001]
            .map((point) => point.join(","))
            .join(" ")}
          fill="currentColor"
          fillOpacity=".14"
          stroke="currentColor"
          strokeWidth="2"
        />
        <polygon
          points={[p000, p010, p011, p001]
            .map((point) => point.join(","))
            .join(" ")}
          fill="currentColor"
          fillOpacity=".1"
          stroke="currentColor"
          strokeWidth="2"
        />
        {edges.map(([start, end], index) => (
          <line
            key={index}
            x1={start[0]}
            y1={start[1]}
            x2={end[0]}
            y2={end[1]}
            stroke="currentColor"
            strokeWidth="2"
          />
        ))}
        <SvgTex x={p100[0] + 5} y={p100[1] + 5} width={30} source="\mathbf a" />
        <SvgTex x={p010[0] + 5} y={p010[1] + 8} width={30} source="\mathbf b" />
        <SvgTex
          x={p001[0] + 5}
          y={p001[1] - 12}
          width={30}
          source="\mathbf c"
        />
        <SvgTex x={20} y={20} width={156} source="V=|\det(a,b,c)|" />
        <SvgTex
          x={320}
          y={286}
          width={150}
          source={String.raw`|\mathbf c\cdot(\mathbf a\times\mathbf b)|=${number(Math.abs(height))}`}
        />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <p>
          <Tex
            source={String.raw`(\mathbf a\times\mathbf b)\cdot\mathbf c=${number(height)}`}
          />
        </p>
      </div>
    </DemoFrame>
  );
}
