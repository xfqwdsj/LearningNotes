"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function ExponentialLimitDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [n, setN] = useState(5);
  const value = (1 + 1 / n) ** n;
  const sx = (k: number) => 55 + ((k - 1) / 199) * 350,
    sy = (v: number) => 200 - ((v - 1.95) / 0.85) * 165;
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
          min={1}
          max={200}
          onChange={setN}
        />
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", { gap: (Math.E - value).toFixed(5) })}
        />
      }
    >
      <svg
        viewBox="0 0 460 245"
        role="img"
        aria-label={t("graphLabel", { n, value: value.toFixed(5) })}
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
          y1={sy(Math.E)}
          x2="405"
          y2={sy(Math.E)}
          stroke="currentColor"
          strokeOpacity=".55"
          strokeDasharray="5 4"
        />
        {Array.from({ length: 200 }, (_, i) => i + 1).map((k) => (
          <circle
            key={k}
            cx={sx(k)}
            cy={sy((1 + 1 / k) ** k)}
            r={k === n ? 4 : 1.5}
            fill="currentColor"
            opacity={k === n ? 1 : 0.5}
          />
        ))}
        <SvgTex x={24} y={sy(Math.E) - 10} width={25} source="e" />
        <SvgTex x={45} y={205} width={25} source="1" />
        <SvgTex x={390} y={205} width={40} source="200" />
        <SvgTex x={420} y={205} width={25} source="n" />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <p>
          <Tex source={String.raw`(1+1/n)^n\approx${value.toFixed(5)}`} />
        </p>
        <p>
          <Tex source={String.raw`e\approx${Math.E.toFixed(5)}`} />
        </p>
      </div>
    </DemoFrame>
  );
}
