"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, useDemoContent } from "./demo-frame";
import { Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";

export default function EventOperationsDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [a, setA] = useState([2, 4, 6]);
  const [b, setB] = useState([1, 2, 3]);
  const points = [1, 2, 3, 4, 5, 6];
  const toggle = (values: number[], value: number) =>
    values.includes(value)
      ? values.filter((item) => item !== value)
      : [...values, value].sort((x, y) => x - y);
  const display = (values: number[]) =>
    values.length ? values.join(", ") : String.raw`$\varnothing$`;
  const describe = (values: number[]) =>
    values.length ? values.join(", ") : t("emptySet");
  const union = points.filter(
    (point) => a.includes(point) || b.includes(point),
  );
  const intersection = points.filter(
    (point) => a.includes(point) && b.includes(point),
  );
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
        <div className="demo-event-operations-summary">
          <div>
            <IcuMarkdownText
              value={t.markdown("selected", {
                a: display(a),
                b: display(b),
              })}
            />
          </div>
          <div>
            <IcuMarkdownText
              value={t.markdown("result", {
                union: display(union),
                intersection: display(intersection),
              })}
            />
          </div>
        </div>
      }
    >
      <div
        className="demo-event-operations-visual"
        role="img"
        aria-label={t("visual", {
          a: describe(a),
          b: describe(b),
          union: describe(union),
          intersection: describe(intersection),
        })}
      >
        <div className="demo-event-operations-legend" aria-hidden="true">
          <span className="demo-event-operations-legend-item">
            <span className="demo-event-operations-swatch" data-event="a" />
            <Tex source="A" />
          </span>
          <span className="demo-event-operations-legend-item">
            <span className="demo-event-operations-swatch" data-event="b" />
            <Tex source="B" />
          </span>
        </div>
        <div className="demo-event-operations-points">
          {points.map((point) => {
            const inA = a.includes(point),
              inB = b.includes(point);
            const label =
              inA && inB
                ? String.raw`A\cap B`
                : inA
                  ? "A"
                  : inB
                    ? "B"
                    : String.raw`\varnothing`;
            const membership =
              inA && inB ? "both" : inA ? "a" : inB ? "b" : "none";
            return (
              <div
                key={point}
                className="demo-event-operations-point"
                data-membership={membership}
              >
                <span className="demo-event-operations-number">{point}</span>
                <span className="demo-event-operations-membership">
                  <Tex source={label} />
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </DemoFrame>
  );
}
