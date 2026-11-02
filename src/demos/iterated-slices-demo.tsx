"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function IteratedSlicesDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [vertical, setVertical] = useState(true);
  const [index, setIndex] = useState(2);
  const v = (index - 0.5) / 4;
  const inner = vertical ? v + 1 : 0.5 + 2 * v;
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
            {[true, false].map((b) => (
              <Button
                key={String(b)}
                type="button"
                size="sm"
                variant={vertical === b ? "default" : "outline"}
                aria-pressed={vertical === b}
                onClick={() => setVertical(b)}
              >
                <IcuMarkdownText
                  value={t.markdown(b ? "vertical" : "horizontal")}
                />
              </Button>
            ))}
          </div>
          <DemoRange
            label={t.markdown("index")}
            value={index}
            display={String(index)}
            min={1}
            max={4}
            onChange={setIndex}
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
        viewBox="0 0 420 290"
        role="img"
        aria-label={t(vertical ? "verticalGraph" : "horizontalGraph", {
          index,
          inner: inner.toFixed(3),
        })}
      >
        {Array.from({ length: 16 }, (_, i) => {
          const x = i % 4,
            y = Math.floor(i / 4);
          return (
            <rect
              key={i}
              x={80 + x * 55}
              y={245 - (y + 1) * 55}
              width="55"
              height="55"
              fill="currentColor"
              fillOpacity={
                0.08 + (0.45 * ((x + 0.5) / 4 + (2 * (y + 0.5)) / 4)) / 3
              }
              stroke="var(--background)"
              strokeWidth="1"
            />
          );
        })}
        {vertical ? (
          <rect
            x={80 + (index - 1) * 55}
            y="25"
            width="55"
            height="220"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
        ) : (
          <rect
            x="80"
            y={245 - index * 55}
            width="220"
            height="55"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
        )}
        {vertical ? (
          <line
            x1={80 + (index - 0.5) * 55}
            y1="25"
            x2={80 + (index - 0.5) * 55}
            y2="245"
            stroke="currentColor"
            strokeWidth="2"
          />
        ) : (
          <line
            x1="80"
            y1={245 - (index - 0.5) * 55}
            x2="300"
            y2={245 - (index - 0.5) * 55}
            stroke="currentColor"
            strokeWidth="2"
          />
        )}
        <SvgTex x={305} y={250} width={25} source="x" />
        <SvgTex x={57} y={12} width={25} source="y" />
      </svg>
      <div className="px-6 py-4 text-sm">
        <Tex
          source={
            vertical
              ? String.raw`\int_0^1(${v.toFixed(3)}+2y)\,\mathrm dy=${inner.toFixed(3)}`
              : String.raw`\int_0^1(x+2\cdot${v.toFixed(3)})\,\mathrm dx=${inner.toFixed(3)}`
          }
          display
        />
      </div>
    </DemoFrame>
  );
}
