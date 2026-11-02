"use client";
import { useId, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import { directionalSlope } from "./models";
import { roundSvgNumber } from "./svg";
import type { DemoComponentProps } from "./types";
export default function GradientDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [angle, setAngle] = useState(45);
  const id = useId(),
    reduced = useReducedMotion();
  const radians = (angle * Math.PI) / 180;
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <DemoRange
          label={t.markdown("direction")}
          value={angle}
          display={format.number(angle)}
          min={0}
          max={360}
          step={5}
          onChange={setAngle}
        />
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", {
            angle,
            value: format.number(directionalSlope(angle), {
              maximumFractionDigits: 3,
            }),
          })}
        />
      }
    >
      <svg
        viewBox="0 0 460 300"
        role="img"
        aria-label={t("diagram", { angle })}
      >
        <defs>
          <marker
            id={id}
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
        {[45, 90, 135].map((radius) => (
          <circle
            key={radius}
            cx="230"
            cy="150"
            r={radius}
            fill="none"
            stroke="currentColor"
            opacity=".12"
          />
        ))}
        <path
          d="M65 150H410M230 15V285"
          fill="none"
          stroke="currentColor"
          opacity=".2"
        />
        <path
          d="M275 105L329 51"
          fill="none"
          stroke="currentColor"
          strokeDasharray="5 5"
          opacity=".4"
          markerEnd={`url(#${id})`}
        />
        <motion.line
          initial={false}
          x1="275"
          y1="105"
          animate={{
            x2: roundSvgNumber(275 + 67.5 * Math.cos(radians)),
            y2: roundSvgNumber(105 - 67.5 * Math.sin(radians)),
          }}
          transition={{ duration: reduced ? 0 : 0.18 }}
          stroke="currentColor"
          strokeWidth="2.5"
          markerEnd={`url(#${id})`}
        />
        <circle cx="275" cy="105" r="4" fill="currentColor" />
        <SvgTex x={278} y={112} width={65} source="(1,1)" />
        <SvgTex x={410} y={151} source="x" />
        <SvgTex x={235} y={8} source="y" />
      </svg>
    </DemoFrame>
  );
}
