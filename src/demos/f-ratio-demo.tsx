"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import { fDensity } from "./distribution-density";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

const xMin = 0.01;
const xMax = 100;
const baseline = 220;

export default function FRatioDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [numerator, setNumerator] = useState(4);
  const [denominator, setDenominator] = useState(8);
  const values = Array.from({ length: 241 }, (_, index) => {
    const exponent = Math.log10(xMin) + (index / 240) * Math.log10(xMax / xMin);
    return 10 ** exponent;
  });
  const direct = values.map((value) => fDensity(value, numerator, denominator));
  const swapped = values.map((value) =>
    fDensity(value, denominator, numerator),
  );
  const ceiling = Math.max(...direct, ...swapped) * 1.08;
  const sx = (value: number) =>
    roundSvgNumber(
      52 + (Math.log10(value / xMin) / Math.log10(xMax / xMin)) * 402,
    );
  const sy = (value: number) =>
    roundSvgNumber(baseline - (value / ceiling) * 160);
  const curve = (density: number[]) =>
    density
      .map(
        (value, index) =>
          `${index === 0 ? "M" : "L"}${sx(values[index]!)} ${sy(value)}`,
      )
      .join(" ");
  const number = (value: number) => format.number(value);
  const directCurve = curve(direct);
  const swappedCurve = curve(swapped);

  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label={t.markdown("numerator")}
            value={numerator}
            display={`$\\nu_1=${numerator}$`}
            min={1}
            max={20}
            onChange={setNumerator}
          />
          <DemoRange
            label={t.markdown("denominator")}
            value={denominator}
            display={`$\\nu_2=${denominator}$`}
            min={1}
            max={20}
            onChange={setDenominator}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setNumerator(4);
              setDenominator(8);
            }}
          >
            <RotateCcw />
            <IcuMarkdownText value={t.markdown("reset")} />
          </Button>
        </>
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", {
            first: number(numerator),
            second: number(denominator),
          })}
        />
      }
    >
      <svg
        viewBox="0 0 520 285"
        role="img"
        aria-label={t("graphLabel", {
          first: number(numerator),
          second: number(denominator),
        })}
      >
        <line
          x1={sx(xMin)}
          y1={baseline}
          x2={sx(xMax)}
          y2={baseline}
          stroke="currentColor"
          strokeOpacity=".4"
        />
        <path
          d={`${directCurve}L${sx(xMax)} ${baseline}L${sx(xMin)} ${baseline}Z`}
          fill="currentColor"
          fillOpacity=".11"
        />
        <path
          d={`${swappedCurve}L${sx(xMax)} ${baseline}L${sx(xMin)} ${baseline}Z`}
          fill="currentColor"
          fillOpacity=".035"
        />
        <path
          d={directCurve}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.75"
        />
        <path
          d={swappedCurve}
          fill="none"
          stroke="currentColor"
          strokeOpacity=".68"
          strokeWidth="2"
          strokeDasharray="7 4"
        />
        <line
          x1={sx(1)}
          y1="48"
          x2={sx(1)}
          y2={baseline}
          stroke="currentColor"
          strokeOpacity=".2"
          strokeDasharray="4 4"
        />
        <line
          x1="342"
          y1="38"
          x2="363"
          y2="38"
          stroke="currentColor"
          strokeWidth="2.75"
        />
        <SvgTex x={369} y={26} width={96} source={String.raw`F(\nu_1,\nu_2)`} />
        <line
          x1="342"
          y1="61"
          x2="363"
          y2="61"
          stroke="currentColor"
          strokeOpacity=".68"
          strokeWidth="2"
          strokeDasharray="7 4"
        />
        <SvgTex x={369} y={49} width={96} source={String.raw`F(\nu_2,\nu_1)`} />
        {[0.01, 0.1, 1, 10, 100].map((tick) => (
          <SvgTex
            key={tick}
            x={sx(tick) - 24}
            y={baseline + 7}
            width={48}
            align="center"
            source={
              tick === 0.01
                ? "10^{-2}"
                : tick === 0.1
                  ? "10^{-1}"
                  : tick === 10
                    ? "10"
                    : tick === 100
                      ? "10^2"
                      : "1"
            }
          />
        ))}
        <SvgTex x={10} y={28} width={56} source="f(x)" />
        <SvgTex x={466} y={baseline + 8} width={30} source="x" />
      </svg>
    </DemoFrame>
  );
}
