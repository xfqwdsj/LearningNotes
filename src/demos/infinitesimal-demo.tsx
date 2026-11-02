"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import { roundSvgNumber } from "./svg";
import type { DemoComponentProps } from "./types";
export default function InfinitesimalDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [x, setX] = useState(0.5);
  const ratio = (v: number) => (Math.sin(v) - v) / v ** 3,
    sx = (v: number) => roundSvgNumber(55 + v * 350),
    sy = (v: number) => roundSvgNumber(200 - ((v + 0.2) / 0.25) * 160);
  const curve = Array.from({ length: 151 }, (_, i) => 0.05 + (0.95 * i) / 150)
    .map((v) => `${sx(v)},${sy(ratio(v))}`)
    .join(" ");
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
          max={1}
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
        aria-label={t("graphLabel", {
          x: x.toFixed(2),
          value: ratio(x).toFixed(5),
        })}
      >
        <line
          x1="55"
          y1={sy(0)}
          x2="405"
          y2={sy(0)}
          stroke="currentColor"
          strokeOpacity=".4"
          strokeDasharray="5 4"
        />
        <line
          x1="55"
          y1={sy(-1 / 6)}
          x2="405"
          y2={sy(-1 / 6)}
          stroke="currentColor"
          strokeOpacity=".3"
          strokeDasharray="2 3"
        />
        <polyline
          points={curve}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <circle cx={sx(x)} cy={sy(ratio(x))} r="5" fill="currentColor" />
        <SvgTex x={22} y={sy(0) - 10} width={25} source="0" />
        <SvgTex
          x={10}
          y={sy(-1 / 6) - 10}
          width={40}
          source={String.raw`-\frac16`}
        />
        <SvgTex x={405} y={205} width={25} source="x" />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <p>
          <Tex
            source={String.raw`\frac{\sin x}{x}=${(Math.sin(x) / x).toFixed(5)}`}
          />
        </p>
        <p>
          <Tex
            source={String.raw`\frac{\sin x-x}{x^3}=${((Math.sin(x) - x) / x ** 3).toFixed(5)}`}
          />
        </p>
      </div>
    </DemoFrame>
  );
}
