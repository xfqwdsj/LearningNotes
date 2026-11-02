"use client";
import { useId, useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import { crossProductZ } from "./models";
import { roundSvgNumber } from "./svg";
import type { DemoComponentProps } from "./types";
export default function VectorProductDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [a, setA] = useState(2),
    [b, setB] = useState(2),
    [angle, setAngle] = useState(60);
  const id = useId(),
    radians = (angle * Math.PI) / 180;
  const ax = roundSvgNumber(34 * a),
    bx = roundSvgNumber(34 * b * Math.cos(radians)),
    by = roundSvgNumber(-34 * b * Math.sin(radians));
  const z = crossProductZ(a, b, angle);
  const number = (value: number) =>
    format.number(value, { maximumFractionDigits: 3 });
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label={t.markdown("a")}
            value={a}
            display={number(a)}
            min={1}
            max={3}
            step={0.25}
            onChange={setA}
          />
          <DemoRange
            label={t.markdown("b")}
            value={b}
            display={number(b)}
            min={1}
            max={3}
            step={0.25}
            onChange={setB}
          />
          <DemoRange
            label={t.markdown("angle")}
            value={angle}
            display={number(angle)}
            min={-180}
            max={180}
            step={5}
            onChange={setAngle}
          />
        </>
      }
      conclusion={
        <>
          <IcuMarkdownText
            value={t.markdown("result", {
              z: number(z),
              area: number(Math.abs(z)),
            })}
          />
          <p>
            <IcuMarkdownText
              value={t.markdown(
                z === 0 ? "zero" : z > 0 ? "positive" : "negative",
              )}
            />
          </p>
        </>
      }
    >
      <svg
        viewBox="0 0 460 300"
        role="img"
        aria-label={t("diagram", { angle, area: number(Math.abs(z)) })}
      >
        <defs>
          <marker
            id={id}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M0 0L10 5L0 10Z" fill="currentColor" />
          </marker>
        </defs>
        <path
          d="M30 170H440M230 35V285"
          fill="none"
          stroke="currentColor"
          opacity=".15"
        />
        <polygon
          points={`230,170 ${230 + ax},170 ${230 + ax + bx},${170 + by} ${230 + bx},${170 + by}`}
          fill="currentColor"
          fillOpacity=".12"
          stroke="currentColor"
          strokeOpacity=".3"
          strokeDasharray="4 4"
        />
        <path
          d={`M230 170h${ax}`}
          stroke="currentColor"
          strokeWidth="2.5"
          markerEnd={`url(#${id})`}
        />
        <path
          d={`M230 170l${bx} ${by}`}
          stroke="currentColor"
          strokeWidth="2.5"
          markerEnd={`url(#${id})`}
        />
        <SvgTex x={230 + ax / 2 - 15} y={175} width={30} source="a" />
        <SvgTex x={230 + bx - 30} y={170 + by - 32} width={30} source="b" />
        <SvgTex x={380} y={174} width={40} source="x" />
        <SvgTex x={235} y={30} width={30} source="y" />
        <circle
          cx="60"
          cy="55"
          r="14"
          fill="none"
          stroke="currentColor"
          opacity={z === 0 ? 0.2 : 1}
        />
        {z > 0 && <circle cx="60" cy="55" r="4" fill="currentColor" />}
        {z < 0 && (
          <path
            d="M53 48L67 62M67 48L53 62"
            stroke="currentColor"
            strokeWidth="2"
          />
        )}
        <SvgTex
          x={80}
          y={37}
          width={130}
          source={`(a\\times b)_z=${number(z)}`}
        />
      </svg>
    </DemoFrame>
  );
}
