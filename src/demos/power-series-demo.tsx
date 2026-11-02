"use client";
import { useId, useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function PowerSeriesDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [x, setX] = useState(0.5);
  const [n, setN] = useState(10);
  const clipId = useId();
  const sum = Array.from(
    { length: n },
    (_, i) => x ** (i + 1) / (i + 1),
  ).reduce((a, b) => a + b, 0);
  const status =
    x === -1
      ? "left"
      : x === 1
        ? "right"
        : Math.abs(x) < 1
          ? "inside"
          : "outside";
  const graphX = (value: number) => 230 + (value / 1.2) * 180;
  const graphY = (value: number) => 115 - (value / 3) * 90;
  const curve = Array.from({ length: 121 }, (_, i) => {
    const value = -1.2 + (i * 2.4) / 120;
    const partial = Array.from(
      { length: n },
      (_, j) => value ** (j + 1) / (j + 1),
    ).reduce((a, b) => a + b, 0);
    return `${graphX(value)},${graphY(partial)}`;
  }).join(" ");
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label={t.markdown("x")}
            value={x}
            display={x.toFixed(1)}
            min={-1.2}
            max={1.2}
            step={0.1}
            onChange={setX}
          />
          <DemoRange
            label={t.markdown("n")}
            value={n}
            display={String(n)}
            min={1}
            max={100}
            onChange={setN}
          />
        </>
      }
      conclusion={<IcuMarkdownText value={t.markdown(status)} />}
    >
      <p className="px-6 pt-4 text-sm">
        <IcuMarkdownText value={t.raw("graphNote") as string} />
      </p>
      <svg
        viewBox="0 0 460 235"
        role="img"
        aria-label={t("graphLabel", { x, n, sum: sum.toFixed(4) })}
      >
        <defs>
          <clipPath id={clipId}>
            <rect x="50" y="25" width="360" height="180" />
          </clipPath>
        </defs>
        <line
          x1="50"
          y1="115"
          x2="410"
          y2="115"
          stroke="currentColor"
          opacity=".3"
        />
        <line
          x1="230"
          y1="25"
          x2="230"
          y2="205"
          stroke="currentColor"
          opacity=".3"
        />
        {[-1, 1].map((boundary) => (
          <line
            key={boundary}
            x1={graphX(boundary)}
            y1="25"
            x2={graphX(boundary)}
            y2="205"
            stroke="currentColor"
            opacity=".3"
            strokeDasharray="4 4"
          />
        ))}
        <g clipPath={`url(#${clipId})`}>
          <polyline
            points={curve}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx={graphX(x)} cy={graphY(sum)} r="5" fill="currentColor" />
        </g>
        <SvgTex x={graphX(-1) - 12} y={208} width={30} source="-1" />
        <SvgTex x={graphX(1) - 5} y={208} width={25} source="1" />
        <SvgTex x={415} y={120} width={25} source="x" />
      </svg>
      <div className="px-6 py-4 text-sm">
        <Tex source={String.raw`S_n(x)=${sum.toFixed(4)}`} />
      </div>
    </DemoFrame>
  );
}
