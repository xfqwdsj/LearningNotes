"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, useDemoContent } from "./demo-frame";
import { SvgTex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function EventPartitionDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [a, setA] = useState([1, 2, 3]),
    [b, setB] = useState([4, 5, 6]);
  const points = [1, 2, 3, 4, 5, 6];
  const toggle = (s: number[], v: number) =>
    s.includes(v) ? s.filter((x) => x !== v) : [...s, v];
  const overlap = points.filter((x) => a.includes(x) && b.includes(x));
  const missing = points.filter((x) => !a.includes(x) && !b.includes(x));
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          {[
            { name: "A", values: a, set: setA },
            { name: "B", values: b, set: setB },
          ].map(({ name, values, set }) => (
            <div
              key={name}
              role="group"
              aria-label={t("event", { name })}
              className="grid gap-2"
            >
              <span className="text-xs font-medium">
                <IcuMarkdownText value={t.markdown("event", { name })} />
              </span>
              <div className="grid grid-cols-6 gap-2">
                {points.map((point) => (
                  <Button
                    key={point}
                    type="button"
                    variant={values.includes(point) ? "default" : "outline"}
                    size="sm"
                    className="w-full min-w-0 px-0"
                    aria-label={t("point", { name, point })}
                    aria-pressed={values.includes(point)}
                    onClick={() => set(toggle(values, point))}
                  >
                    {point}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </>
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown(
            overlap.length === 0 && missing.length === 0 ? "valid" : "invalid",
            { overlap: overlap.length, missing: missing.length },
          )}
        />
      }
    >
      <>
        <svg
          viewBox="0 0 460 220"
          role="img"
          aria-label={t("visual", {
            overlap: overlap.length,
            missing: missing.length,
          })}
        >
          {points.map((point, index) => {
            const inA = a.includes(point),
              inB = b.includes(point);
            const x = 72 + index * 58;
            const label =
              inA && inB
                ? String.raw`A\cap B`
                : inA
                  ? "A"
                  : inB
                    ? "B"
                    : String.raw`\varnothing`;
            return (
              <g key={point}>
                <rect
                  x={x}
                  y="62"
                  width="48"
                  height="100"
                  rx="7"
                  fill="currentColor"
                  fillOpacity={inA && inB ? 0.3 : inA || inB ? 0.1 : 0.03}
                  stroke="currentColor"
                  strokeOpacity={inA && inB ? "1" : inA || inB ? ".65" : ".2"}
                  strokeWidth={inA && inB ? "2.5" : "1.2"}
                />
                <SvgTex x={x + 12} y={78} width={24} source={String(point)} />
                <SvgTex
                  x={x + (inA && inB ? 2 : 15)}
                  y={119}
                  width={inA && inB ? 44 : 20}
                  source={label}
                />
              </g>
            );
          })}
        </svg>
        <div className="px-6 pb-4">
          <IcuMarkdownText
            value={t.markdown("status", {
              overlap: overlap.length,
              missing: missing.length,
            })}
          />
        </div>
      </>
    </DemoFrame>
  );
}
