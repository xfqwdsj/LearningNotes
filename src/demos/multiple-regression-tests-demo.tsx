"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function MultipleRegressionTestsDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [b, setB] = useState(0.2);
  const ssr = 10 * b * b + 56,
    sse = 2.5,
    f = ssr / 2 / (sse / 2),
    tj = b / Math.sqrt(1.25 / 10);
  const width = (v: number) => v * 4.5;
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <DemoRange
          label={t.markdown("coefficient")}
          value={b}
          display={b.toFixed(1)}
          min={-1}
          max={1}
          step={0.1}
          onChange={setB}
        />
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", { f: f.toFixed(2), t: tj.toFixed(2) })}
        />
      }
    >
      <svg
        viewBox="0 0 460 170"
        role="img"
        aria-label={t("graph", { ssr: ssr.toFixed(1), sse: sse.toFixed(1) })}
      >
        <line
          x1="80"
          y1="135"
          x2="405"
          y2="135"
          stroke="currentColor"
          strokeOpacity=".3"
        />
        <rect
          x="80"
          y="38"
          width={width(ssr)}
          height="28"
          fill="currentColor"
          fillOpacity=".55"
        />
        <rect
          x="80"
          y="88"
          width={width(sse)}
          height="28"
          fill="currentColor"
          fillOpacity=".45"
        />
        <SvgTex x={18} y={40} width={60} source="SSR" />
        <SvgTex x={18} y={90} width={60} source="SSE" />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <Tex
          source={String.raw`F=\frac{SSR/2}{SSE/2}=${f.toFixed(2)},\quad T_1=${tj.toFixed(2)}`}
          display
        />
        <Tex
          source={String.raw`F_{0.05}(2,2)=19,\quad t_{0.025}(2)\approx4.303`}
        />
      </div>
    </DemoFrame>
  );
}
