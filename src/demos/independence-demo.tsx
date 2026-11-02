"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function IndependenceDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [intersection, setIntersection] = useState(0.25);
  const value = format.number(intersection, { maximumFractionDigits: 2 });
  const leftTop = intersection * 720;
  const leftBottom = (0.5 - intersection) * 720;
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <DemoRange
          label={t.markdown("intersection")}
          value={intersection}
          display={value}
          min={0}
          max={0.5}
          step={0.05}
          onChange={setIntersection}
        />
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown(
            intersection === 0.25 ? "independent" : "dependent",
            {
              value,
            },
          )}
        />
      }
    >
      <svg
        viewBox="0 0 460 300"
        role="img"
        aria-label={t("diagram", { value })}
      >
        <rect
          x="50"
          y="25"
          width={leftTop}
          height="110"
          fill="currentColor"
          opacity=".65"
        />
        <rect
          x={50 + leftTop}
          y="25"
          width={360 - leftTop}
          height="110"
          fill="currentColor"
          opacity=".2"
        />
        <rect
          x={50 + leftBottom}
          y="135"
          width={360 - leftBottom}
          height="110"
          fill="currentColor"
          opacity=".08"
        />
        <rect
          x="50"
          y="135"
          width={leftBottom}
          height="110"
          fill="currentColor"
          opacity=".35"
        />
        <rect
          x="50"
          y="25"
          width="360"
          height="220"
          fill="none"
          stroke="currentColor"
          opacity=".3"
        />
        <line
          x1="50"
          x2="410"
          y1="135"
          y2="135"
          stroke="currentColor"
          opacity=".3"
        />
        <SvgTex x={8} y={65} width={30} source="B" />
        <SvgTex x={8} y={175} width={30} source={"\\bar B"} />
      </svg>
    </DemoFrame>
  );
}
