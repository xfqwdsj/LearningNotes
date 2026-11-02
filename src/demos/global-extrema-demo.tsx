"use client";

import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

export default function GlobalExtremaDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [r, setR] = useState(2);
  const [fraction, setFraction] = useState(0.5);
  const distance = r * fraction;
  const angle = (35 * Math.PI) / 180;
  const x = distance * Math.cos(angle);
  const y = distance * Math.sin(angle);
  const scale = 105 / 3;
  const sx = (value: number) => roundSvgNumber(250 + value * scale);
  const sy = (value: number) => roundSvgNumber(155 - value * scale);
  const number = (valueToFormat: number) =>
    format.number(valueToFormat, {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    });

  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label={t.markdown("r")}
            value={r}
            display={`$${number(r)}$`}
            min={0.5}
            max={3}
            step={0.1}
            onChange={setR}
          />
          <DemoRange
            label={t.markdown("fraction")}
            value={fraction}
            display={`$${number(fraction)}$`}
            min={0}
            max={1}
            step={0.1}
            onChange={setFraction}
          />
        </>
      }
      conclusion={
        <IcuMarkdownText value={t.markdown("result", { max: number(r * r) })} />
      }
    >
      <svg viewBox="0 0 500 310" role="img" aria-label={t("label")}>
        <circle
          cx="250"
          cy="155"
          r={r * scale}
          fill="currentColor"
          fillOpacity=".08"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        {[0.25, 0.5, 0.75, 1].map((ratio) => (
          <circle
            key={ratio}
            cx="250"
            cy="155"
            r={r * ratio * scale}
            fill="none"
            stroke="currentColor"
            strokeOpacity=".15"
          />
        ))}
        <path
          d="M78 155H422M250 20V290"
          fill="none"
          stroke="currentColor"
          strokeOpacity=".22"
        />
        <line
          x1="250"
          y1="155"
          x2={sx(x)}
          y2={sy(y)}
          stroke="currentColor"
          strokeDasharray="4 4"
        />
        <circle cx="250" cy="155" r="5" fill="currentColor" />
        <circle
          cx={sx(x)}
          cy={sy(y)}
          r="7"
          fill="var(--background)"
          stroke="currentColor"
          strokeWidth="2"
        />
        <SvgTex x={270} y={268} width={38} source="\min" />
        <SvgTex x={391} y={23} width={38} source="\max" />
        <SvgTex
          x={Math.min(370, sx(x) + 8)}
          y={Math.max(24, sy(y) - 22)}
          width={84}
          source={String.raw`f=${number(distance * distance)}`}
        />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <p>
          <Tex source={String.raw`0\le x^2+y^2\le${number(r * r)}`} />
        </p>
      </div>
    </DemoFrame>
  );
}
