"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import { roundSvgNumber } from "./svg";
import type { DemoComponentProps } from "./types";
export default function SineLimitDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [x, setX] = useState(0.5);
  const sx = (v: number) => roundSvgNumber(55 + (v / 1.5) * 350),
    sy = (v: number) => roundSvgNumber(205 - v * 155);
  const xs = Array.from({ length: 151 }, (_, i) => 0.001 + i * (1.499 / 150));
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
          min={0.05}
          max={1.5}
          step={0.05}
          onChange={setX}
        />
      }
      conclusion={<IcuMarkdownText value={t.markdown("result")} />}
    >
      <p className="px-6 pt-4 text-sm">
        <IcuMarkdownText value={t.raw("graphNote") as string} />
      </p>
      <svg
        viewBox="0 0 460 245"
        role="img"
        aria-label={t("graphLabel", { x: x.toFixed(2) })}
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
          x1="55"
          y1={sy(1)}
          x2="405"
          y2={sy(1)}
          stroke="currentColor"
          strokeOpacity=".45"
          strokeDasharray="2 3"
        />
        <polyline
          points={line(Math.cos)}
          fill="none"
          stroke="currentColor"
          strokeOpacity=".55"
          strokeWidth="2"
          strokeDasharray="6 4"
        />
        <polyline
          points={line((v) => Math.sin(v) / v)}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <line
          x1={sx(x)}
          y1="40"
          x2={sx(x)}
          y2="205"
          stroke="currentColor"
          strokeOpacity=".2"
        />
        {[Math.cos(x), Math.sin(x) / x, 1].map((v, i) => (
          <circle
            key={i}
            cx={sx(x)}
            cy={sy(v)}
            r="4"
            fill={i === 1 ? "currentColor" : "var(--background)"}
            stroke="currentColor"
            strokeWidth="1.5"
          />
        ))}
        <SvgTex x={25} y={sy(1) - 10} width={25} source="1" />
        <SvgTex x={405} y={210} width={25} source="x" />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <p>
          <Tex source={String.raw`\cos x\approx${Math.cos(x).toFixed(5)}`} />
        </p>
        <p>
          <Tex
            source={String.raw`\frac{\sin x}{x}\approx${(Math.sin(x) / x).toFixed(5)}`}
          />
        </p>
        <p>
          <Tex source={String.raw`1=1`} />
        </p>
      </div>
    </DemoFrame>
  );
}
