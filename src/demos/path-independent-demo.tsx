"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

export default function PathIndependentDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const marker = useId();
  const [a, setA] = useState(2);
  const [b, setB] = useState(1);
  const [straight, setStraight] = useState(true);
  const sx = (value: number) => roundSvgNumber(70 + (value / 4) * 370);
  const sy = (value: number) => roundSvgNumber(235 - (value / 4) * 190);
  const arrow = `url(#${marker})`;
  const number = (value: number) => format.number(value);

  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label={t.markdown("a")}
            value={a}
            display={`$${number(a)}$`}
            min={0}
            max={4}
            onChange={setA}
          />
          <DemoRange
            label={t.markdown("b")}
            value={b}
            display={`$${number(b)}$`}
            min={0}
            max={4}
            onChange={setB}
          />
          <div
            role="group"
            aria-label={t("choose")}
            className="grid grid-cols-2 gap-2"
          >
            {[true, false].map((value) => (
              <Button
                key={String(value)}
                type="button"
                size="sm"
                className="w-full"
                variant={straight === value ? "default" : "outline"}
                aria-pressed={straight === value}
                onClick={() => setStraight(value)}
              >
                <IcuMarkdownText
                  value={t.markdown(value ? "straight" : "corner")}
                />
              </Button>
            ))}
          </div>
        </>
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", { value: a * a + b * b })}
        />
      }
    >
      <svg viewBox="0 0 500 300" role="img" aria-label={t("label")}>
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
          d="M70 235H440M70 235V35"
          fill="none"
          stroke="currentColor"
          strokeOpacity=".25"
        />
        {[-2, 0, 2].map((tick) => (
          <g key={tick}>
            <line
              x1={sx(-2)}
              y1={sy(tick)}
              x2={sx(4)}
              y2={sy(tick)}
              stroke="currentColor"
              strokeOpacity=".06"
            />
            <line
              x1={sx(tick)}
              y1={sy(-2)}
              x2={sx(tick)}
              y2={sy(4)}
              stroke="currentColor"
              strokeOpacity=".06"
            />
          </g>
        ))}
        <line
          x1={sx(0)}
          y1={sy(0)}
          x2={sx(a)}
          y2={sy(b)}
          stroke="currentColor"
          strokeOpacity=".35"
          strokeDasharray="6 4"
          markerEnd={arrow}
        />
        {straight ? (
          <line
            x1={sx(0)}
            y1={sy(0)}
            x2={sx(a)}
            y2={sy(b)}
            stroke="currentColor"
            strokeWidth="3"
            markerEnd={arrow}
          />
        ) : (
          <path
            d={`M${sx(0)} ${sy(0)}H${sx(a)}V${sy(b)}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            markerEnd={arrow}
          />
        )}
        <circle cx={sx(0)} cy={sy(0)} r="5" fill="currentColor" />
        <circle
          cx={sx(a)}
          cy={sy(b)}
          r="6"
          fill="var(--background)"
          stroke="currentColor"
          strokeWidth="2"
        />
        <SvgTex x={442} y={219} width={28} source="x" />
        <SvgTex x={28} y={34} width={28} source="y" />
        <SvgTex
          x={sx(a) + 8}
          y={sy(b) - 22}
          width={70}
          source={String.raw`\varphi=${a * a + b * b}`}
        />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <div>
          <Tex
            source={String.raw`\int_L\mathbf F\cdot\mathrm d\mathbf r=${a * a + b * b}`}
            display
          />
        </div>
      </div>
    </DemoFrame>
  );
}
