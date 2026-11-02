"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import { chiSquareDensity } from "./distribution-density";
import { roundSvgNumber } from "./svg";
import type { DemoComponentProps } from "./types";
export default function OneVarianceTestDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [n, setN] = useState(10),
    [s, setS] = useState(4);
  const q = ((n - 1) * s) / 4;
  const df = n - 1,
    maxX = Math.max(8, q * 1.15, df + 6 * Math.sqrt(2 * df));
  const xs = Array.from(
    { length: 241 },
    (_, i) => 0.05 + ((maxX - 0.05) * i) / 240,
  );
  const densities = xs.map((x) => chiSquareDensity(x, df));
  const maxY = Math.max(...densities) * 1.1;
  const sx = (x: number) => roundSvgNumber(55 + (x / maxX) * 350),
    sy = (y: number) => roundSvgNumber(200 - (y / maxY) * 160);
  const curve = xs.map((x, i) => `${sx(x)},${sy(densities[i] ?? 0)}`).join(" ");
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
            min={2}
            max={30}
            onChange={setN}
          />
          <DemoRange
            label={t.markdown("s")}
            value={s}
            display={s.toFixed(1)}
            min={0.5}
            max={10}
            step={0.5}
            onChange={setS}
          />
        </>
      }
      conclusion={
        <IcuMarkdownText value={t.markdown("result", { df: n - 1 })} />
      }
    >
      <p className="px-6 pt-4 text-sm">
        <IcuMarkdownText value={t.raw("graphNote") as string} />
      </p>
      <svg
        viewBox="0 0 460 240"
        role="img"
        aria-label={t("graphLabel", { df, q: q.toFixed(3) })}
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
          x1={sx(q)}
          y1="35"
          x2={sx(q)}
          y2="200"
          stroke="currentColor"
          strokeDasharray="4 3"
        />
        <SvgTex x={sx(q) - 10} y={205} width={35} source="Q" />
        <SvgTex x={8} y={30} width={45} source={maxY.toFixed(2)} />
        <SvgTex x={390} y={205} width={40} source={maxX.toFixed(0)} />
      </svg>
      <div className="px-6 py-4 text-sm">
        <Tex source={String.raw`Q=\frac{(n-1)s^2}{4}=${q.toFixed(3)}`} />
      </div>
    </DemoFrame>
  );
}
