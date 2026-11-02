"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

const initialSample = [0.8, 1.2, 6] as const;
const xMax = 16;

export default function MomentEstimateDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [sample, setSample] = useState<number[]>([...initialSample]);
  const mean = sample.reduce((sum, value) => sum + value, 0) / sample.length;
  const estimate = 2 * mean;
  const maximum = Math.max(...sample);
  const inside = estimate >= maximum;
  const number = (value: number) =>
    format.number(value, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  const sx = (value: number) => roundSvgNumber(54 + (value / xMax) * 400);
  const density = 1 / estimate;
  const densityHeight = roundSvgNumber(72 * density);
  const baseline = 142;
  const sampleAxis = 205;

  const update = (index: number, value: number) => {
    setSample((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? value : item)),
    );
  };

  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          {sample.map((value, index) => (
            <DemoRange
              key={index}
              label={String.raw`$x_${index + 1}$`}
              value={value}
              display={`$${number(value)}$`}
              min={0.6}
              max={7.2}
              step={0.1}
              onChange={(next) => update(index, next)}
            />
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setSample([...initialSample])}
          >
            <RotateCcw />
            <IcuMarkdownText value={t.markdown("reset")} />
          </Button>
        </>
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown(inside ? "inside" : "outside", {
            estimate: number(estimate),
            maximum: number(maximum),
          })}
        />
      }
    >
      <svg
        viewBox="0 0 500 280"
        role="img"
        aria-label={t("graphLabel", {
          estimate: number(estimate),
          mean: number(mean),
          maximum: number(maximum),
        })}
      >
        <line
          x1={sx(0)}
          y1={baseline}
          x2={sx(xMax)}
          y2={baseline}
          stroke="currentColor"
          strokeOpacity=".4"
        />
        <rect
          x={sx(0)}
          y={baseline - densityHeight}
          width={sx(estimate) - sx(0)}
          height={densityHeight}
          fill="currentColor"
          fillOpacity=".2"
          stroke="currentColor"
          strokeWidth="2"
        />
        <line
          x1={sx(0)}
          y1={baseline}
          x2={sx(0)}
          y2="55"
          stroke="currentColor"
          strokeOpacity=".35"
        />
        <line
          x1={sx(mean)}
          y1="38"
          x2={sx(mean)}
          y2={sampleAxis + 15}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="5 4"
        />
        <line
          x1={sx(estimate)}
          y1="38"
          x2={sx(estimate)}
          y2={sampleAxis + 15}
          stroke="currentColor"
          strokeWidth="2"
        />
        <line
          x1={sx(0)}
          y1={sampleAxis}
          x2={sx(xMax)}
          y2={sampleAxis}
          stroke="currentColor"
          strokeOpacity=".4"
        />
        {sample.map((value, index) => (
          <g key={index}>
            <line
              x1={sx(value)}
              y1={sampleAxis}
              x2={sx(value)}
              y2={sampleAxis + 8}
              stroke="currentColor"
              strokeOpacity=".55"
            />
            <circle
              cx={sx(value)}
              cy={sampleAxis - 17}
              r="7"
              fill={value <= estimate ? "currentColor" : "var(--background)"}
              stroke="currentColor"
              strokeWidth="2"
            />
          </g>
        ))}
        {!inside && (
          <path
            d={`M${sx(estimate)} ${sampleAxis - 37}H${sx(maximum)}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
        )}
        {[0, 4, 8, 12, 16].map((tick) => (
          <SvgTex
            key={tick}
            x={sx(tick) - 6}
            y={sampleAxis + 8}
            width={30}
            source={String(tick)}
          />
        ))}
        <SvgTex
          x={Math.max(12, sx(mean) - 18)}
          y={18}
          width={55}
          source={String.raw`\bar x=${number(mean)}`}
        />
        <SvgTex
          x={Math.min(404, sx(estimate) + 8)}
          y={18}
          width={85}
          source={String.raw`2\bar x=${number(estimate)}`}
        />
        <SvgTex
          x={10}
          y={Math.max(35, baseline - densityHeight - 24)}
          width={72}
          source={String.raw`f(x)=1/\hat\theta`}
          height={24}
        />
        <SvgTex x={443} y={baseline - 22} width={40} source="x" />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <div>
          <Tex
            source={String.raw`A_1=\bar x=\frac1n\sum_{i=1}^n x_i=${number(mean)}`}
            display
          />
        </div>
        <p>
          <Tex
            source={String.raw`\hat\theta_{\mathrm{MM}}=2A_1=${number(estimate)},\qquad x_{(n)}=${number(maximum)}`}
          />
        </p>
      </div>
    </DemoFrame>
  );
}
