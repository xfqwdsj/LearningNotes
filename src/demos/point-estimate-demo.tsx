"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function PointEstimateDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [x, setX] = useState(2);
  const [mean, setMean] = useState(true);
  const value = mean ? (x + 4) / 2 : x;
  const sx = (v: number) => 55 + (v / 8) * 350;
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label={t.markdown("observation")}
            value={x}
            display={String(x)}
            min={0}
            max={8}
            onChange={setX}
          />
          <div
            role="group"
            aria-label={t("method")}
            className="grid grid-cols-2 gap-2"
          >
            {[true, false].map((v) => (
              <Button
                type="button"
                key={String(v)}
                size="sm"
                className="w-full"
                variant={mean === v ? "default" : "outline"}
                aria-pressed={mean === v}
                onClick={() => setMean(v)}
              >
                <IcuMarkdownText value={t.markdown(v ? "mean" : "first")} />
              </Button>
            ))}
          </div>
        </>
      }
      conclusion={<IcuMarkdownText value={t.markdown("result", { value })} />}
    >
      <svg
        viewBox="0 0 460 180"
        role="img"
        aria-label={t("graphLabel", { x, value })}
      >
        <line
          x1="55"
          y1="70"
          x2="405"
          y2="70"
          stroke="currentColor"
          strokeOpacity=".25"
        />
        <line
          x1="55"
          y1="120"
          x2="405"
          y2="120"
          stroke="currentColor"
          strokeOpacity=".25"
        />
        <circle cx={sx(x)} cy="64" r="5" fill="currentColor" />
        <circle
          cx={sx(4)}
          cy="76"
          r="5"
          fill="var(--background)"
          stroke="currentColor"
          strokeWidth="2"
        />
        <line
          x1={sx(value)}
          y1="109"
          x2={sx(value)}
          y2="131"
          stroke="currentColor"
          strokeWidth="4"
        />
        <SvgTex x={15} y={58} width={38} source={String.raw`x_i`} />
        <SvgTex x={15} y={108} width={38} source={String.raw`\hat\mu`} />
        <SvgTex x={45} y={140} width={25} source="0" />
        <SvgTex x={sx(4) - 8} y={140} width={25} source="4" />
        <SvgTex x={395} y={140} width={25} source="8" />
      </svg>
      <div className="px-6 py-4 text-sm">
        <Tex
          source={String.raw`${mean ? `\\frac{${x}+4}{2}` : `${x}`}=${value}`}
        />
      </div>
    </DemoFrame>
  );
}
