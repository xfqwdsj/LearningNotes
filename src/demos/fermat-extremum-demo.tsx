"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function FermatExtremumDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [cube, setCube] = useState(false);
  const [x, setX] = useState(0);
  const value = cube ? x ** 3 : x * x,
    derivative = cube ? 3 * x * x : 2 * x;
  const f = (v: number) => (cube ? v ** 3 : v * v),
    sx = (v: number) => 230 + v * 85,
    sy = (v: number) => 120 - v * 11;
  const curve = Array.from({ length: 161 }, (_, i) => -2 + i / 40)
    .map((v) => `${sx(v)},${sy(f(v))}`)
    .join(" ");
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <div
            role="group"
            aria-label={t("choose")}
            className="grid grid-cols-2 gap-2"
          >
            {[false, true].map((v) => (
              <Button
                key={String(v)}
                type="button"
                size="sm"
                className="w-full"
                variant={cube === v ? "default" : "outline"}
                aria-pressed={cube === v}
                onClick={() => setCube(v)}
              >
                <Tex source={String.raw`${v ? "x^3" : "x^2"}`} />
              </Button>
            ))}
          </div>
          <DemoRange
            label={t.markdown("x")}
            value={x}
            display={x.toFixed(1)}
            min={-2}
            max={2}
            step={0.1}
            onChange={setX}
          />
        </>
      }
      conclusion={
        <IcuMarkdownText value={t.markdown(cube ? "cube" : "square")} />
      }
    >
      <svg
        viewBox="0 0 460 250"
        role="img"
        aria-label={t("graphLabel", {
          functionName: t(cube ? "cubeName" : "squareName"),
          x: x.toFixed(1),
          value: value.toFixed(3),
        })}
      >
        <line
          x1="45"
          y1="120"
          x2="415"
          y2="120"
          stroke="currentColor"
          strokeOpacity=".35"
        />
        <line
          x1="230"
          y1="20"
          x2="230"
          y2="220"
          stroke="currentColor"
          strokeOpacity=".35"
        />
        <polyline
          points={curve}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <circle
          cx="230"
          cy="120"
          r="5"
          fill="var(--background)"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx={sx(x)} cy={sy(value)} r="5" fill="currentColor" />
        <SvgTex x={420} y={123} width={25} source="x" />
        <SvgTex x={235} y={14} width={25} source="y" />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <p>
          <Tex source={String.raw`f(x)=${value.toFixed(3)}`} />
        </p>
        <p>
          <Tex source={String.raw`f\prime(x)=${derivative.toFixed(3)}`} />
        </p>
      </div>
    </DemoFrame>
  );
}
