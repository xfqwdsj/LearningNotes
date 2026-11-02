"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function LimitCancellationDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [x, setX] = useState(1.5);
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <DemoRange
          label={t.markdown("x")}
          value={x}
          display={x.toFixed(1)}
          min={0}
          max={2}
          step={0.1}
          onChange={setX}
        />
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown(x === 1 ? "undefined" : "defined")}
        />
      }
    >
      <svg
        viewBox="0 0 460 260"
        role="img"
        aria-label={t("graphLabel", { x: x.toFixed(1) })}
      >
        <line
          x1="60"
          y1="220"
          x2="390"
          y2="220"
          stroke="currentColor"
          strokeOpacity=".35"
        />
        <line
          x1="60"
          y1="30"
          x2="60"
          y2="220"
          stroke="currentColor"
          strokeOpacity=".35"
        />
        <line
          x1="60"
          y1="165"
          x2="360"
          y2="55"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <circle
          cx="210"
          cy="110"
          r="6"
          fill="var(--background)"
          stroke="currentColor"
          strokeWidth="2"
        />
        {x !== 1 && (
          <circle
            cx={60 + 150 * x}
            cy={220 - 55 * (x + 1)}
            r="5"
            fill="currentColor"
          />
        )}
        <SvgTex x={200} y={225} width={30} source="1" />
        <SvgTex x={25} y={100} width={28} source="2" />
        <SvgTex x={395} y={222} width={25} source="x" />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <p>
          <Tex
            source={`\\frac{x^2-1}{x-1}=${x === 1 ? `\\text{${t("undefinedLabel")}}` : (x + 1).toFixed(1)}`}
          />
        </p>
        <p>
          <Tex source={String.raw`x+1=${(x + 1).toFixed(1)}`} />
        </p>
      </div>
    </DemoFrame>
  );
}
