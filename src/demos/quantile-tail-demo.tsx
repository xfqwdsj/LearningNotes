"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import { roundSvgNumber } from "./svg";
import type { DemoComponentProps } from "./types";
export default function QuantileTailDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [index, setIndex] = useState(1);
  const choices = [
    { a: "0.10", z: "1.282" },
    { a: "0.05", z: "1.645" },
    { a: "0.025", z: "1.960" },
    { a: "0.01", z: "2.326" },
  ];
  const v = choices[index] ?? choices[0]!;
  const boundary = Number(v.z);
  const sx = (x: number) => roundSvgNumber(230 + x * 43);
  const sy = (x: number) =>
    roundSvgNumber(
      205 - (Math.exp((-x * x) / 2) / Math.sqrt(2 * Math.PI)) * 390,
    );
  const xs = Array.from({ length: 161 }, (_, i) => -4 + i * 0.05);
  const curve = xs.map((x) => `${sx(x)},${sy(x)}`).join(" ");
  const tail = Array.from(
    { length: 81 },
    (_, i) => boundary + ((4 - boundary) * i) / 80,
  );
  const shade = `${sx(boundary)},205 ${tail.map((x) => `${sx(x)},${sy(x)}`).join(" ")} ${sx(4)},205`;
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <div
          role="group"
          aria-label={t("choose")}
          className="grid grid-cols-4 gap-2"
        >
          {choices.map((c, i) => (
            <Button
              key={c.a}
              type="button"
              size="sm"
              className="w-full min-w-0 px-0"
              variant={i === index ? "default" : "outline"}
              aria-pressed={i === index}
              onClick={() => setIndex(i)}
            >
              {c.a}
            </Button>
          ))}
        </div>
      }
      conclusion={
        <IcuMarkdownText value={t.markdown("result", { alpha: v.a, z: v.z })} />
      }
    >
      <svg
        viewBox="0 0 460 240"
        role="img"
        aria-label={t("graphLabel", { alpha: v.a, z: v.z })}
      >
        <line
          x1="58"
          y1="205"
          x2="402"
          y2="205"
          stroke="currentColor"
          strokeOpacity=".35"
        />
        <polygon points={shade} fill="currentColor" fillOpacity=".2" />
        <polyline
          points={curve}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <line
          x1={sx(boundary)}
          y1={sy(boundary)}
          x2={sx(boundary)}
          y2="205"
          stroke="currentColor"
          strokeDasharray="4 3"
        />
        <SvgTex x={sx(boundary) - 15} y={210} width={50} source={v.z} />
        <SvgTex x={405} y={210} width={25} source="z" />
      </svg>
      <div className="px-6 py-4 text-sm">
        <Tex source={String.raw`P(Z>${v.z})\approx${v.a}`} />
      </div>
    </DemoFrame>
  );
}
