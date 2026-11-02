"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import { roundSvgNumber } from "./svg";
import type { DemoComponentProps } from "./types";
export default function NormalConditionalDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [rho, setRho] = useState(0.5),
    [y, setY] = useState(1);
  const mean = rho * y,
    variance = 1 - rho * rho,
    sd = Math.sqrt(variance);
  const num = (v: number) => format.number(v, { maximumFractionDigits: 3 });
  const path = Array.from({ length: 101 }, (_, i) => {
    const x = -4 + (8 * i) / 100,
      d =
        Math.exp(-0.5 * ((x - mean) / sd) ** 2) / (sd * Math.sqrt(2 * Math.PI));
    return `${i ? "L" : "M"}${roundSvgNumber(40 + i * 3.8)} ${roundSvgNumber(220 - Math.min(d, 1.4) * 125)}`;
  }).join(" ");
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label={t.markdown("rho")}
            value={rho}
            display={num(rho)}
            min={-0.95}
            max={0.95}
            step={0.05}
            onChange={setRho}
          />
          <DemoRange
            label={t.markdown("condition")}
            value={y}
            display={num(y)}
            min={-3}
            max={3}
            step={0.25}
            onChange={setY}
          />
        </>
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", {
            mean: num(mean),
            variance: num(variance),
          })}
        />
      }
    >
      <svg
        viewBox="0 0 460 260"
        role="img"
        aria-label={t("diagram", { mean: num(mean), variance: num(variance) })}
      >
        <path
          d="M40 30 V220 H420"
          fill="none"
          stroke="currentColor"
          opacity=".3"
        />
        <path d={path} fill="none" stroke="currentColor" strokeWidth="3" />
        <SvgTex x={30} y={225} width={35} source="-4" />
        <SvgTex x={220} y={225} width={25} source="0" />
        <SvgTex x={400} y={225} width={25} source="4" />
      </svg>
    </DemoFrame>
  );
}
