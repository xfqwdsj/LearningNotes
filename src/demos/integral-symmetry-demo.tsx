"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

export default function IntegralSymmetryDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [even, setEven] = useState(true);
  const [a, setA] = useState(1);
  const fn = (value: number) => (even ? value * value : value ** 3);
  const ceiling = Math.max(fn(a), 0.1);
  const sx = (value: number) => roundSvgNumber(250 + value * 55);
  const baseline = even ? 226 : 154;
  const amplitude = even ? 142 : 86;
  const sy = (value: number) =>
    roundSvgNumber(baseline - (value / ceiling) * amplitude);
  const curve = (from: number, to: number) =>
    Array.from({ length: 81 }, (_, index) => {
      const x = from + ((to - from) * index) / 80;
      return `${index === 0 ? "M" : "L"}${sx(x)} ${sy(fn(x))}`;
    }).join(" ");
  const region = (from: number, to: number) => {
    const top = Array.from({ length: 41 }, (_, index) => {
      const x = from + ((to - from) * index) / 40;
      return `${index === 0 ? "M" : "L"}${sx(x)} ${sy(fn(x))}`;
    }).join(" ");
    return `${top}L${sx(to)} ${baseline}L${sx(from)} ${baseline}Z`;
  };
  const number = (value: number) =>
    format.number(value, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
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
            min={0.5}
            max={3}
            step={0.1}
            onChange={setA}
          />
          <div
            role="group"
            aria-label={t("choose")}
            className="grid grid-cols-2 gap-2"
          >
            {[false, true].map((value) => (
              <Button
                key={String(value)}
                type="button"
                size="sm"
                className="w-full"
                variant={even === value ? "default" : "outline"}
                aria-pressed={even === value}
                onClick={() => setEven(value)}
              >
                <Tex source={value ? "x^2" : "x^3"} />
              </Button>
            ))}
          </div>
        </>
      }
      conclusion={<IcuMarkdownText value={t.markdown(even ? "even" : "odd")} />}
    >
      <svg viewBox="0 0 500 280" role="img" aria-label={t("label")}>
        <path
          d={`M62 ${baseline}H438M250 28V258`}
          fill="none"
          stroke="currentColor"
          strokeOpacity=".25"
        />
        <path d={region(-a, 0)} fill="currentColor" fillOpacity=".16" />
        <path d={region(0, a)} fill="currentColor" fillOpacity=".25" />
        <path
          d={curve(-3, 3)}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <line
          x1={sx(-a)}
          y1={baseline - 8}
          x2={sx(-a)}
          y2={baseline + 8}
          stroke="currentColor"
          strokeWidth="2"
        />
        <line
          x1={sx(a)}
          y1={baseline - 8}
          x2={sx(a)}
          y2={baseline + 8}
          stroke="currentColor"
          strokeWidth="2"
        />
        <SvgTex x={232} y={baseline + 7} width={30} source="0" />
        <SvgTex
          x={sx(-a) - 22}
          y={baseline + 7}
          width={42}
          source={String.raw`-a`}
        />
        <SvgTex x={sx(a) + 2} y={baseline + 7} width={30} source="a" />
        <SvgTex x={445} y={baseline - 12} width={30} source="x" />
        <SvgTex
          x={20}
          y={34}
          width={92}
          source={even ? "f(x)=x^2" : "f(x)=x^3"}
        />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <div>
          <Tex
            source={String.raw`\int_{-a}^a ${even ? "x^2" : "x^3"}\,\mathrm dx=${even ? number((2 * a ** 3) / 3) : "0"}`}
            display
          />
        </div>
      </div>
    </DemoFrame>
  );
}
