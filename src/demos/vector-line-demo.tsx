"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import { roundSvgNumber } from "./svg";
import type { DemoComponentProps } from "./types";

export default function VectorLineDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const marker = useId();
  const [radius, setRadius] = useState(1);
  const [reverse, setReverse] = useState(false);
  const value = (reverse ? -1 : 1) * 2 * Math.PI * radius * radius;
  const screenRadius = radius * 43;
  const number = (valueToFormat: number) =>
    format.number(valueToFormat, {
      minimumFractionDigits: 2,
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
            label={t.markdown("r")}
            value={radius}
            display={`$${number(radius)}$`}
            min={0.5}
            max={3}
            step={0.1}
            onChange={setRadius}
          />
          <div
            role="group"
            aria-label={t("direction")}
            className="grid grid-cols-2 gap-2"
          >
            {[false, true].map((valueOption) => (
              <Button
                key={String(valueOption)}
                type="button"
                size="sm"
                className="w-full"
                variant={reverse === valueOption ? "default" : "outline"}
                aria-pressed={reverse === valueOption}
                onClick={() => setReverse(valueOption)}
              >
                <IcuMarkdownText
                  value={t.markdown(
                    valueOption ? "clockwise" : "counterclockwise",
                  )}
                />
              </Button>
            ))}
          </div>
        </>
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", { value: number(value) })}
        />
      }
    >
      <svg viewBox="0 0 500 315" role="img" aria-label={t("label")}>
        <defs>
          <marker
            id={marker}
            viewBox="0 0 8 8"
            refX="7"
            refY="4"
            markerWidth="8"
            markerHeight="8"
            markerUnits="userSpaceOnUse"
            orient="auto"
          >
            <path d="M0 0L8 4L0 8Z" fill="currentColor" />
          </marker>
        </defs>
        <circle
          cx="250"
          cy="155"
          r={screenRadius}
          fill="currentColor"
          fillOpacity=".1"
        />
        <circle
          cx="250"
          cy="155"
          r={screenRadius}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          markerEnd={`url(#${marker})`}
          transform={reverse ? "scale(-1 1) translate(-500 0)" : undefined}
        />
        {[0, 90, 180, 270].map((degrees) => {
          const radians = (degrees * Math.PI) / 180;
          const x = roundSvgNumber(
            250 + (screenRadius - 10) * Math.cos(radians),
          );
          const y = roundSvgNumber(
            155 - (screenRadius - 10) * Math.sin(radians),
          );
          return (
            <line
              key={degrees}
              x1={x}
              y1={y}
              x2={roundSvgNumber(x + (reverse ? -18 : 18) * Math.sin(radians))}
              y2={roundSvgNumber(y + (reverse ? -18 : 18) * Math.cos(radians))}
              stroke="currentColor"
              strokeOpacity=".55"
              markerEnd={`url(#${marker})`}
            />
          );
        })}
        <SvgTex x={20} y={20} width={92} source="P=-y,\ Q=x" />
        <SvgTex
          x={304}
          y={280}
          width={166}
          source={String.raw`\oint=${number(value)}`}
        />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <div>
          <Tex
            source={String.raw`\oint_L(-y\,\mathrm dx+x\,\mathrm dy)=${number(value)}`}
            display
          />
        </div>
      </div>
    </DemoFrame>
  );
}
