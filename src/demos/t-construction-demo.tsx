"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { tDensity } from "./distribution-density";
import { roundSvgNumber } from "./svg";
export default function TConstructionDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [z, setZ] = useState(1),
    [u, setU] = useState(4),
    [nu, setNu] = useState(4);
  const value = z / Math.sqrt(u / nu);
  const bound = Math.max(4, Math.abs(value) + 0.5);
  const xs = Array.from(
    { length: 241 },
    (_, i) => -bound + (2 * bound * i) / 240,
  );

  const normal = (x: number) => Math.exp((-x * x) / 2) / Math.sqrt(2 * Math.PI);
  const sx = (x: number) => roundSvgNumber(230 + (x / bound) * 175);
  const sy = (y: number) => roundSvgNumber(200 - (y / 0.45) * 160);
  const line = (density: (x: number) => number) =>
    xs.map((x) => `${sx(x)},${sy(density(x))}`).join(" ");
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label={t.markdown("z")}
            value={z}
            display={z.toFixed(1)}
            min={-3}
            max={3}
            step={0.1}
            onChange={setZ}
          />
          <DemoRange
            label={t.markdown("u")}
            value={u}
            display={u.toFixed(1)}
            min={0.5}
            max={10}
            step={0.5}
            onChange={setU}
          />
          <DemoRange
            label={t.markdown("nu")}
            value={nu}
            display={String(nu)}
            min={1}
            max={10}
            onChange={setNu}
          />
        </>
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", { value: value.toFixed(3) })}
        />
      }
    >
      <p className="px-6 pt-4 text-sm">
        <IcuMarkdownText value={t.raw("graphNote") as string} />
      </p>
      <svg
        viewBox="0 0 460 240"
        role="img"
        aria-label={t("graphLabel", { nu, value: value.toFixed(3) })}
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
          points={line(normal)}
          fill="none"
          stroke="currentColor"
          strokeOpacity=".5"
          strokeWidth="2"
          strokeDasharray="5 4"
        />
        <polyline
          points={line((x) => tDensity(x, nu))}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <line
          x1={sx(value)}
          y1="35"
          x2={sx(value)}
          y2="200"
          stroke="currentColor"
          strokeOpacity=".65"
          strokeDasharray="2 3"
        />
        <SvgTex x={sx(value) - 10} y={205} width={40} source="T" />
        <SvgTex x={46} y={205} width={45} source={(-bound).toFixed(1)} />
        <SvgTex x={385} y={205} width={45} source={bound.toFixed(1)} />
      </svg>
      <div className="px-6 py-4 text-sm">
        <Tex
          source={String.raw`T=\frac{Z}{\sqrt{U/\nu}}\approx${value.toFixed(3)}`}
        />
      </div>
    </DemoFrame>
  );
}
