"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import { roundSvgNumber } from "./svg";
import type { DemoComponentProps } from "./types";
export default function PowerExponentialDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [x, setX] = useState(0.2);
  const exponent = x * Math.log(x);
  const sx = (v: number) => roundSvgNumber(55 + v * 350),
    sy = (v: number) => roundSvgNumber(190 - v * 115);
  const xs = Array.from({ length: 151 }, (_, i) => 0.01 + (0.99 * i) / 150);
  const line = (f: (v: number) => number) =>
    xs.map((v) => `${sx(v)},${sy(f(v))}`).join(" ");
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <DemoRange
          label={t.markdown("x")}
          value={x}
          display={x.toFixed(2)}
          min={0.01}
          max={1}
          step={0.01}
          onChange={setX}
        />
      }
      conclusion={<IcuMarkdownText value={t.markdown("result")} />}
    >
      <p className="px-6 pt-4 text-sm">
        <IcuMarkdownText value={t.raw("graphNote") as string} />
      </p>
      <svg
        viewBox="0 0 460 250"
        role="img"
        aria-label={t("graphLabel", {
          x: x.toFixed(2),
          power: (x ** x).toFixed(3),
          exponent: exponent.toFixed(3),
        })}
      >
        <line
          x1="55"
          y1={sy(0)}
          x2="405"
          y2={sy(0)}
          stroke="currentColor"
          strokeOpacity=".35"
        />
        <polyline
          points={line((v) => v ** v)}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <polyline
          points={line((v) => v * Math.log(v))}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeOpacity=".55"
          strokeDasharray="5 4"
        />
        <circle cx={sx(x)} cy={sy(x ** x)} r="4" fill="currentColor" />
        <circle
          cx={sx(x)}
          cy={sy(exponent)}
          r="4"
          fill="var(--background)"
          stroke="currentColor"
          strokeWidth="2"
        />
        <SvgTex x={24} y={sy(1) - 10} width={25} source="1" />
        <SvgTex x={24} y={sy(0) - 10} width={25} source="0" />
        <SvgTex x={405} y={sy(0) + 4} width={25} source="x" />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <p>
          <Tex source={String.raw`x\ln x=${exponent.toFixed(4)}`} />
        </p>
        <p>
          <Tex
            source={String.raw`x^x=e^{x\ln x}=${Math.exp(exponent).toFixed(4)}`}
          />
        </p>
      </div>
    </DemoFrame>
  );
}
