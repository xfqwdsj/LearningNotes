"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import { roundSvgNumber } from "./svg";
import type { DemoComponentProps } from "./types";

const cx = 230;
const cy = 150;
const radius = 100;

function at(theta: number) {
  return {
    x: roundSvgNumber(cx + radius * Math.cos(theta)),
    y: roundSvgNumber(cy - radius * Math.sin(theta)),
  };
}

export default function InverseTrigDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [x, setX] = useState(0.5);
  const theta = Math.asin(x);
  const principal = at(theta);
  const other = at(Math.PI - theta);
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <DemoRange
          label={t.markdown("valueLabel")}
          value={x}
          display={format.number(x, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
          min={-1}
          max={1}
          step={0.01}
          onChange={setX}
        />
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", {
            value: format.number(x, { maximumFractionDigits: 2 }),
            angle: format.number((theta * 180) / Math.PI, {
              maximumFractionDigits: 1,
            }),
          })}
        />
      }
    >
      <svg
        viewBox="0 0 460 300"
        role="img"
        aria-label={t("diagram", {
          value: format.number(x, { maximumFractionDigits: 2 }),
        })}
      >
        <path
          d={`M${cx - radius - 24} ${cy}H${cx + radius + 24}M${cx} ${cy - radius - 24}V${cy + radius + 24}`}
          stroke="currentColor"
          strokeOpacity=".2"
        />
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeOpacity=".35"
        />
        <path
          d={`M${cx - radius - 12} ${cy - x * radius}H${cx + radius + 12}`}
          stroke="currentColor"
          strokeDasharray="4 4"
          strokeOpacity=".45"
        />
        <path
          d={`M${cx} ${cy}L${principal.x} ${principal.y}`}
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx={principal.x} cy={principal.y} r="5" fill="currentColor" />
        {Math.abs(x) < 1 && (
          <>
            <circle
              cx={other.x}
              cy={other.y}
              r="4"
              fill="var(--background)"
              stroke="currentColor"
              strokeWidth="2"
            />
            <SvgTex
              x={other.x - 50}
              y={other.y - 22}
              width={60}
              source="\pi-\theta"
            />
          </>
        )}
        <SvgTex
          x={principal.x + 8}
          y={principal.y - 22}
          width={35}
          source="\theta"
        />
        <SvgTex x={cx + radius + 22} y={cy + 5} width={18} source="x" />
        <SvgTex x={cx + 5} y={cy - radius - 20} width={18} source="y" />
        <SvgTex x={cx + radius + 4} y={cy + 18} width={18} source="1" />
      </svg>
    </DemoFrame>
  );
}
