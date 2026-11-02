"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function EstimatorMseDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [n, setN] = useState(4);
  const unbiased = 2 / (n - 1);
  const mle = (2 * n - 1) / (n * n);
  const sx = (x: number) => 55 + ((x - 2) / 28) * 350;
  const sy = (y: number) => 200 - (y / 2.2) * 160;
  const samples = Array.from({ length: 29 }, (_, i) => i + 2);
  const line = (f: (k: number) => number) =>
    samples.map((k) => `${sx(k)},${sy(f(k))}`).join(" ");
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
      conclusion={<IcuMarkdownText value={t.markdown("result")} />}
    >
      <p className="px-6 pt-4 text-sm">
        <IcuMarkdownText value={t.raw("graphNote") as string} />
      </p>
      <svg
        viewBox="0 0 460 240"
        role="img"
        aria-label={t("graphLabel", {
          n,
          unbiased: unbiased.toFixed(3),
          mle: mle.toFixed(3),
        })}
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
          y1="40"
          x2="55"
          y2="200"
          stroke="currentColor"
          strokeOpacity=".35"
        />
        <polyline
          points={line((k) => 2 / (k - 1))}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <polyline
          points={line((k) => (2 * k - 1) / (k * k))}
          fill="none"
          stroke="currentColor"
          strokeOpacity=".55"
          strokeWidth="2"
          strokeDasharray="5 4"
        />
        <line
          x1={sx(n)}
          y1="40"
          x2={sx(n)}
          y2="200"
          stroke="currentColor"
          strokeOpacity=".25"
        />
        <circle cx={sx(n)} cy={sy(unbiased)} r="4" fill="currentColor" />
        <circle
          cx={sx(n)}
          cy={sy(mle)}
          r="4"
          fill="var(--background)"
          stroke="currentColor"
          strokeWidth="2"
        />
        <SvgTex x={20} y={sy(2) - 10} width={25} source="2" />
        <SvgTex x={20} y={190} width={25} source="0" />
        <SvgTex x={45} y={205} width={25} source="2" />
        <SvgTex x={390} y={205} width={32} source="30" />
        <SvgTex x={415} y={205} width={25} source="n" />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <p>
          <Tex
            source={String.raw`\operatorname{MSE}(S^2)=${unbiased.toFixed(3)}`}
          />
        </p>
        <p>
          <Tex
            source={String.raw`\operatorname{MSE}(\hat\sigma^2_{\mathrm{ML}})=${mle.toFixed(3)}`}
          />
        </p>
      </div>
    </DemoFrame>
  );
}
