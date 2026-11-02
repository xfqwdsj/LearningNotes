"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import { roundSvgNumber } from "./svg";
import type { DemoComponentProps } from "./types";
export default function SamplingMeanDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [n, setN] = useState(5);
  const xs = Array.from({ length: 241 }, (_, i) => -3 + i / 40);
  const normal = (x: number, sd: number) =>
    Math.exp(-(x * x) / (2 * sd * sd)) / (sd * Math.sqrt(2 * Math.PI));
  const population = xs.map((x) => normal(x, 1));
  const sampling = xs.map((x) => normal(x, 1 / Math.sqrt(n)));
  const ymax = Math.max(...sampling) * 1.1;
  const sx = (x: number) => roundSvgNumber(230 + x * 58);
  const sy = (y: number) => roundSvgNumber(205 - (y / ymax) * 165);
  const line = (ys: number[]) =>
    xs.map((x, i) => `${sx(x)},${sy(ys[i] ?? 0)}`).join(" ");
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <DemoRange
          label={t.markdown("n")}
          value={n}
          display={String(n)}
          min={1}
          max={100}
          onChange={setN}
        />
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", { variance: (1 / n).toFixed(3) })}
        />
      }
    >
      <p className="px-6 pt-4 text-sm">
        <IcuMarkdownText value={t.raw("graphNote") as string} />
      </p>
      <svg
        viewBox="0 0 460 245"
        role="img"
        aria-label={t("graphLabel", { n, variance: (1 / n).toFixed(3) })}
      >
        <line
          x1="55"
          y1="205"
          x2="405"
          y2="205"
          stroke="currentColor"
          strokeOpacity=".35"
        />
        <line
          x1="230"
          y1="35"
          x2="230"
          y2="205"
          stroke="currentColor"
          strokeOpacity=".2"
        />
        <polyline
          points={line(population)}
          fill="none"
          stroke="currentColor"
          strokeOpacity=".5"
          strokeDasharray="5 4"
          strokeWidth="2"
        />
        <polyline
          points={line(sampling)}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <SvgTex x={218} y={210} width={35} source={String.raw`\mu`} />
        <SvgTex x={8} y={30} width={45} source={ymax.toFixed(2)} />
        <SvgTex x={403} y={210} width={25} source="x" />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <p>
          <Tex source={String.raw`E(\bar X)=\mu`} />
        </p>
        <p>
          <Tex
            source={String.raw`\operatorname{Var}(\bar X)=1/n=${(1 / n).toFixed(3)}`}
          />
        </p>
      </div>
    </DemoFrame>
  );
}
