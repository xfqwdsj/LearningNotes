"use client";

import { useId, useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import { roundSvgNumber } from "./svg";
import type { DemoComponentProps } from "./types";

export default function GreenCirculationDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const marker = useId();
  const [r, setR] = useState(1);
  const area = Math.PI * r * r;
  const radius = r * 43;
  const arrow = `url(#${marker})`;
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
          label={t.markdown("r")}
          value={r}
          display={`$${number(r)}$`}
          min={0.5}
          max={3}
          step={0.1}
          onChange={setR}
        />
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", { value: number(2 * area) })}
        />
      }
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
            orient="auto"
          >
            <path d="M0 0L10 5L0 10Z" fill="currentColor" />
          </marker>
        </defs>
        <circle
          cx="250"
          cy="155"
          r={radius}
          fill="currentColor"
          fillOpacity=".12"
        />
        <circle
          cx="250"
          cy="155"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          markerEnd={arrow}
        />
        {[0, 90, 180, 270].map((degrees) => {
          const radians = (degrees * Math.PI) / 180;
          const x = roundSvgNumber(250 + (radius - 18) * Math.cos(radians));
          const y = roundSvgNumber(155 - (radius - 18) * Math.sin(radians));
          return (
            <line
              key={degrees}
              x1={x}
              y1={y}
              x2={roundSvgNumber(x + 20 * Math.sin(radians))}
              y2={roundSvgNumber(y + 20 * Math.cos(radians))}
              stroke="currentColor"
              strokeOpacity=".45"
              markerEnd={arrow}
            />
          );
        })}
        <SvgTex x={329} y={48} width={96} source="\partial D" />
        <SvgTex x={230} y={140} width={44} source="D" />
        <SvgTex
          x={306}
          y={252}
          width={150}
          source={String.raw`2\pi r^2=${number(2 * area)}`}
        />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <div>
          <Tex
            source={String.raw`\iint_D2\,\mathrm dA=${number(2 * area)}`}
            display
          />
        </div>
      </div>
    </DemoFrame>
  );
}
