"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";

export default function QuadricSectionDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [sphere, setSphere] = useState(true);
  const [z, setZ] = useState(0);
  const radius = Math.sqrt(Math.max(0, 1 - z * z));
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
          <div
            role="group"
            aria-label={t("choose")}
            className="grid grid-cols-2 gap-2"
          >
            {[true, false].map((value) => (
              <Button
                key={String(value)}
                type="button"
                size="sm"
                className="w-full"
                variant={sphere === value ? "default" : "outline"}
                aria-pressed={sphere === value}
                onClick={() => setSphere(value)}
              >
                <IcuMarkdownText
                  value={t.markdown(value ? "sphere" : "saddle")}
                />
              </Button>
            ))}
          </div>
          <DemoRange
            label={t.markdown("z")}
            value={z}
            display={`$${number(z)}$`}
            min={-1.5}
            max={1.5}
            step={0.1}
            onChange={setZ}
          />
        </>
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown(
            sphere
              ? Math.abs(z) > 1
                ? "sphereEmpty"
                : Math.abs(z) === 1
                  ? "spherePoint"
                  : "sphereCircle"
              : z === 0
                ? "saddleLines"
                : "saddleHyperbola",
          )}
        />
      }
    >
      <svg viewBox="0 0 500 320" role="img" aria-label={t("label")}>
        {sphere ? (
          <>
            <ellipse
              cx="250"
              cy="158"
              rx="102"
              ry="31"
              fill="none"
              stroke="currentColor"
              strokeOpacity=".2"
            />
            <ellipse
              cx="250"
              cy="158"
              rx="31"
              ry="102"
              fill="none"
              stroke="currentColor"
              strokeOpacity=".2"
            />
            {Math.abs(z) <= 1 && (
              <ellipse
                cx="250"
                cy={158 - z * 76}
                rx={radius * 102}
                ry={Math.max(5, radius * 31)}
                fill="currentColor"
                fillOpacity=".18"
                stroke="currentColor"
                strokeWidth="2.5"
              />
            )}
          </>
        ) : (
          <>
            {[-1, -0.5, 0.5, 1].map((level) => (
              <g key={level}>
                <path
                  d={`M250 ${158 - level * 45}Q${250 + 60} ${158 - level * 45}, ${250 + 92} 52`}
                  fill="none"
                  stroke="currentColor"
                  strokeOpacity=".16"
                />
                <path
                  d={`M250 ${158 - level * 45}Q${250 - 60} ${158 - level * 45}, ${250 - 92} 52`}
                  fill="none"
                  stroke="currentColor"
                  strokeOpacity=".16"
                />
              </g>
            ))}
            <line
              x1="130"
              y1="158"
              x2="370"
              y2="158"
              stroke={z === 0 ? "currentColor" : "currentColor"}
              strokeOpacity={z === 0 ? 0.8 : 0.2}
              strokeWidth={z === 0 ? 3 : 1}
            />
          </>
        )}
        <circle cx="250" cy="158" r="4" fill="currentColor" />
        <SvgTex
          x={18}
          y={20}
          width={118}
          source={sphere ? "x^2+y^2+z^2=1" : "z=x^2-y^2"}
        />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <p>
          <Tex
            source={String.raw`${sphere ? `x^2+y^2=${number(1 - z * z)}` : `x^2-y^2=${number(z)}`}`}
          />
        </p>
      </div>
    </DemoFrame>
  );
}
