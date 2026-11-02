"use client";

import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";

export default function MultivariableChainDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [parameter, setParameter] = useState(1);
  const u = parameter;
  const v = parameter * parameter;
  const z = u * u + v;
  const slope = 4 * parameter;
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
          min={-2}
          max={2}
          step={0.1}
          onChange={setParameter}
        />
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", { slope: number(slope) })}
        />
      }
    >
      <svg viewBox="0 0 500 300" role="img" aria-label={t("label")}>
        <line
          x1="112"
          y1="150"
          x2="225"
          y2="83"
          stroke="currentColor"
          strokeWidth="2"
        />
        <line
          x1="112"
          y1="150"
          x2="225"
          y2="217"
          stroke="currentColor"
          strokeWidth="2"
        />
        <line
          x1="287"
          y1="83"
          x2="390"
          y2="150"
          stroke="currentColor"
          strokeWidth="2"
        />
        <line
          x1="287"
          y1="217"
          x2="390"
          y2="150"
          stroke="currentColor"
          strokeWidth="2"
        />
        {[
          { x: 112, y: 150, label: "t", value: number(parameter) },
          { x: 256, y: 83, label: "u", value: number(u) },
          { x: 256, y: 217, label: "v", value: number(v) },
          { x: 390, y: 150, label: "z", value: number(z) },
        ].map((node) => (
          <g key={node.label}>
            <circle
              cx={node.x}
              cy={node.y}
              r="28"
              fill="var(--background)"
              stroke="currentColor"
              strokeWidth="2"
            />
            <SvgTex
              x={node.x - 8}
              y={node.y - 10}
              width={28}
              source={node.label}
            />
            <SvgTex
              x={node.x - 28}
              y={node.y + 31}
              width={68}
              source={node.value}
            />
          </g>
        ))}
        <SvgTex
          x={136}
          y={91}
          width={112}
          source={String.raw`u=t,\ du/dt=1`}
          height={42}
        />
        <SvgTex
          x={119}
          y={208}
          width={152}
          source={String.raw`v=t^2,\ dv/dt=2t`}
          height={42}
        />
        <SvgTex
          x={304}
          y={91}
          width={112}
          source={String.raw`z_u=2u`}
          height={42}
        />
        <SvgTex
          x={304}
          y={190}
          width={112}
          source={String.raw`z_v=1`}
          height={42}
        />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <p>
          <Tex
            source={String.raw`\frac{\mathrm dz}{\mathrm dt}=${number(slope)}`}
          />
        </p>
      </div>
    </DemoFrame>
  );
}
