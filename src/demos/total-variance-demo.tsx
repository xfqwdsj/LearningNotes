"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function TotalVarianceDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [w, setW] = useState(0.5),
    [p, setP] = useState(0.2),
    [q, setQ] = useState(0.8);
  const within = w * p * (1 - p) + (1 - w) * q * (1 - q),
    between = w * (1 - w) * (p - q) ** 2,
    total = within + between;
  const num = (v: number) => format.number(v, { maximumFractionDigits: 3 });
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label={t.markdown("weight")}
            value={w}
            display={num(w)}
            min={0.05}
            max={0.95}
            step={0.05}
            onChange={setW}
          />
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
            label={t.markdown("second")}
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
            within: num(within),
            between: num(between),
            total: num(total),
          })}
        />
      }
    >
      <svg
        viewBox="0 0 460 120"
        role="img"
        aria-label={t("diagram", {
          within: num(within),
          between: num(between),
        })}
      >
        <rect
          x="50"
          y="30"
          width="360"
          height="30"
          fill="currentColor"
          opacity=".1"
        />
        <rect
          x="50"
          y="30"
          width={(360 * within) / 0.25}
          height="30"
          fill="currentColor"
          opacity=".45"
        />
        <rect
          x={50 + (360 * within) / 0.25}
          y="30"
          width={(360 * between) / 0.25}
          height="30"
          fill="currentColor"
          opacity=".8"
        />
        <SvgTex x={42} y={70} width={35} source="0" />
        <SvgTex x={375} y={70} width={65} source="0.25" />
      </svg>
    </DemoFrame>
  );
}
