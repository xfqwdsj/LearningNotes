"use client";

import { useId, useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

export default function LagrangeMultiplierDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const marker = useId();
  const [x, setX] = useState(0);
  const y = 1 - x;
  const sx = (valueX: number) => roundSvgNumber(250 + valueX * 80);
  const sy = (valueY: number) => roundSvgNumber(155 - valueY * 80);
  const level = (constant: number) => {
    const sign = Math.sign(constant) || 1;
    const bound = Math.max(2, Math.abs(constant));
    return Array.from({ length: 101 }, (_, index) => {
      const valueX = sign * (0.15 + (bound * index) / 100);
      const valueY = constant / valueX;
      return {
        x: sx(valueX),
        y: sy(valueY),
      };
    })
      .filter(
        (point) =>
          point.x >= 75 && point.x <= 425 && point.y >= 35 && point.y <= 275,
      )
      .map((point, index) => `${index === 0 ? "M" : "L"}${point.x} ${point.y}`)
      .join("");
  };
  const arrow = `url(#${marker})`;
  const number = (valueToFormat: number) =>
    format.number(valueToFormat, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 3,
    });

  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <DemoRange
          label={t.markdown("x")}
          value={x}
          display={`$${number(x)}$`}
          min={-1}
          max={2}
          step={0.1}
          onChange={setX}
        />
      }
      conclusion={<IcuMarkdownText value={t.markdown("result")} />}
    >
      <svg viewBox="0 0 500 310" role="img" aria-label={t("label")}>
        <defs>
          <marker
            id={marker}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M0 0L10 5L0 10Z" fill="currentColor" />
          </marker>
        </defs>
        <path
          d="M80 155H420M250 28V282"
          fill="none"
          stroke="currentColor"
          strokeOpacity=".22"
        />
        {[-0.5, -0.2, 0.2, 0.5].map((constant) => (
          <path
            key={`positive-${constant}`}
            d={level(constant)}
            fill="none"
            stroke="currentColor"
            strokeOpacity=".14"
          />
        ))}
        {[-0.5, -0.2, 0.2, 0.5].map((constant) => (
          <path
            key={`negative-${constant}`}
            d={level(constant)}
            fill="none"
            stroke="currentColor"
            strokeOpacity=".1"
            strokeDasharray="4 4"
          />
        ))}
        <line
          x1={sx(-1)}
          y1={sy(2)}
          x2={sx(2)}
          y2={sy(-1)}
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <line
          x1={sx(0.5)}
          y1={sy(0.5)}
          x2={sx(1.2)}
          y2={sy(1.2)}
          stroke="currentColor"
          strokeOpacity=".55"
          strokeDasharray="5 4"
          markerEnd={arrow}
        />
        <circle
          cx={sx(x)}
          cy={sy(y)}
          r="7"
          fill={Math.abs(x - 0.5) < 1e-9 ? "currentColor" : "var(--background)"}
          stroke="currentColor"
          strokeWidth="2"
        />
        <SvgTex x={82} y={24} width={130} source="f(x,y)=xy" />
        <SvgTex x={354} y={266} width={92} source="g=x+y-1" />
        <SvgTex
          x={sx(0.5) + 6}
          y={sy(0.5) - 24}
          width={84}
          source="\max=0.25"
        />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <p>
          <Tex source={String.raw`x+y=1,\qquad xy=${number(x * y)}`} />
        </p>
      </div>
    </DemoFrame>
  );
}
