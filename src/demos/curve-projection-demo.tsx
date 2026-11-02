"use client";

import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

const fullTurn = Math.PI * 2;

export default function CurveProjectionDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [angle, setAngle] = useState(270);
  const parameter = (angle / 360) * fullTurn;
  const project = (value: number) => {
    const x = Math.cos(value);
    const y = Math.sin(value);
    return [
      roundSvgNumber(224 + 84 * x + 34 * y),
      roundSvgNumber(236 - 38 * y),
    ] as const;
  };
  const space = (value: number) => {
    const [x, y] = project(value);
    return [x, roundSvgNumber(y - 30 * (value / fullTurn) * 2.4)] as const;
  };
  const path = (
    fn: (value: number) => readonly [number, number],
    last: number,
  ) =>
    Array.from(
      { length: Math.max(2, Math.ceil((last / fullTurn) * 120)) + 1 },
      (_, index) => {
        const value =
          (last * index) / Math.max(1, Math.ceil((last / fullTurn) * 120));
        const [x, y] = fn(value);
        return `${index === 0 ? "M" : "L"}${x} ${y}`;
      },
    ).join(" ");
  const current = space(parameter);
  const projected = project(parameter);
  const number = (value: number) =>
    format.number(value, {
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
          label={t.markdown("parameter")}
          value={angle}
          display={`$${angle}^{\\circ}$`}
          min={0}
          max={360}
          step={15}
          onChange={setAngle}
        />
      }
      conclusion={<IcuMarkdownText value={t.markdown("result")} />}
    >
      <svg viewBox="0 0 500 300" role="img" aria-label={t("label")}>
        <path
          d="M91 236H407M224 236V35M224 236L292 94"
          fill="none"
          stroke="currentColor"
          strokeOpacity=".25"
        />
        <path
          d={path(project, fullTurn)}
          fill="none"
          stroke="currentColor"
          strokeOpacity=".28"
          strokeWidth="2"
          strokeDasharray="6 4"
        />
        <path
          d={path(space, fullTurn)}
          fill="none"
          stroke="currentColor"
          strokeOpacity=".18"
          strokeWidth="2"
        />
        <path
          d={path(project, Math.max(0.001, parameter))}
          fill="none"
          stroke="currentColor"
          strokeOpacity=".5"
          strokeWidth="2"
          strokeDasharray="5 4"
        />
        <path
          d={path(space, Math.max(0.001, parameter))}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        />
        <line
          x1={current[0]}
          y1={current[1]}
          x2={projected[0]}
          y2={projected[1]}
          stroke="currentColor"
          strokeOpacity=".5"
          strokeDasharray="4 4"
        />
        <circle cx={projected[0]} cy={projected[1]} r="5" fill="currentColor" />
        <circle
          cx={current[0]}
          cy={current[1]}
          r="6"
          fill="var(--background)"
          stroke="currentColor"
          strokeWidth="2"
        />
        <SvgTex x={400} y={214} width={28} source="x" />
        <SvgTex x={283} y={82} width={28} source="y" />
        <SvgTex x={205} y={22} width={42} source="z" />
        <SvgTex
          x={current[0] + 8}
          y={current[1] - 14}
          width={56}
          source="P(t)"
        />
        <SvgTex
          x={projected[0] + 8}
          y={projected[1] + 6}
          width={80}
          source="P_0(t)"
        />
        <SvgTex x={24} y={22} width={156} source="(\cos t,\sin t,t)" />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <p>
          <Tex
            source={String.raw`P(t)\approx(${number(Math.cos(parameter))},${number(Math.sin(parameter))},${number(parameter)}),\qquad P_0(t)\approx(${number(Math.cos(parameter))},${number(Math.sin(parameter))},0)`}
          />
        </p>
      </div>
    </DemoFrame>
  );
}
