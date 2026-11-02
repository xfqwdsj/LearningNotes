"use client";

import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

export default function TotalDifferentialDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [dx, setDx] = useState(0.2);
  const [dy, setDy] = useState(0.2);
  const linear = 2 * dx + 4 * dy;
  const extra = dx * dx + dy * dy;
  const exact = linear + extra;
  const maxHeight = Math.max(1, Math.abs(exact), Math.abs(linear));
  const baseline = 230;
  const sy = (value: number) =>
    roundSvgNumber(baseline - (value / maxHeight) * 160);
  const sx = (value: number) => roundSvgNumber(250 + value * 85);
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
            label={t.markdown("dx")}
            value={dx}
            display={`$${number(dx)}$`}
            min={-1}
            max={1}
            step={0.1}
            onChange={setDx}
          />
          <DemoRange
            label={t.markdown("dy")}
            value={dy}
            display={`$${number(dy)}$`}
            min={-1}
            max={1}
            step={0.1}
            onChange={setDy}
          />
        </>
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", { extra: number(extra) })}
        />
      }
    >
      <svg viewBox="0 0 500 300" role="img" aria-label={t("label")}>
        <path
          d={`M90 ${baseline}H410M250 30V270`}
          fill="none"
          stroke="currentColor"
          strokeOpacity=".22"
        />
        <line
          x1="250"
          y1={baseline}
          x2={sx(dx)}
          y2={sy(dy)}
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <line
          x1={sx(dx)}
          y1={baseline}
          x2={sx(dx)}
          y2={sy(linear)}
          stroke="currentColor"
          strokeWidth="7"
          strokeOpacity=".22"
        />
        <line
          x1={sx(dx) + 16}
          y1={baseline}
          x2={sx(dx) + 16}
          y2={sy(exact)}
          stroke="currentColor"
          strokeWidth="7"
        />
        <circle
          cx={sx(dx)}
          cy={sy(linear)}
          r="5"
          fill="var(--background)"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx={sx(dx) + 16} cy={sy(exact)} r="5" fill="currentColor" />
        <SvgTex
          x={sx(dx) - 8}
          y={sy(linear) - 24}
          width={58}
          source="\mathrm dz"
        />
        <SvgTex
          x={sx(dx) + 28}
          y={sy(exact) - 24}
          width={58}
          source="\Delta z"
        />
        <SvgTex
          x={262}
          y={238}
          width={80}
          source={String.raw`(\Delta x,\Delta y)`}
        />
        <SvgTex x={410} y={214} width={28} source="x" />
        <SvgTex x={258} y={24} width={28} source="y" />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <p>
          <Tex
            source={String.raw`\mathrm dz=${number(linear)},\qquad\Delta z=${number(exact)}`}
          />
        </p>
      </div>
    </DemoFrame>
  );
}
