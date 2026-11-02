"use client";

import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

export default function CylinderSurfaceDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [z, setZ] = useState(0);
  const [angle, setAngle] = useState(45);
  const radians = (angle * Math.PI) / 180;
  const cx = 250;
  const cy = 175;
  const project = (theta: number, height: number) =>
    [
      roundSvgNumber(cx + 112 * Math.cos(theta)),
      roundSvgNumber(cy + 36 * Math.sin(theta) - height * 34),
    ] as const;
  const current = project(radians, z);
  const base = project(radians, -3);
  const circle = (height: number) =>
    Array.from({ length: 97 }, (_, index) => {
      const theta = (2 * Math.PI * index) / 96;
      const [x, y] = project(theta, height);
      return `${index === 0 ? "M" : "L"}${x} ${y}`;
    }).join("");
  const number = (value: number) =>
    format.number(value, {
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
            label={t.markdown("z")}
            value={z}
            display={`$${number(z)}$`}
            min={-3}
            max={3}
            step={0.1}
            onChange={setZ}
          />
          <DemoRange
            label={t.markdown("angle")}
            value={angle}
            display={`$${angle}^{\\circ}$`}
            min={0}
            max={360}
            step={15}
            onChange={setAngle}
          />
        </>
      }
      conclusion={<IcuMarkdownText value={t.markdown("result")} />}
    >
      <svg viewBox="0 0 500 320" role="img" aria-label={t("label")}>
        {[-3, -1.5, 0, 1.5, 3].map((height) => (
          <path
            key={height}
            d={circle(height)}
            fill="none"
            stroke="currentColor"
            strokeOpacity=".18"
          />
        ))}
        {[0, 45, 90, 135].map((degrees) => {
          const theta = (degrees * Math.PI) / 180;
          const top = project(theta, 3);
          const bottom = project(theta, -3);
          return (
            <line
              key={degrees}
              x1={top[0]}
              y1={top[1]}
              x2={bottom[0]}
              y2={bottom[1]}
              stroke="currentColor"
              strokeOpacity=".2"
            />
          );
        })}
        <path
          d={circle(3)}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <path
          d={circle(-3)}
          fill="none"
          stroke="currentColor"
          strokeOpacity=".55"
          strokeWidth="2"
        />
        <line
          x1={base[0]}
          y1={base[1]}
          x2={current[0]}
          y2={current[1]}
          stroke="currentColor"
          strokeWidth="3"
        />
        <circle cx={current[0]} cy={current[1]} r="7" fill="currentColor" />
        <SvgTex x={current[0] + 8} y={current[1] - 16} width={42} source="P" />
        <SvgTex x={22} y={20} width={116} source="x^2+y^2=1" />
        <SvgTex x={220} y={292} width={66} source="z" />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <p>
          <Tex
            source={String.raw`(x,y,z)=(${number(Math.cos(radians))},${number(Math.sin(radians))},${number(z)})`}
          />
        </p>
      </div>
    </DemoFrame>
  );
}
