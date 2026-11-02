"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import { fDensity } from "./distribution-density";
import type { DemoComponentProps } from "./types";
export default function VarianceRatioTestDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [a, setA] = useState(4),
    [b, setB] = useState(2);
  const ratio = a / b;
  const xs = Array.from(
    { length: 161 },
    (_, i) => 10 ** (-1.4 + (2.8 * i) / 160),
  );
  const values = xs.map((x) => fDensity(x, 9, 9)),
    maxY = Math.max(...values) * 1.1;
  const sx = (x: number) => 55 + ((Math.log10(x) + 1.4) / 2.8) * 350,
    sy = (y: number) => 200 - (y / maxY) * 160;
  const curve = xs.map((x, i) => `${sx(x)},${sy(values[i] ?? 0)}`).join(" ");
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label={t.markdown("a")}
            value={a}
            display={a.toFixed(1)}
            min={0.5}
            max={10}
            step={0.5}
            onChange={setA}
          />
          <DemoRange
            label={t.markdown("b")}
            value={b}
            display={b.toFixed(1)}
            min={0.5}
            max={10}
            step={0.5}
            onChange={setB}
          />
        </>
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", { value: (a / b).toFixed(3) })}
        />
      }
    >
      <p className="px-6 pt-4 text-sm">
        <IcuMarkdownText value={t.raw("graphNote") as string} />
      </p>
      <svg
        viewBox="0 0 460 240"
        role="img"
        aria-label={t("graphLabel", { ratio: ratio.toFixed(3) })}
      >
        <line
          x1="55"
          y1="200"
          x2="405"
          y2="200"
          stroke="currentColor"
          strokeOpacity=".35"
        />
        <polyline
          points={curve}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <line
          x1={sx(ratio)}
          y1="35"
          x2={sx(ratio)}
          y2="200"
          stroke="currentColor"
          strokeDasharray="4 3"
        />
        {[0.1, 1, 10].map((v) => (
          <SvgTex
            key={v}
            x={sx(v) - 10}
            y={205}
            width={35}
            source={String(v)}
          />
        ))}
        <SvgTex x={sx(ratio) - 10} y={15} width={30} source="F" />
        <SvgTex x={8} y={30} width={45} source={maxY.toFixed(2)} />
      </svg>
      <div className="px-6 py-4 text-sm">
        <Tex source={String.raw`F=\frac{s_1^2}{s_2^2}=${(a / b).toFixed(3)}`} />
      </div>
    </DemoFrame>
  );
}
