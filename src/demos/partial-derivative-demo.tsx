"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function PartialDerivativeDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [a, setA] = useState(1),
    [b, setB] = useState(2),
    [xAxis, setXAxis] = useState(true);
  const slope = xAxis ? b : a;
  const selected = xAxis ? a : b;
  const scale = Math.max(3, Math.abs(slope) * 3);
  const graphY = (v: number) => 110 - (v / scale) * 75;
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label={t.markdown("x")}
            value={a}
            display={String(a)}
            min={-3}
            max={3}
            onChange={setA}
          />
          <DemoRange
            label={t.markdown("y")}
            value={b}
            display={String(b)}
            min={-3}
            max={3}
            onChange={setB}
          />
          <div
            role="group"
            aria-label={t("choose")}
            className="grid grid-cols-2 gap-2"
          >
            {[true, false].map((v) => (
              <Button
                key={String(v)}
                type="button"
                size="sm"
                className="w-full"
                variant={xAxis === v ? "default" : "outline"}
                aria-pressed={xAxis === v}
                onClick={() => setXAxis(v)}
              >
                <IcuMarkdownText value={t.markdown(v ? "alongX" : "alongY")} />
              </Button>
            ))}
          </div>
        </>
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", { slope: xAxis ? b : a })}
        />
      }
    >
      <p className="px-6 pt-4 text-sm">
        <IcuMarkdownText value={t.raw("graphNote") as string} />
      </p>
      <svg
        viewBox="0 0 460 230"
        role="img"
        aria-label={t("graphLabel", { coordinate: selected, slope })}
      >
        <line
          x1="40"
          y1="110"
          x2="420"
          y2="110"
          stroke="currentColor"
          opacity=".3"
        />
        <line
          x1="230"
          y1="25"
          x2="230"
          y2="195"
          stroke="currentColor"
          opacity=".3"
        />
        <line
          x1="60"
          y1={graphY(-3 * slope)}
          x2="400"
          y2={graphY(3 * slope)}
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle
          cx={230 + (selected * 170) / 3}
          cy={graphY(slope * selected)}
          r="5"
          fill="currentColor"
        />
        <SvgTex x={410} y={116} width={35} source={xAxis ? "x" : "y"} />
        <SvgTex
          x={236}
          y={25}
          width={75}
          source={xAxis ? String.raw`f(x,b)` : String.raw`f(a,y)`}
        />
      </svg>
      <div className="px-6 py-4 text-sm">
        <Tex source={String.raw`f(x,y)=xy,\quad f_x=y,\quad f_y=x`} />
      </div>
    </DemoFrame>
  );
}
