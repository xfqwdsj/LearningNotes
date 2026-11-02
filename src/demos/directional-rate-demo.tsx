"use client";

import { useId, useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

export default function DirectionalRateDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const marker = useId();
  const [angle, setAngle] = useState(0);
  const radians = (angle * Math.PI) / 180;
  const direction = [Math.cos(radians), Math.sin(radians)] as const;
  const rate = 2 * direction[0] + 4 * direction[1];
  const gradientLength = Math.hypot(2, 4);
  const gradient = [2 / gradientLength, 4 / gradientLength] as const;
  const center = [220, 156] as const;
  const length = 92;
  const point = (vector: readonly [number, number], scale = length) =>
    [
      roundSvgNumber(center[0] + vector[0] * scale),
      roundSvgNumber(center[1] - vector[1] * scale),
    ] as const;
  const directionTip = point(direction);
  const gradientTip = point(gradient);
  const arrow = `url(#${marker})`;

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
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", {
            rate: roundSvgNumber(rate).toFixed(3),
          })}
        />
      }
    >
      <svg viewBox="0 0 460 310" role="img" aria-label={t("label")}>
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
        <path
          d={`M${center[0] - 135} ${center[1]}H${center[0] + 135}M${center[0]} ${center[1] - 125}V${center[1] + 125}`}
          fill="none"
          stroke="currentColor"
          strokeOpacity=".2"
        />
        {[52, 88, 122].map((radius) => (
          <circle
            key={radius}
            cx={center[0]}
            cy={center[1]}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeOpacity=".1"
          />
        ))}
        <line
          x1={center[0]}
          y1={center[1]}
          x2={gradientTip[0]}
          y2={gradientTip[1]}
          stroke="currentColor"
          strokeOpacity=".55"
          strokeWidth="2"
          strokeDasharray="6 4"
          markerEnd={arrow}
        />
        <line
          x1={center[0]}
          y1={center[1]}
          x2={directionTip[0]}
          y2={directionTip[1]}
          stroke="currentColor"
          strokeWidth="3"
          markerEnd={arrow}
        />
        <circle cx={center[0]} cy={center[1]} r="5" fill="currentColor" />
        <SvgTex
          x={directionTip[0] + 6}
          y={directionTip[1] - 10}
          width={42}
          source={String.raw`\mathbf u`}
        />
        <SvgTex
          x={gradientTip[0] - 20}
          y={gradientTip[1] - 28}
          width={62}
          source={String.raw`\nabla f`}
        />
        <SvgTex
          x={Math.min(280, center[0] + 24)}
          y={Math.max(45, center[1] - 54)}
          width={36}
          source={String.raw`\theta`}
        />
        <SvgTex
          x={center[0] - 18}
          y={center[1] + 8}
          width={56}
          source="(1,2)"
        />
        <SvgTex x={350} y={center[1] - 20} width={28} source="x" />
        <SvgTex x={center[0] - 8} y={22} width={28} source="y" />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <p>
          <Tex
            source={String.raw`D_{\mathbf u}f(1,2)=\nabla f(1,2)\cdot\mathbf u=2\cos\theta+4\sin\theta\approx${roundSvgNumber(rate).toFixed(3)}`}
          />
        </p>
      </div>
    </DemoFrame>
  );
}
