"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function MultipleRegressionDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [delta, setDelta] = useState(0.5);
  const x = [-2, -1, 0, 1, 2],
    w = [1, -2, 2, -2, 1];
  const y = x.map((v, i) => v + delta * (w[i] ?? 0));
  const px = (v: number) => 230 + v * 50,
    py = (v: number) => 125 - v * 30;
  const determinant = 700 * delta * delta;
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
          min={0}
          max={1}
          step={0.1}
          onChange={setDelta}
        />
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown(delta === 0 ? "singular" : "fullRank", {
            det: determinant.toFixed(1),
          })}
        />
      }
    >
      <svg
        viewBox="0 0 460 270"
        role="img"
        aria-label={t("graph", {
          delta: delta.toFixed(1),
          det: determinant.toFixed(1),
        })}
      >
        <line
          x1="55"
          y1={py(0)}
          x2="405"
          y2={py(0)}
          stroke="currentColor"
          strokeOpacity=".3"
        />
        <line
          x1={px(0)}
          y1="20"
          x2={px(0)}
          y2="230"
          stroke="currentColor"
          strokeOpacity=".3"
        />
        <line
          x1={px(-2.8)}
          y1={py(-2.8)}
          x2={px(2.8)}
          y2={py(2.8)}
          stroke="currentColor"
          strokeOpacity=".35"
          strokeDasharray="4 4"
        />
        {x.map((v, i) => (
          <circle
            key={i}
            cx={px(v)}
            cy={py(y[i] ?? 0)}
            r="5"
            fill="currentColor"
          />
        ))}
        <SvgTex x={405} y={py(0) + 6} width={40} source={String.raw`x_1`} />
        <SvgTex x={px(0) + 6} y={15} width={40} source={String.raw`x_2`} />
      </svg>
      <div className="px-6 py-4 text-sm">
        <Tex
          source={String.raw`\det(X^{\mathsf T}X)=700\delta^2=${determinant.toFixed(1)}`}
        />
      </div>
    </DemoFrame>
  );
}
