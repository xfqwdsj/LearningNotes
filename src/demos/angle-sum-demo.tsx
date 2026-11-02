"use client";

import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

export default function AngleSumDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [alpha, setAlpha] = useState(30);
  const [beta, setBeta] = useState(45);
  const alphaRadians = (alpha * Math.PI) / 180;
  const betaRadians = (beta * Math.PI) / 180;
  const sum = alpha + beta;
  const center = [230, 158] as const;
  const radius = 102;
  const point = (angle: number, length = radius) =>
    [
      roundSvgNumber(center[0] + length * Math.cos(angle)),
      roundSvgNumber(center[1] - length * Math.sin(angle)),
    ] as const;
  const arc = (start: number, end: number, length: number) => {
    const first = Math.min(start, end);
    const second = Math.max(start, end);
    return Array.from({ length: 49 }, (_, index) => {
      const angle = first + ((second - first) * index) / 48;
      const [x, y] = point(angle, length);
      return `${index === 0 ? "M" : "L"}${x} ${y}`;
    }).join(" ");
  };
  const alphaPoint = point(alphaRadians);
  const sumPoint = point((sum * Math.PI) / 180);
  const right =
    Math.sin(alphaRadians) * Math.cos(betaRadians) +
    Math.cos(alphaRadians) * Math.sin(betaRadians);

  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label={t.markdown("alpha")}
            value={alpha}
            display={`$${alpha}^{\\circ}$`}
            min={-180}
            max={180}
            step={15}
            onChange={setAlpha}
          />
          <DemoRange
            label={t.markdown("beta")}
            value={beta}
            display={`$${beta}^{\\circ}$`}
            min={-180}
            max={180}
            step={15}
            onChange={setBeta}
          />
        </>
      }
      conclusion={<IcuMarkdownText value={t.markdown("result")} />}
    >
      <svg viewBox="0 0 460 310" role="img" aria-label={t("label")}>
        <path
          d={`M${center[0] - 128} ${center[1]}H${center[0] + 128}M${center[0]} ${center[1] - 128}V${center[1] + 128}`}
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
          strokeOpacity=".35"
          strokeDasharray="5 5"
        />
        <path
          d={arc(0, alphaRadians, 46)}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d={arc(alphaRadians, (sum * Math.PI) / 180, 68)}
          fill="none"
          stroke="currentColor"
          strokeOpacity=".55"
          strokeWidth="2"
          strokeDasharray="5 4"
        />
        <line
          x1={center[0]}
          y1={center[1]}
          x2={alphaPoint[0]}
          y2={alphaPoint[1]}
          stroke="currentColor"
          strokeOpacity=".45"
          strokeWidth="2"
        />
        <line
          x1={center[0]}
          y1={center[1]}
          x2={sumPoint[0]}
          y2={sumPoint[1]}
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <line
          x1={sumPoint[0]}
          y1={sumPoint[1]}
          x2={center[0]}
          y2={sumPoint[1]}
          stroke="currentColor"
          strokeOpacity=".45"
          strokeDasharray="4 4"
        />
        <circle
          cx={alphaPoint[0]}
          cy={alphaPoint[1]}
          r="5"
          fill="currentColor"
        />
        <circle cx={sumPoint[0]} cy={sumPoint[1]} r="6" fill="currentColor" />
        <SvgTex
          x={center[0] + 24}
          y={center[1] - 40}
          width={50}
          source={String.raw`\alpha`}
        />
        <SvgTex
          x={point((sum * Math.PI) / 360, 92)[0]}
          y={point((sum * Math.PI) / 360, 92)[1] - 10}
          width={50}
          source={String.raw`\beta`}
        />
        <SvgTex x={center[0] - 15} y={center[1] + 8} width={30} source="O" />
        <SvgTex x={center[0] + 128} y={center[1] - 22} width={30} source="x" />
        <SvgTex x={center[0] - 8} y={center[1] - 132} width={30} source="y" />
        <SvgTex
          x={24}
          y={22}
          width={88}
          source={String.raw`\sin(\alpha+\beta)=${roundSvgNumber(Math.sin((sum * Math.PI) / 180)).toFixed(3)}`}
          height={48}
        />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <p>
          <Tex
            source={String.raw`\sin(\alpha+\beta)\approx${Math.sin(((alpha + beta) * Math.PI) / 180).toFixed(4)},\qquad \sin\alpha\cos\beta+\cos\alpha\sin\beta\approx${right.toFixed(4)}`}
          />
        </p>
      </div>
    </DemoFrame>
  );
}
