"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function PythonRangeDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [start, setStart] = useState(1),
    [stop, setStop] = useState(6),
    [step, setStep] = useState(2);
  const values: number[] = [];
  for (let n = start; step > 0 ? n < stop : n > stop; n += step) values.push(n);
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label={t.markdown("start")}
            value={start}
            display={String(start)}
            min={-3}
            max={6}
            onChange={setStart}
          />
          <DemoRange
            label={t.markdown("stop")}
            value={stop}
            display={String(stop)}
            min={-3}
            max={6}
            onChange={setStop}
          />
          <div
            role="group"
            aria-label={t("step")}
            className="grid grid-cols-4 gap-2"
          >
            {[-2, -1, 1, 2].map((v) => (
              <Button
                key={v}
                type="button"
                size="sm"
                variant={v === step ? "default" : "outline"}
                className="w-full"
                aria-pressed={v === step}
                onClick={() => setStep(v)}
              >
                {v}
              </Button>
            ))}
          </div>
        </>
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown(values.length ? "result" : "empty", {
            start,
            stop,
            step,
            count: values.length,
          })}
        />
      }
    >
      <div
        className="grid grid-cols-5 gap-1 px-6 py-4"
        role="img"
        aria-label={t("diagram", { values: values.join(", ") || t("none") })}
      >
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            className={`rounded-md border py-2 text-center text-sm ${i < values.length ? "bg-muted" : "invisible"}`}
          >
            {values[i] ?? 0}
          </div>
        ))}
      </div>
    </DemoFrame>
  );
}
