"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function ConditionalDiceDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [a, setA] = useState(4),
    [b, setB] = useState(3);
  const relevant = 7 - b,
    intersection = 7 - Math.max(a, b),
    p = intersection / relevant;
  const thresholdsCoincide = a === b;
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label={t.markdown("a")}
            value={a}
            display={String(a)}
            min={1}
            max={6}
            onChange={setA}
          />
          <DemoRange
            label={t.markdown("b")}
            value={b}
            display={String(b)}
            min={1}
            max={6}
            onChange={setB}
          />
        </>
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", {
            intersection,
            relevant,
            value: format.number(p, { maximumFractionDigits: 3 }),
          })}
        />
      }
    >
      <svg
        viewBox="0 0 460 290"
        role="img"
        aria-label={t("graph", { a, b, intersection, relevant })}
      >
        <rect
          x="64"
          y="86"
          width="32"
          height="20"
          rx="3"
          fill="currentColor"
          fillOpacity=".48"
        />
        <SvgTex x={106} y={83} width={104} source={String.raw`A\cap B`} />
        <rect
          x="238"
          y="86"
          width="32"
          height="20"
          rx="3"
          fill="currentColor"
          fillOpacity=".18"
        />
        <SvgTex x={280} y={83} width={62} source="B" />
        <line
          x1="78"
          y1="235"
          x2="412"
          y2="235"
          stroke="currentColor"
          strokeOpacity=".35"
        />
        {[1, 2, 3, 4, 5, 6].map((n) => {
          const x = 72 + (n - 1) * 58;
          const inA = n >= a;
          const inB = n >= b;
          const fillOpacity = inA && inB ? 0.48 : inB ? 0.18 : 0.05;
          return (
            <g key={n}>
              <rect
                x={x}
                y="128"
                width="48"
                height="82"
                rx="7"
                fill="currentColor"
                fillOpacity={fillOpacity}
                stroke="currentColor"
                strokeOpacity={inB ? ".8" : ".25"}
                strokeWidth={inB ? "1.8" : "1"}
              />
              <SvgTex x={x + 12} y={151} width={24} source={String(n)} />
            </g>
          );
        })}
        <line
          x1={96 + (b - 1) * 58}
          y1="112"
          x2={96 + (b - 1) * 58}
          y2="220"
          stroke="currentColor"
          strokeDasharray="5 4"
          strokeOpacity=".65"
        />
        {!thresholdsCoincide && (
          <line
            x1={96 + (a - 1) * 58}
            y1="118"
            x2={96 + (a - 1) * 58}
            y2="220"
            stroke="currentColor"
            strokeDasharray="2 4"
            strokeOpacity=".65"
          />
        )}
        {thresholdsCoincide ? (
          <SvgTex
            x={96 + (a - 1) * 58 - 62}
            y={246}
            width={132}
            source={String.raw`\omega\ge a=b`}
          />
        ) : (
          <>
            <SvgTex
              x={96 + (b - 1) * 58 - 44}
              y={246}
              width={72}
              source={String.raw`\omega\ge b`}
            />
            <SvgTex
              x={96 + (a - 1) * 58 + 8}
              y={246}
              width={72}
              source={String.raw`\omega\ge a`}
            />
          </>
        )}
        <SvgTex x={26} y={128} width={34} source={String.raw`\omega`} />
      </svg>
      <div className="px-6 pb-4 text-sm">
        <IcuMarkdownText
          value={t.markdown("range", {
            notCondition: 6 - relevant,
            conditionOnly: relevant - intersection,
            intersection,
          })}
        />
      </div>
    </DemoFrame>
  );
}
