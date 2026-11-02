"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function ConditionalDistributionDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [rate, setRate] = useState(0.7),
    [condition, setCondition] = useState(1);
  const jointOne = condition === 1 ? 0.4 * rate : 0.4 * (1 - rate),
    jointZero = condition === 1 ? 0.6 * 0.3 : 0.6 * 0.7;
  const one = jointOne / (jointOne + jointZero),
    zero = 1 - one;
  const num = (v: number) => format.number(v, { maximumFractionDigits: 3 });
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label={t.markdown("rate")}
            value={rate}
            display={num(rate)}
            min={0}
            max={1}
            step={0.05}
            onChange={setRate}
          />
          <div
            role="group"
            aria-label={t("condition")}
            className="grid grid-cols-2 gap-2"
          >
            {[0, 1].map((value) => (
              <Button
                key={value}
                type="button"
                variant={condition === value ? "default" : "outline"}
                size="sm"
                className="w-full"
                aria-pressed={condition === value}
                onClick={() => setCondition(value)}
              >
                <IcuMarkdownText value={`$Y=${value}$`} />
              </Button>
            ))}
          </div>
        </>
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", {
            condition,
            zero: num(zero),
            one: num(one),
          })}
        />
      }
    >
      <svg
        viewBox="0 0 460 180"
        role="img"
        aria-label={t("diagram", { zero: num(zero), one: num(one) })}
      >
        <line
          x1="50"
          y1="135"
          x2="410"
          y2="135"
          stroke="currentColor"
          opacity=".3"
        />
        <rect
          x="110"
          y={135 - 100 * zero}
          width="70"
          height={100 * zero}
          fill="currentColor"
          opacity=".45"
        />
        <rect
          x="280"
          y={135 - 100 * one}
          width="70"
          height={100 * one}
          fill="currentColor"
          opacity=".75"
        />
        <SvgTex x={110} y={145} width={70} align="center" source="0" />
        <SvgTex x={280} y={145} width={70} align="center" source="1" />
      </svg>
    </DemoFrame>
  );
}
