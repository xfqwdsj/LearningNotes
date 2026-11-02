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

function point(degrees: number) {
  const radians = (degrees * Math.PI) / 180;
  return {
    radians,
    x: roundSvgNumber(cx + radius * Math.cos(radians)),
    y: roundSvgNumber(cy - radius * Math.sin(radians)),
    cos: Math.cos(radians),
    sin: Math.sin(radians),
  };
}

export default function UnitCircleDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [angle, setAngle] = useState(30);
  const value = point(angle);
  const labelAngle = value.radians / 2;
  const quadrant =
    angle % 360 === 0 || angle === 90 || angle === 180 || angle === 270
      ? t("axis")
      : angle < 90
        ? t("first")
        : angle < 180
          ? t("second")
          : angle < 270
            ? t("third")
            : t("fourth");
  const arc = `M${cx + radius} ${cy} A ${radius} ${radius} 0 ${angle > 180 ? 1 : 0} 0 ${value.x} ${value.y}`;
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <DemoRange
          label={t.markdown("angleLabel")}
          value={angle}
          display={`$${format.number(angle)}^\\circ$`}
          min={0}
          max={360}
          step={1}
          onChange={setAngle}
        />
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", {
            angle: format.number(angle),
            sin: format.number(value.sin, { maximumFractionDigits: 3 }),
            cos: format.number(value.cos, { maximumFractionDigits: 3 }),
            quadrant,
          })}
        />
      }
    >
      <svg
        viewBox="0 0 460 300"
        role="img"
        aria-label={t("diagram", { angle })}
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
        <path d={arc} fill="none" stroke="currentColor" strokeWidth="2" />
        <path
          d={`M${cx} ${cy}L${value.x} ${value.y}`}
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d={`M${value.x} ${cy}H${value.x}V${value.y}`}
          stroke="currentColor"
          strokeDasharray="4 4"
          strokeOpacity=".5"
        />
        <circle cx={value.x} cy={value.y} r="5" fill="currentColor" />
        <SvgTex
          x={value.x + 10}
          y={(cy + value.y) / 2 - 12}
          width={95}
          height={30}
          source="\sin\alpha"
        />
        <SvgTex
          x={(cx + value.x) / 2 - 20}
          y={cy + 8}
          width={60}
          height={30}
          source="\cos\alpha"
        />
        <SvgTex
          x={cx + radius + 2}
          y={cy + 18}
          width={18}
          height={22}
          source="1"
        />
        <SvgTex
          x={cx + 5}
          y={cy - radius - 20}
          width={18}
          height={22}
          source="y"
        />
        <SvgTex
          x={cx + radius + 22}
          y={cy + 5}
          width={18}
          height={22}
          source="x"
        />
        <SvgTex
          x={roundSvgNumber(cx + 55 * Math.cos(labelAngle) - 15)}
          y={roundSvgNumber(cy - 55 * Math.sin(labelAngle) - 13)}
          width={30}
          height={26}
          source="\alpha"
        />
      </svg>
    </DemoFrame>
  );
}
