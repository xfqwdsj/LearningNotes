"use client";

import { useId, useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

export default function DotProductDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const marker = useId();
  const [angle, setAngle] = useState(60);
  const radians = (angle * Math.PI) / 180;
  const cosine = Math.cos(radians);
  const dot = 6 * cosine;
  const projection = 3 * cosine;
  const sx = (value: number) => roundSvgNumber(180 + value * 62);
  const sy = (value: number) => roundSvgNumber(158 - value * 62);
  const tip = [sx(3 * Math.cos(radians)), sy(3 * Math.sin(radians))] as const;
  const projectionPoint = [sx(projection), sy(0)] as const;
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
          max={180}
          step={15}
          onChange={setAngle}
        />
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown(
            angle === 90 ? "perpendicular" : angle < 90 ? "acute" : "obtuse",
          )}
        />
      }
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
        <path
          d="M45 158H414M180 34V274"
          fill="none"
          stroke="currentColor"
          strokeOpacity=".25"
        />
        <line
          x1="180"
          y1="158"
          x2={sx(2)}
          y2="158"
          stroke="currentColor"
          strokeWidth="3"
          markerEnd={arrow}
        />
        <line
          x1="180"
          y1="158"
          x2={tip[0]}
          y2={tip[1]}
          stroke="currentColor"
          strokeWidth="2.5"
          markerEnd={arrow}
        />
        <line
          x1={tip[0]}
          y1={tip[1]}
          x2={projectionPoint[0]}
          y2={projectionPoint[1]}
          stroke="currentColor"
          strokeOpacity=".45"
          strokeDasharray="4 4"
        />
        <line
          x1="180"
          y1="158"
          x2={projectionPoint[0]}
          y2="158"
          stroke="currentColor"
          strokeWidth="6"
          strokeOpacity=".2"
        />
        <path
          d={`M214 158A34 34 0 0 ${angle > 90 ? 1 : 0} ${roundSvgNumber(180 + 34 * Math.cos(radians))} ${roundSvgNumber(158 - 34 * Math.sin(radians))}`}
          fill="none"
          stroke="currentColor"
          strokeOpacity=".55"
        />
        <SvgTex
          x={sx(1) - 4}
          y={139}
          width={32}
          source={String.raw`\mathbf a`}
        />
        <SvgTex
          x={tip[0] + 6}
          y={tip[1] - 12}
          width={40}
          source={String.raw`\mathbf b`}
        />
        <SvgTex x={205} y={121} width={34} source={String.raw`\theta`} />
        <SvgTex
          x={Math.min(342, Math.max(38, projectionPoint[0] - 42))}
          y={174}
          width={108}
          source={String.raw`\operatorname{proj}_{\mathbf a}\mathbf b=${roundSvgNumber(projection).toFixed(2)}`}
          height={28}
        />
        <SvgTex x={408} y={134} width={28} source="x" />
        <SvgTex x={188} y={26} width={28} source="y" />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <p>
          <Tex
            source={String.raw`\mathbf a\cdot\mathbf b=2\cdot3\cos\theta\approx${roundSvgNumber(dot).toFixed(3)}`}
          />
        </p>
      </div>
    </DemoFrame>
  );
}
