"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function EstimatorBiasDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [n, setN] = useState(4);
  const ml = (n - 1) / n;
  const sx = (x: number) => 55 + ((x - 2) / 28) * 350;
  const sy = (y: number) => 200 - ((y - 0.45) / 0.6) * 160;
  const points = Array.from({ length: 29 }, (_, i) => i + 2)
    .map((k) => `${sx(k)},${sy((k - 1) / k)}`)
    .join(" ");
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <DemoRange
          label={t.markdown("n")}
          value={n}
          display={String(n)}
          min={2}
          max={30}
          onChange={setN}
        />
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", {
            mean: ml.toFixed(3),
            bias: (-1 / n).toFixed(3),
          })}
        />
      }
    >
      <p className="px-6 pt-4 text-sm">
        <IcuMarkdownText value={t.raw("graphNote") as string} />
      </p>
      <svg
        viewBox="0 0 460 240"
        role="img"
        aria-label={t("graphLabel", { n, mean: ml.toFixed(3) })}
      >
        <line
          x1="55"
          y1="200"
          x2="405"
          y2="200"
          stroke="currentColor"
          strokeOpacity=".35"
        />
        <line
          x1="55"
          y1={sy(1)}
          x2="405"
          y2={sy(1)}
          stroke="currentColor"
          strokeOpacity=".5"
          strokeDasharray="5 4"
        />
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <line
          x1={sx(n)}
          y1="35"
          x2={sx(n)}
          y2="200"
          stroke="currentColor"
          strokeOpacity=".25"
        />
        <circle cx={sx(n)} cy={sy(ml)} r="5" fill="currentColor" />
        <SvgTex x={20} y={sy(1) - 10} width={28} source="1" />
        <SvgTex x={46} y={205} width={28} source="2" />
        <SvgTex x={395} y={205} width={32} source="30" />
        <SvgTex x={414} y={205} width={24} source="n" />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <p>
          <Tex source={String.raw`E(S^2)=1`} />
        </p>
        <p>
          <Tex
            source={String.raw`E(\hat\sigma^2_{\mathrm{ML}})=\frac{n-1}{n}=${ml.toFixed(3)}`}
          />
        </p>
      </div>
    </DemoFrame>
  );
}
