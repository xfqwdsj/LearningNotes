"use client";

import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

export default function EmpiricalCdfDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [x, setX] = useState(4);
  const sample = [2, 4, 4, 6, 9];
  const count = sample.filter((value) => value <= x).length;
  const probability = count / sample.length;
  const sx = (value: number) => roundSvgNumber(66 + value * 36);
  const sy = (value: number) => roundSvgNumber(230 - value * 176);
  const steps = [
    `M${sx(0)} ${sy(0)}`,
    ...sample.flatMap((value) => [
      `H${sx(value)}`,
      `V${sy(sample.filter((item) => item <= value).length / sample.length)}`,
    ]),
    `H${sx(10)}`,
  ].join("");
  const number = (value: number) =>
    format.number(value, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 2,
    });

  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <DemoRange
          label={t.markdown("x")}
          value={x}
          display={`$${x}$`}
          min={0}
          max={10}
          onChange={setX}
        />
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", { count, value: number(probability) })}
        />
      }
    >
      <svg viewBox="0 0 500 280" role="img" aria-label={t("label")}>
        <path
          d={`M66 ${sy(0)}H440M66 ${sy(0)}V38`}
          fill="none"
          stroke="currentColor"
          strokeOpacity=".25"
        />
        <path d={steps} fill="none" stroke="currentColor" strokeWidth="2.75" />
        {sample.map((value, index) => (
          <circle
            key={index}
            cx={sx(value)}
            cy={250}
            r="4"
            fill="currentColor"
            opacity=".75"
          />
        ))}
        <line
          x1={sx(x)}
          y1="38"
          x2={sx(x)}
          y2="255"
          stroke="currentColor"
          strokeOpacity=".45"
          strokeDasharray="4 4"
        />
        <circle cx={sx(x)} cy={sy(probability)} r="6" fill="currentColor" />
        {[0, 2, 4, 6, 8, 10].map((tick) => (
          <SvgTex
            key={tick}
            x={sx(tick) - 9}
            y={236}
            width={34}
            source={String(tick)}
          />
        ))}
        {[0, 0.5, 1].map((tick) => (
          <SvgTex
            key={tick}
            x={33}
            y={sy(tick) - 10}
            width={30}
            source={String(tick)}
          />
        ))}
        <SvgTex x={438} y={214} width={34} source="x" />
        <SvgTex x={20} y={26} width={78} source="F_5(x)" />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <div>
          <Tex
            source={String.raw`F_5(${x})=\frac1{5}\sum_{i=1}^5 1_{\{X_i\le${x}\}}=${number(probability)}`}
            display
          />
        </div>
      </div>
    </DemoFrame>
  );
}
