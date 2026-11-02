"use client";

import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

export default function PointSetDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const distanceSquared = x * x + y * y;
  const boundary = Math.abs(distanceSquared - 1) < 1e-9;
  const inside = distanceSquared < 1;
  const sx = (value: number) => roundSvgNumber(250 + value * 112);
  const sy = (value: number) => roundSvgNumber(155 - value * 112);
  const number = (valueToFormat: number) =>
    format.number(valueToFormat, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label={t.markdown("x")}
            value={x}
            display={`$${number(x)}$`}
            min={-1.5}
            max={1.5}
            step={0.1}
            onChange={setX}
          />
          <DemoRange
            label={t.markdown("y")}
            value={y}
            display={`$${number(y)}$`}
            min={-1.5}
            max={1.5}
            step={0.1}
            onChange={setY}
          />
        </>
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown(
            boundary ? "boundary" : inside ? "inside" : "outside",
          )}
        />
      }
    >
      <svg viewBox="0 0 500 310" role="img" aria-label={t("label")}>
        <circle
          cx="250"
          cy="155"
          r="112"
          fill="currentColor"
          fillOpacity=".08"
        />
        <circle
          cx="250"
          cy="155"
          r="112"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <path
          d="M104 155H396M250 9V301"
          fill="none"
          stroke="currentColor"
          strokeOpacity=".22"
        />
        <circle
          cx={sx(x)}
          cy={sy(y)}
          r="7"
          fill={inside ? "currentColor" : "var(--background)"}
          stroke="currentColor"
          strokeWidth="2"
        />
        <SvgTex x={258} y={145} width={28} source="O" />
        <SvgTex
          x={Math.min(370, sx(x) + 8)}
          y={Math.max(20, sy(y) - 20)}
          width={90}
          source={String.raw`r^2=${number(distanceSquared)}`}
        />
        <SvgTex x={392} y={136} width={28} source="x" />
        <SvgTex x={258} y={4} width={28} source="y" />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <p>
          <Tex source={String.raw`x^2+y^2=${number(distanceSquared)}`} />
        </p>
      </div>
    </DemoFrame>
  );
}
