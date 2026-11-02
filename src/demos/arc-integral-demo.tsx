"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

export default function ArcIntegralDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [a, setA] = useState(2);
  const [reverse, setReverse] = useState(false);
  const sx = (value: number) => roundSvgNumber(70 + (value / 5) * 374);
  const sy = (value: number) => roundSvgNumber(218 - (value / 5) * 146);
  const arrowY = 251;
  const arrowTail = reverse ? sx(a) : sx(0);
  const arrowTip = reverse ? sx(0) : sx(a);
  const arrowBase = reverse ? arrowTip + 16 : arrowTip - 16;
  const area = `M${sx(0)} ${sy(0)}${Array.from({ length: 41 }, (_, index) => {
    const value = (a * index) / 40;
    return `L${sx(value)} ${sy(value)}`;
  }).join("")}L${sx(a)} ${sy(0)}Z`;
  const number = (value: number) =>
    format.number(value, {
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
            label={t.markdown("a")}
            value={a}
            display={`$${number(a)}$`}
            min={1}
            max={5}
            onChange={setA}
          />
          <div
            role="group"
            aria-label={t("direction")}
            className="grid grid-cols-2 gap-2"
          >
            {[false, true].map((value) => (
              <Button
                key={String(value)}
                type="button"
                size="sm"
                className="w-full"
                variant={reverse === value ? "default" : "outline"}
                aria-pressed={reverse === value}
                onClick={() => setReverse(value)}
              >
                <IcuMarkdownText
                  value={t.markdown(value ? "reverse" : "forward")}
                />
              </Button>
            ))}
          </div>
        </>
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", { value: number((a * a) / 2) })}
        />
      }
    >
      <svg viewBox="0 0 500 280" role="img" aria-label={t("label")}>
        <path d={area} fill="currentColor" fillOpacity=".16" />
        <path
          d={`M58 ${sy(0)}H454M70 ${sy(0)}V52`}
          fill="none"
          stroke="currentColor"
          strokeOpacity=".25"
        />
        <line
          x1={sx(0)}
          y1={sy(0)}
          x2={sx(5)}
          y2={sy(5)}
          stroke="currentColor"
          strokeWidth="2.25"
        />
        <line
          x1={arrowTail}
          y1={arrowY}
          x2={arrowBase}
          y2={arrowY}
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d={`M${arrowBase} ${arrowY - 7}L${arrowTip} ${arrowY}L${arrowBase} ${arrowY + 7}Z`}
          fill="currentColor"
        />
        {Array.from({ length: 11 }, (_, index) => {
          const value = (a * index) / 10;
          return (
            <line
              key={index}
              x1={sx(value)}
              y1={sy(0) - 6}
              x2={sx(value)}
              y2={sy(0) + 6}
              stroke="currentColor"
              strokeOpacity=".45"
            />
          );
        })}
        <SvgTex x={sx(a) + 7} y={sy(0) - 12} width={36} source="x" />
        <SvgTex x={28} y={42} width={72} source="h(x)=x" />
        <SvgTex x={18} y={207} width={28} source="O" />
        <SvgTex
          x={sx(a / 2) - 10}
          y={sy(0) + 8}
          width={42}
          source="\mathrm ds"
        />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <div>
          <Tex
            source={String.raw`\int_L x\,\mathrm ds=\int_0^a x\,\mathrm dx=${number((a * a) / 2)}`}
            display
          />
        </div>
      </div>
    </DemoFrame>
  );
}
