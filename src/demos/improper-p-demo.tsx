"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

export default function ImproperPDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [tail, setTail] = useState(true);
  const [p, setP] = useState(1);
  const [bound, setBound] = useState(20);
  const xMin = tail ? 1 : 1 / bound;
  const xMax = tail ? bound : 1;
  const values = Array.from({ length: 121 }, (_, index) => {
    const exponent = Math.log10(xMin) + (index / 120) * Math.log10(xMax / xMin);
    return 10 ** exponent;
  });
  const densities = values.map((value) => value ** -p);
  const ceiling = Math.max(...densities) * 1.08;
  const sx = (value: number) =>
    roundSvgNumber(
      68 + (Math.log10(value / xMin) / Math.log10(xMax / xMin)) * 378,
    );
  const sy = (value: number) =>
    roundSvgNumber(224 - (Math.min(value, ceiling) / ceiling) * 174);
  const curve = densities
    .map(
      (value, index) =>
        `${index === 0 ? "M" : "L"}${sx(values[index]!)} ${sy(value)}`,
    )
    .join("");
  const truncated =
    p === 1
      ? Math.log(bound)
      : tail
        ? (bound ** (1 - p) - 1) / (1 - p)
        : (1 - bound ** (p - 1)) / (1 - p);
  const converges = tail ? p > 1 : p < 1;
  const number = (value: number) =>
    format.number(value, {
      minimumFractionDigits: 3,
      maximumFractionDigits: 4,
    });

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
            {[true, false].map((value) => (
              <Button
                key={String(value)}
                type="button"
                size="sm"
                className="w-full"
                variant={tail === value ? "default" : "outline"}
                aria-pressed={tail === value}
                onClick={() => setTail(value)}
              >
                <IcuMarkdownText
                  value={t.markdown(value ? "tail" : "singular")}
                />
              </Button>
            ))}
          </div>
          <DemoRange
            label={t.markdown("p")}
            value={p}
            display={`$${number(p)}$`}
            min={0.5}
            max={2}
            step={0.1}
            onChange={setP}
          />
          <DemoRange
            label={t.markdown("bound")}
            value={bound}
            display={`$${bound}$`}
            min={2}
            max={200}
            onChange={setBound}
          />
        </>
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown(converges ? "converges" : "diverges")}
        />
      }
    >
      <svg viewBox="0 0 500 270" role="img" aria-label={t("label")}>
        <path
          d={`M68 ${sy(0)}H452M68 ${sy(0)}V34`}
          fill="none"
          stroke="currentColor"
          strokeOpacity=".25"
        />
        <path
          d={`${curve}L${sx(values[120]!)} ${sy(0)}L${sx(values[0]!)} ${sy(0)}Z`}
          fill="currentColor"
          fillOpacity=".18"
        />
        <path d={curve} fill="none" stroke="currentColor" strokeWidth="2.75" />
        <SvgTex x={448} y={210} width={28} source="x" />
        <SvgTex x={22} y={26} width={72} source="x^{-p}" />
        <SvgTex
          x={28}
          y={224}
          width={56}
          source={tail ? "1" : `10^{-${number(Math.log10(bound))}}`}
        />
        <SvgTex
          x={410}
          y={232}
          width={64}
          source={tail ? String(bound) : "1"}
        />
        <SvgTex
          x={296}
          y={30}
          width={142}
          source={String.raw`A=${number(truncated)}`}
        />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <div>
          <Tex
            source={
              tail
                ? String.raw`\int_1^{${bound}}x^{-p}\,\mathrm dx=${number(truncated)}`
                : String.raw`\int_{1/${bound}}^1x^{-p}\,\mathrm dx=${number(truncated)}`
            }
            display
          />
        </div>
      </div>
    </DemoFrame>
  );
}
