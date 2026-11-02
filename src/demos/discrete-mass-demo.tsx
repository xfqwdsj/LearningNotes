"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function DiscreteMassDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [p, setP] = useState(0.2),
    [q, setQ] = useState(0.5);
  const vals = [p, (1 - p) * q, (1 - p) * (1 - q)];
  const num = (v: number) => format.number(v, { maximumFractionDigits: 3 });
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label={t.markdown("first")}
            value={p}
            display={num(p)}
            min={0}
            max={1}
            step={0.05}
            onChange={setP}
          />
          <DemoRange
            label={t.markdown("share")}
            value={q}
            display={num(q)}
            min={0}
            max={1}
            step={0.05}
            onChange={setQ}
          />
        </>
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", {
            a: num(vals[0]!),
            b: num(vals[1]!),
            c: num(vals[2]!),
          })}
        />
      }
    >
      <svg
        viewBox="0 0 460 190"
        role="img"
        aria-label={t("diagram", {
          a: num(vals[0]!),
          b: num(vals[1]!),
          c: num(vals[2]!),
        })}
      >
        <line
          x1="50"
          y1="145"
          x2="410"
          y2="145"
          stroke="currentColor"
          opacity=".3"
        />
        {vals.map((v, i) => (
          <g key={i}>
            <rect
              x={90 + 110 * i}
              y={145 - 100 * v}
              width="55"
              height={100 * v}
              fill="currentColor"
              opacity=".65"
            />
            <SvgTex
              x={90 + 110 * i}
              y={150}
              width={55}
              align="center"
              source={String(i)}
            />
          </g>
        ))}
      </svg>
    </DemoFrame>
  );
}
