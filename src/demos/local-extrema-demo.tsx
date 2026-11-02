"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

export default function LocalExtremaDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [kind, setKind] = useState<"min" | "max" | "saddle">("min");
  const [theta, setTheta] = useState(0);
  const radians = (theta * Math.PI) / 180;
  const sign =
    kind === "min"
      ? 1
      : kind === "max"
        ? -1
        : Math.cos(2 * radians) >= 0
          ? 1
          : -1;
  const value = kind === "saddle" ? Math.cos(2 * radians) : sign;
  const sx = (valueX: number) => roundSvgNumber(250 + valueX * 125);
  const sy = (valueY: number) => roundSvgNumber(155 - valueY * 95);
  const curve = Array.from({ length: 81 }, (_, index) => {
    const valueX = -1.4 + (2.8 * index) / 80;
    return `${index === 0 ? "M" : "L"}${sx(valueX)} ${sy(sign * valueX * valueX)}`;
  }).join("");
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
          <div
            role="group"
            aria-label={t("choose")}
            className="grid grid-cols-3 gap-2"
          >
            {(["min", "max", "saddle"] as const).map((valueKind) => (
              <Button
                key={valueKind}
                type="button"
                size="sm"
                className="w-full min-w-0 px-0"
                variant={kind === valueKind ? "default" : "outline"}
                aria-pressed={kind === valueKind}
                onClick={() => setKind(valueKind)}
              >
                <IcuMarkdownText value={t.markdown(valueKind)} />
              </Button>
            ))}
          </div>
          <DemoRange
            label={t.markdown("theta")}
            value={theta}
            display={`$${theta}^{\\circ}$`}
            min={0}
            max={360}
            step={15}
            onChange={setTheta}
          />
        </>
      }
      conclusion={<IcuMarkdownText value={t.markdown(kind + "Result")} />}
    >
      <svg viewBox="0 0 500 310" role="img" aria-label={t("label")}>
        <path
          d="M82 155H418M250 24V286"
          fill="none"
          stroke="currentColor"
          strokeOpacity=".22"
        />
        <path d={curve} fill="none" stroke="currentColor" strokeWidth="2.75" />
        {kind === "saddle" && (
          <path
            d={Array.from({ length: 81 }, (_, index) => {
              const valueX = -1.4 + (2.8 * index) / 80;
              return `${index === 0 ? "M" : "L"}${sx(valueX)} ${sy(-sign * valueX * valueX)}`;
            }).join("")}
            fill="none"
            stroke="currentColor"
            strokeOpacity=".45"
            strokeWidth="2"
            strokeDasharray="6 4"
          />
        )}
        <circle cx="250" cy="155" r="6" fill="currentColor" />
        <circle
          cx={sx(sign)}
          cy={sy(value)}
          r="6"
          fill="var(--background)"
          stroke="currentColor"
          strokeWidth="2"
        />
        <SvgTex x={410} y={137} width={28} source="x" />
        <SvgTex x={258} y={16} width={28} source="f" />
        <SvgTex x={258} y={164} width={28} source="O" />
        <SvgTex
          x={Math.min(366, sx(sign) + 8)}
          y={Math.max(24, sy(value) - 24)}
          width={82}
          source={String.raw`f=${number(value)}`}
        />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <p>
          <Tex
            source={String.raw`f(\cos\theta,\sin\theta)=${number(value)},\qquad f(0,0)=0`}
          />
        </p>
      </div>
    </DemoFrame>
  );
}
