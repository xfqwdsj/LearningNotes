"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

export default function TrigReductionDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [angle, setAngle] = useState(30);
  const [mode, setMode] = useState<"subtract" | "add" | "quarter">("subtract");
  const transformed =
    mode === "subtract"
      ? 180 - angle
      : mode === "add"
        ? 180 + angle
        : 90 + angle;
  const original = Math.sin((angle * Math.PI) / 180);
  const result = Math.sin((transformed * Math.PI) / 180);
  const center = [250, 155] as const;
  const radius = 105;
  const point = (degrees: number) => {
    const radians = (degrees * Math.PI) / 180;
    return [
      roundSvgNumber(center[0] + radius * Math.cos(radians)),
      roundSvgNumber(center[1] - radius * Math.sin(radians)),
    ] as const;
  };
  const source = point(angle);
  const target = point(transformed);
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
        <>
          <DemoRange
            label={t.markdown("angle")}
            value={angle}
            display={`$${angle}^{\\circ}$`}
            min={0}
            max={90}
            step={15}
            onChange={setAngle}
          />
          <div
            role="group"
            aria-label={t("choose")}
            className="grid grid-cols-3 gap-2"
          >
            {(["subtract", "add", "quarter"] as const).map((value) => (
              <Button
                key={value}
                type="button"
                size="sm"
                className="w-full min-w-0 px-0"
                variant={mode === value ? "default" : "outline"}
                aria-pressed={mode === value}
                onClick={() => setMode(value)}
              >
                <IcuMarkdownText value={t.markdown(value)} />
              </Button>
            ))}
          </div>
        </>
      }
      conclusion={<IcuMarkdownText value={t.markdown(mode + "Result")} />}
    >
      <svg viewBox="0 0 500 315" role="img" aria-label={t("label")}>
        <path
          d="M122 155H378M250 27V283"
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
          strokeOpacity=".4"
        />
        <line
          x1={center[0]}
          y1={center[1]}
          x2={source[0]}
          y2={source[1]}
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <line
          x1={center[0]}
          y1={center[1]}
          x2={target[0]}
          y2={target[1]}
          stroke="currentColor"
          strokeOpacity=".55"
          strokeWidth="2.5"
        />
        <line
          x1={source[0]}
          y1={source[1]}
          x2={target[0]}
          y2={target[1]}
          stroke="currentColor"
          strokeOpacity=".25"
          strokeDasharray="4 4"
        />
        <line
          x1={source[0]}
          y1={source[1]}
          x2={center[0]}
          y2={source[1]}
          stroke="currentColor"
          strokeDasharray="4 4"
        />
        <line
          x1={target[0]}
          y1={target[1]}
          x2={center[0]}
          y2={target[1]}
          stroke="currentColor"
          strokeDasharray="4 4"
        />
        <circle cx={source[0]} cy={source[1]} r="6" fill="currentColor" />
        <circle
          cx={target[0]}
          cy={target[1]}
          r="6"
          fill="var(--background)"
          stroke="currentColor"
          strokeWidth="2"
        />
        <SvgTex
          x={source[0] + 7}
          y={source[1] - 16}
          width={44}
          source="\alpha"
        />
        <SvgTex
          x={target[0] + 7}
          y={target[1] - 16}
          width={62}
          source={String.raw`${transformed}^{\circ}`}
        />
        <SvgTex x={368} y={139} width={28} source="x" />
        <SvgTex x={258} y={19} width={28} source="y" />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <p>
          <Tex
            source={String.raw`\sin(${angle}^{\circ})=${number(original)},\qquad\sin(${transformed}^{\circ})=${number(result)}`}
          />
        </p>
      </div>
    </DemoFrame>
  );
}
