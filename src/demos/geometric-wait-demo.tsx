"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function GeometricWaitDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [p, setP] = useState(0.25),
    [k, setK] = useState(3);
  const num = (x: number) => format.number(x, { maximumFractionDigits: 3 });
  const value = (1 - p) ** (k - 1) * p;
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label={t.markdown("probability")}
            value={p}
            display={num(p)}
            min={0.05}
            max={1}
            step={0.05}
            onChange={setP}
          />
          <DemoRange
            label={t.markdown("trial")}
            value={k}
            display={String(k)}
            min={1}
            max={12}
            onChange={setK}
          />
        </>
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", { k, value: num(value) })}
        />
      }
    >
      <div
        className="flex h-36 items-end justify-around gap-1 px-6 pt-4"
        role="img"
        aria-label={t("diagram", { k, value: num(value) })}
      >
        {Array.from({ length: 12 }, (_, i) => (
          <div
            key={i}
            className="flex h-full flex-1 flex-col items-center justify-end"
          >
            <div
              className="w-full bg-current"
              style={{
                height: `${(1 - p) ** i * p * 100}%`,
                opacity: i + 1 === k ? 0.8 : 0.2,
              }}
            />
            <span className="w-full text-center">{i + 1}</span>
          </div>
        ))}
      </div>
    </DemoFrame>
  );
}
