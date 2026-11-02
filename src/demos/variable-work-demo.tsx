"use client";

import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

export default function VariableWorkDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [k, setK] = useState(2);
  const [a, setA] = useState(3);
  const work = (k * a * a) / 2;
  const ceiling = Math.max(1, k * 5);
  const sx = (value: number) => roundSvgNumber(62 + (value / 5) * 388);
  const sy = (value: number) => roundSvgNumber(226 - (value / ceiling) * 176);
  const area = `M${sx(0)} ${sy(0)}${Array.from({ length: 61 }, (_, index) => {
    const x = (a * index) / 60;
    return `L${sx(x)} ${sy(k * x)}`;
  }).join("")}L${sx(a)} ${sy(0)}Z`;
  const number = (value: number) =>
    format.number(value, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label={t.markdown("k")}
            value={k}
            display={`$${number(k)}$`}
            min={0}
            max={5}
            step={0.5}
            onChange={setK}
          />
          <DemoRange
            label={t.markdown("a")}
            value={a}
            display={`$${number(a)}$`}
            min={0}
            max={5}
            step={0.1}
            onChange={setA}
          />
        </>
      }
      conclusion={
        <IcuMarkdownText value={t.markdown("result", { work: number(work) })} />
      }
    >
      <svg viewBox="0 0 500 280" role="img" aria-label={t("label")}>
        <path d={area} fill="currentColor" fillOpacity=".2" />
        <path
          d={`M${sx(0)} ${sy(0)}H${sx(5)}M${sx(0)} ${sy(0)}V${sy(ceiling)}`}
          fill="none"
          stroke="currentColor"
          strokeOpacity=".3"
        />
        <path
          d={`M${sx(0)} ${sy(0)}L${sx(5)} ${sy(k * 5)}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <line
          x1={sx(a)}
          y1={sy(0)}
          x2={sx(a)}
          y2={sy(k * a)}
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx={sx(a)} cy={sy(k * a)} r="5" fill="currentColor" />
        <SvgTex x={452} y={211} width={28} source="x" />
        <SvgTex x={20} y={46} width={34} source="F" />
        <SvgTex x={421} y={43} width={70} source="F=kx" />
        <SvgTex
          x={Math.min(396, sx(a) + 8)}
          y={sy((k * a) / 2) - 18}
          width={76}
          source={String.raw`W=${number(work)}`}
        />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <div>
          <Tex
            source={String.raw`W=\int_0^a kx\,\mathrm dx=\frac{ka^2}{2}=${number(work)}`}
            display
          />
        </div>
      </div>
    </DemoFrame>
  );
}
