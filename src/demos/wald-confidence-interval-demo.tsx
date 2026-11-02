"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function WaldConfidenceIntervalDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [n, setN] = useState(20);
  const [k, setK] = useState(1);
  const count = Math.min(k, n),
    p = count / n,
    half = 1.96 * Math.sqrt((p * (1 - p)) / n);
  const lo = p - half,
    hi = p + half,
    center = p;
  const scale = (v: number) => 45 + (370 * (v + 0.2)) / 1.4;
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label={t.markdown("n")}
            value={n}
            display={String(n)}
            min={10}
            max={50}
            onChange={(value) => {
              setN(value);
              setK((current) => Math.min(current, value));
            }}
          />
          <DemoRange
            label={t.markdown("k")}
            value={count}
            display={String(count)}
            min={0}
            max={n}
            onChange={setK}
          />
        </>
      }
      conclusion={
        <IcuMarkdownText
          value={
            t.raw(count === 0 || count === n ? "boundary" : "result") as string
          }
        />
      }
    >
      <svg
        viewBox="0 0 460 180"
        role="img"
        aria-label={t("graph", {
          lo: lo.toFixed(3),
          hi: hi.toFixed(3),
          center: center.toFixed(3),
        })}
      >
        <line
          x1="45"
          y1="110"
          x2="415"
          y2="110"
          stroke="currentColor"
          strokeOpacity=".3"
        />
        {[0, 1].map((v) => (
          <g key={v}>
            <line
              x1={scale(v)}
              y1="35"
              x2={scale(v)}
              y2="140"
              stroke="currentColor"
              strokeOpacity=".45"
              strokeDasharray="4 4"
            />
            <SvgTex x={scale(v) - 8} y={145} width={24} source={String(v)} />
          </g>
        ))}
        <line
          x1={scale(lo)}
          y1="95"
          x2={scale(hi)}
          y2="95"
          stroke="currentColor"
          strokeWidth="5"
        />
        <circle cx={scale(lo)} cy="95" r="3" fill="currentColor" />
        <circle cx={scale(hi)} cy="95" r="3" fill="currentColor" />
        <circle cx={scale(center)} cy="95" r="5" fill="currentColor" />
      </svg>
      <div className="grid gap-2 px-6 pb-4 text-sm">
        <Tex source={String.raw`\hat p\pm1.96\sqrt{\hat p(1-\hat p)/n}`} />
        <Tex source={String.raw`[${lo.toFixed(3)},${hi.toFixed(3)}]`} />
      </div>
    </DemoFrame>
  );
}
