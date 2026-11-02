"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function ContingencyDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [x, setX] = useState(10);
  const q = (4 * (x - 10) ** 2) / 10;
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
      <p className="px-6 pt-4 text-sm">
        <IcuMarkdownText value={t.raw("graphNote") as string} />
      </p>
      <svg
        viewBox="0 0 460 270"
        role="img"
        aria-label={t("graphLabel", { first: x, second: 20 - x })}
      >
        {[x, 20 - x].map((count, i) => (
          <g key={i}>
            <rect
              x={90 + i * 120}
              y="25"
              width="120"
              height={count * 10}
              fill="currentColor"
              fillOpacity=".65"
            />
            <rect
              x={90 + i * 120}
              y={25 + count * 10}
              width="120"
              height={200 - count * 10}
              fill="currentColor"
              fillOpacity=".13"
            />
            <rect
              x={90 + i * 120}
              y="25"
              width="120"
              height="200"
              fill="none"
              stroke="currentColor"
              strokeOpacity=".5"
            />
            <SvgTex
              x={90 + i * 120}
              y={230}
              width={120}
              align="center"
              source={String.raw`B_${i + 1}`}
            />
          </g>
        ))}
        <line
          x1="90"
          y1="125"
          x2="330"
          y2="125"
          stroke="var(--background)"
          strokeWidth="4"
        />
        <line
          x1="90"
          y1="125"
          x2="330"
          y2="125"
          stroke="currentColor"
          strokeDasharray="5 4"
          strokeWidth="1.5"
        />
        <SvgTex x={42} y={52} width={35} source="A_1" />
        <SvgTex x={42} y={176} width={35} source="A_2" />
      </svg>
      <div className="overflow-x-auto px-6 py-4">
        <table className="demo-table">
          <thead>
            <tr>
              <th></th>
              <th>
                <Tex source="B_1" />
              </th>
              <th>
                <Tex source="B_2" />
              </th>
              <th>
                <IcuMarkdownText value={t.markdown("total")} />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>
                <Tex source="A_1" />
              </th>
              <td>{x}</td>
              <td>{20 - x}</td>
              <td>20</td>
            </tr>
            <tr>
              <th>
                <Tex source="A_2" />
              </th>
              <td>{20 - x}</td>
              <td>{x}</td>
              <td>20</td>
            </tr>
            <tr>
              <th>
                <IcuMarkdownText value={t.markdown("total")} />
              </th>
              <td>20</td>
              <td>20</td>
              <td>40</td>
            </tr>
          </tbody>
        </table>
      </div>
    </DemoFrame>
  );
}
