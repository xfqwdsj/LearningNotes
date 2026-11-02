"use client";

import { useId, useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

export default function NewtonLeibnizDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const marker = useId();
  const [a, setA] = useState(0);
  const [b, setB] = useState(2);
  const fa = a * a;
  const fb = b * b;
  const sx = (value: number) => roundSvgNumber(250 + (value / 3) * 160);
  const sy = (value: number) => roundSvgNumber(154 - (value / 6) * 112);
  const left = Math.min(a, b);
  const right = Math.max(a, b);
  const area = `M${sx(left)} ${sy(0)}${Array.from(
    { length: 41 },
    (_, index) => {
      const x = left + ((right - left) * index) / 40;
      return `L${sx(x)} ${sy(2 * x)}`;
    },
  ).join("")}L${sx(right)} ${sy(0)}Z`;
  const number = (value: number) => format.number(value);

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
            display={`$${number(a)}$`}
            min={-3}
            max={3}
            onChange={setA}
          />
          <DemoRange
            label={t.markdown("b")}
            value={b}
            display={`$${number(b)}$`}
            min={-3}
            max={3}
            onChange={setB}
          />
        </>
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", { value: number(fb - fa) })}
        />
      }
    >
      <svg viewBox="0 0 500 280" role="img" aria-label={t("label")}>
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
        <path d={area} fill="currentColor" fillOpacity=".2" />
        <path
          d="M62 154H454M250 28V260"
          fill="none"
          stroke="currentColor"
          strokeOpacity=".25"
        />
        <line
          x1={sx(-3)}
          y1={sy(-6)}
          x2={sx(3)}
          y2={sy(6)}
          stroke="currentColor"
          strokeWidth="2.75"
        />
        <line
          x1={sx(a)}
          y1="32"
          x2={sx(b)}
          y2="32"
          stroke="currentColor"
          strokeWidth="2"
          markerEnd={`url(#${marker})`}
        />
        <circle cx={sx(a)} cy={sy(2 * a)} r="5" fill="currentColor" />
        <circle
          cx={sx(b)}
          cy={sy(2 * b)}
          r="5"
          fill="var(--background)"
          stroke="currentColor"
          strokeWidth="2"
        />
        <SvgTex x={442} y={141} width={28} source="x" />
        <SvgTex x={258} y={20} width={28} source="y" />
        <SvgTex x={12} y={22} width={86} source="f(x)=2x" />
        <SvgTex x={sx(a) - 8} y={14} width={34} source="a" />
        <SvgTex x={sx(b) + 4} y={14} width={34} source="b" />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <p>
          <Tex
            source={String.raw`F(b)-F(a)=${number(fb)}-${number(fa)}=${number(fb - fa)}`}
          />
        </p>
      </div>
    </DemoFrame>
  );
}
