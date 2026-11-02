"use client";

import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

export default function SolidDiskDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [b, setB] = useState(1);
  const volume = (Math.PI * b * b) / 2;
  const sx = (x: number) => roundSvgNumber(70 + (x / 2) * 360);
  const sy = (radius: number) => roundSvgNumber(radius * 62);
  const number = (value: number) =>
    format.number(value, {
      minimumFractionDigits: 3,
      maximumFractionDigits: 4,
    });

  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <DemoRange
          label={t.markdown("b")}
          value={b}
          display={`$${number(b)}$`}
          min={0}
          max={2}
          step={0.1}
          onChange={setB}
        />
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", { volume: number(volume) })}
        />
      }
    >
      <svg viewBox="0 0 500 300" role="img" aria-label={t("label")}>
        <path d="M70 155H440" stroke="currentColor" strokeOpacity=".3" />
        {[0.15, 0.3, 0.45, 0.6, 0.75, 0.9].map((ratio) => {
          const x = b * ratio;
          const radius = Math.sqrt(Math.max(0, x)) * 62;
          return (
            <ellipse
              key={ratio}
              cx={sx(x)}
              cy="155"
              rx="10"
              ry={radius}
              fill="none"
              stroke="currentColor"
              strokeOpacity=".25"
            />
          );
        })}
        <path
          d={Array.from({ length: 81 }, (_, index) => {
            const x = (b * index) / 80;
            return `${index === 0 ? "M" : "L"}${sx(x)} ${155 - sy(Math.sqrt(x))}`;
          }).join("")}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.75"
        />
        <path
          d={Array.from({ length: 81 }, (_, index) => {
            const x = (b * index) / 80;
            return `${index === 0 ? "M" : "L"}${sx(x)} ${155 + sy(Math.sqrt(x))}`;
          }).join("")}
          fill="none"
          stroke="currentColor"
          strokeOpacity=".55"
          strokeWidth="2"
        />
        <SvgTex x={sx(b) + 8} y={80} width={62} source="r=\sqrt x" />
        <SvgTex x={430} y={136} width={28} source="x" />
        <SvgTex x={43} y={22} width={86} source="y=\sqrt x" />
        <SvgTex
          x={270}
          y={266}
          width={164}
          source={String.raw`V=\frac{\pi b^2}{2}`}
        />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <div>
          <Tex
            source={String.raw`V=\int_0^b\pi x\,\mathrm dx=\frac{\pi b^2}{2}=${number(volume)}`}
            display
          />
        </div>
      </div>
    </DemoFrame>
  );
}
