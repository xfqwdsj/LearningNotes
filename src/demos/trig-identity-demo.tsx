"use client";

import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

export default function TrigIdentityDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [angle, setAngle] = useState(45);
  const radians = (angle * Math.PI) / 180;
  const sine = Math.sin(radians);
  const cosine = Math.cos(radians);
  const center = [220, 160] as const;
  const radius = 105;
  const sx = (value: number) => roundSvgNumber(center[0] + value * radius);
  const sy = (value: number) => roundSvgNumber(center[1] - value * radius);
  const point = [sx(cosine), sy(sine)] as const;
  const tan =
    Math.abs(cosine) < 0.08 ? Number.POSITIVE_INFINITY : sine / cosine;
  const number = (value: number) =>
    format.number(value, {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    });

  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <DemoRange
          label={t.markdown("angle")}
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
      <svg viewBox="0 0 500 320" role="img" aria-label={t("label")}>
        <path
          d="M92 160H348M220 32V288"
          fill="none"
          stroke="currentColor"
          strokeOpacity=".22"
        />
        <circle
          cx={center[0]}
          cy={center[1]}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeOpacity=".45"
        />
        <line
          x1={center[0]}
          y1={center[1]}
          x2={point[0]}
          y2={point[1]}
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <line
          x1={point[0]}
          y1={point[1]}
          x2={point[0]}
          y2={center[1]}
          stroke="currentColor"
          strokeDasharray="4 4"
        />
        <line
          x1={point[0]}
          y1={point[1]}
          x2={center[0]}
          y2={point[1]}
          stroke="currentColor"
          strokeDasharray="4 4"
        />
        {Number.isFinite(tan) && Math.abs(tan) < 3 && (
          <>
            <line
              x1={sx(1)}
              y1={sy(-3)}
              x2={sx(1)}
              y2={sy(3)}
              stroke="currentColor"
              strokeOpacity=".25"
            />
            <line
              x1={center[0]}
              y1={center[1]}
              x2={sx(1)}
              y2={sy(tan)}
              stroke="currentColor"
              strokeOpacity=".5"
            />
            <SvgTex
              x={sx(1) + 5}
              y={Math.max(24, sy(tan) - 18)}
              width={42}
              source="\tan\alpha"
            />
          </>
        )}
        <circle cx={point[0]} cy={point[1]} r="6" fill="currentColor" />
        <SvgTex
          x={point[0] + 7}
          y={point[1] - 20}
          width={66}
          source="(\cos\alpha,\sin\alpha)"
          height={32}
        />
        <SvgTex x={220} y={238} width={34} source="1" />
        <SvgTex x={342} y={143} width={28} source="x" />
        <SvgTex x={228} y={24} width={28} source="y" />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <p>
          <Tex
            source={String.raw`\sin^2\alpha+\cos^2\alpha=1,\qquad\tan\alpha=${Number.isFinite(tan) ? number(tan) : `\\text{${t("undefinedLabel")}}`}`}
          />
        </p>
      </div>
    </DemoFrame>
  );
}
