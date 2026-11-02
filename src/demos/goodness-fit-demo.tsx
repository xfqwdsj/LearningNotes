"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function GoodnessFitDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [x, setX] = useState(10);
  const counts = [x, 20 - x, 10, 10, 10, 10];
  const q = counts.reduce((a, v) => a + (v - 10) ** 2 / 10, 0);
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <DemoRange
          label={t.markdown("first")}
          value={x}
          display={String(x)}
          min={0}
          max={20}
          onChange={setX}
        />
      }
      conclusion={
        <IcuMarkdownText value={t.markdown("result", { q: q.toFixed(2) })} />
      }
    >
      <svg
        viewBox="0 0 460 235"
        role="img"
        aria-label={t("graphLabel", { first: x, second: 20 - x })}
      >
        <line
          x1="55"
          y1="185"
          x2="415"
          y2="185"
          stroke="currentColor"
          strokeOpacity=".4"
        />
        {counts.map((count, i) => (
          <g key={i}>
            <rect
              x={70 + i * 55}
              y={185 - count * 8}
              width="34"
              height={count * 8}
              fill="currentColor"
              fillOpacity=".65"
            />
            <SvgTex
              x={70 + i * 55}
              y={190}
              width={34}
              align="center"
              source={String(i + 1)}
            />
          </g>
        ))}
        <line
          x1="55"
          y1="105"
          x2="415"
          y2="105"
          stroke="currentColor"
          strokeOpacity=".8"
          strokeDasharray="5 4"
          strokeWidth="1.5"
        />
        <SvgTex x={19} y={95} width={30} source="10" />
        <SvgTex x={20} y={175} width={25} source="0" />
      </svg>
      <div className="overflow-x-auto px-6 py-4">
        <table className="demo-table">
          <thead>
            <tr>
              <th>
                <IcuMarkdownText value={t.markdown("face")} />
              </th>
              {counts.map((_, i) => (
                <th key={i}>{i + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>
                <IcuMarkdownText value={t.markdown("observed")} />
              </th>
              {counts.map((v, i) => (
                <td key={i}>{v}</td>
              ))}
            </tr>
            <tr>
              <th>
                <IcuMarkdownText value={t.markdown("expected")} />
              </th>
              {counts.map((_, i) => (
                <td key={i}>10</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </DemoFrame>
  );
}
