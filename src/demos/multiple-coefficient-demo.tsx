"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function MultipleCoefficientDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [delta, setDelta] = useState(0.5);
  const x = [-2, -1, 0, 1, 2],
    w = [1, -2, 2, -2, 1];
  const factor = 10 / (10 + 14 * delta * delta);
  const residual = x.map((v, i) => v - factor * (v + delta * (w[i] ?? 0)));
  const remaining = (140 * delta * delta) / (10 + 14 * delta * delta);
  const se = Math.sqrt(1.25 / remaining);
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <DemoRange
          label={t.markdown("delta")}
          value={delta}
          display={delta.toFixed(1)}
          min={0.1}
          max={1}
          step={0.1}
          onChange={setDelta}
        />
      }
      conclusion={
        <IcuMarkdownText value={t.markdown("result", { se: se.toFixed(3) })} />
      }
    >
      <svg
        viewBox="0 0 460 235"
        role="img"
        aria-label={t("graph", { delta: delta.toFixed(1), se: se.toFixed(3) })}
      >
        <line
          x1="55"
          y1="120"
          x2="405"
          y2="120"
          stroke="currentColor"
          strokeOpacity=".4"
          strokeDasharray="4 4"
        />
        <line
          x1="230"
          y1="25"
          x2="230"
          y2="210"
          stroke="currentColor"
          strokeOpacity=".2"
        />
        {x.map((v, i) => (
          <circle
            key={i}
            cx={230 + v * 70}
            cy={120 - (residual[i] ?? 0) * 55}
            r="5"
            fill="currentColor"
          />
        ))}
        <SvgTex x={410} y={124} width={30} source={String.raw`x_1`} />
        <SvgTex x={190} y={17} width={40} source="r" />
        <SvgTex x={25} y={110} width={25} source="0" />
      </svg>
      <div className="px-6 py-4 text-sm">
        <Tex
          source={String.raw`L_{\mathrm{remaining}}=${remaining.toFixed(3)},\quad s\sqrt{c_{11}}=${se.toFixed(3)}`}
        />
      </div>
    </DemoFrame>
  );
}
