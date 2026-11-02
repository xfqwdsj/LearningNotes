"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function EstimatorConsistencyDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [n, setN] = useState(4);
  const [epsilon, setEpsilon] = useState(0.2);
  const p = (1 - epsilon) ** n;
  const sx = (x: number) => 55 + ((x - 1) / 29) * 350;
  const sy = (y: number) => 200 - y * 160;
  const points = Array.from({ length: 30 }, (_, i) => i + 1)
    .map((k) => `${sx(k)},${sy((1 - epsilon) ** k)}`)
    .join(" ");
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label={t.markdown("n")}
            value={n}
            display={String(n)}
            min={1}
            max={30}
            onChange={setN}
          />
          <DemoRange
            label={t.markdown("epsilon")}
            value={epsilon}
            display={epsilon.toFixed(1)}
            min={0.1}
            max={0.9}
            step={0.1}
            onChange={setEpsilon}
          />
        </>
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", { probability: p.toFixed(4) })}
        />
      }
    >
      <p className="px-6 pt-4 text-sm">
        <IcuMarkdownText value={t.raw("graphNote") as string} />
      </p>
      <svg
        viewBox="0 0 460 240"
        role="img"
        aria-label={t("graphLabel", {
          n,
          epsilon: epsilon.toFixed(1),
          probability: p.toFixed(4),
        })}
      >
        <line
          x1="55"
          y1="200"
          x2="405"
          y2="200"
          stroke="currentColor"
          strokeOpacity=".35"
        />
        <line
          x1="55"
          y1="40"
          x2="55"
          y2="200"
          stroke="currentColor"
          strokeOpacity=".35"
        />
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <line
          x1={sx(n)}
          y1="40"
          x2={sx(n)}
          y2="200"
          stroke="currentColor"
          strokeOpacity=".25"
        />
        <circle cx={sx(n)} cy={sy(p)} r="5" fill="currentColor" />
        <SvgTex x={22} y={30} width={25} source="1" />
        <SvgTex x={22} y={190} width={25} source="0" />
        <SvgTex x={45} y={205} width={25} source="1" />
        <SvgTex x={390} y={205} width={32} source="30" />
        <SvgTex x={415} y={205} width={25} source="n" />
      </svg>
      <div className="px-6 py-4 text-sm">
        <Tex
          source={String.raw`P(1-X_{(n)}\ge\varepsilon)=(1-\varepsilon)^n=${p.toFixed(4)}`}
        />
      </div>
    </DemoFrame>
  );
}
