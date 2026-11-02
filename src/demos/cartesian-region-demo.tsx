"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";

export default function CartesianRegionDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [vertical, setVertical] = useState(true);
  const [position, setPosition] = useState(0.5);
  const px = (v: number) => 80 + 240 * v;
  const py = (v: number) => 260 - 240 * v;
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <div
            role="group"
            aria-label={t("direction")}
            className="grid grid-cols-2 gap-2"
          >
            {[true, false].map((v) => (
              <Button
                key={String(v)}
                type="button"
                size="sm"
                variant={vertical === v ? "default" : "outline"}
                aria-pressed={vertical === v}
                onClick={() => setVertical(v)}
              >
                <IcuMarkdownText
                  value={t.markdown(v ? "vertical" : "horizontal")}
                />
              </Button>
            ))}
          </div>
          <DemoRange
            label={t.markdown("position")}
            value={position}
            display={position.toFixed(2)}
            min={0}
            max={1}
            step={0.05}
            onChange={setPosition}
          />
        </>
      }
      conclusion={
        <IcuMarkdownText
          value={
            t.raw(vertical ? "verticalResult" : "horizontalResult") as string
          }
        />
      }
    >
      <svg
        viewBox="0 0 420 300"
        role="img"
        aria-label={t(vertical ? "verticalGraph" : "horizontalGraph", {
          position: position.toFixed(2),
        })}
      >
        <path
          d="M80 260 L320 260 L320 20 Z"
          fill="currentColor"
          opacity=".12"
        />
        <path
          d="M80 260 L320 260 L320 20 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <line
          x1="65"
          y1="260"
          x2="355"
          y2="260"
          stroke="currentColor"
          opacity=".45"
        />
        <line
          x1="80"
          y1="275"
          x2="80"
          y2="10"
          stroke="currentColor"
          opacity=".45"
        />
        {vertical ? (
          <line
            x1={px(position)}
            y1={py(0)}
            x2={px(position)}
            y2={py(position)}
            stroke="currentColor"
            strokeWidth="5"
          />
        ) : (
          <line
            x1={px(position)}
            y1={py(position)}
            x2={px(1)}
            y2={py(position)}
            stroke="currentColor"
            strokeWidth="5"
          />
        )}
        <SvgTex x={355} y={265} width={25} source="x" />
        <SvgTex x={56} y={5} width={25} source="y" />
        <SvgTex x={315} y={265} width={25} source="1" />
        <SvgTex x={55} y={15} width={25} source="1" />
      </svg>
      <div className="px-6 py-4 text-sm">
        <Tex
          source={
            vertical
              ? String.raw`0\le x\le1,\quad 0\le y\le x`
              : String.raw`0\le y\le1,\quad y\le x\le1`
          }
        />
      </div>
    </DemoFrame>
  );
}
