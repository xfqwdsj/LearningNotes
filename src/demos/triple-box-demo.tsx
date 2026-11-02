"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function TripleBoxDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [a, setA] = useState(2),
    [b, setB] = useState(3),
    [c, setC] = useState(1);
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
            max={5}
            onChange={setA}
          />
          <DemoRange
            label={t.markdown("b")}
            value={b}
            display={String(b)}
            min={1}
            max={5}
            onChange={setB}
          />
          <DemoRange
            label={t.markdown("c")}
            value={c}
            display={String(c)}
            min={1}
            max={5}
            onChange={setC}
          />
        </>
      }
      conclusion={
        <IcuMarkdownText value={t.markdown("result", { volume: a * b * c })} />
      }
    >
      <svg
        viewBox="0 0 440 300"
        role="img"
        aria-label={t("graphLabel", { a, b, c })}
      >
        <polygon
          points={`${165},205 ${165 + 30 * a},205 ${165 + 30 * a - 18 * b},${205 + 11 * b} ${165 - 18 * b},${205 + 11 * b}`}
          fill="currentColor"
          fillOpacity=".06"
          stroke="currentColor"
          strokeOpacity=".5"
        />
        <polygon
          points={`${165},${205 - 30 * c} ${165 + 30 * a},${205 - 30 * c} ${165 + 30 * a - 18 * b},${205 + 11 * b - 30 * c} ${165 - 18 * b},${205 + 11 * b - 30 * c}`}
          fill="currentColor"
          fillOpacity=".18"
          stroke="currentColor"
        />
        {(
          [
            [165, 205],
            [165 + 30 * a, 205],
            [165 - 18 * b, 205 + 11 * b],
            [165 + 30 * a - 18 * b, 205 + 11 * b],
          ] as const
        ).map(([x, y], i) => (
          <line
            key={i}
            x1={x}
            y1={y}
            x2={x}
            y2={y - 30 * c}
            stroke="currentColor"
            strokeOpacity=".7"
          />
        ))}
        <SvgTex x={165 + 15 * a} y={210} width={38} source="a" />
        <SvgTex x={145 - 9 * b} y={210 + 6 * b} width={38} source="b" />
        <SvgTex x={170 + 30 * a} y={195 - 15 * c} width={38} source="c" />
      </svg>
      <div className="px-6 py-4 text-sm">
        <Tex
          source={String.raw`\int_0^a\int_0^b\int_0^c1\,\mathrm dz\,\mathrm dy\,\mathrm dx=${a}\times${b}\times${c}`}
          display
        />
      </div>
    </DemoFrame>
  );
}
