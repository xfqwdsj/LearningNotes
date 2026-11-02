"use client";

import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";

export default function SurfaceSectionDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [z, setZ] = useState(0);
  const valid = Math.abs(z) <= 1;
  const radius = Math.sqrt(Math.max(0, 1 - z * z));
  const number = (value: number) =>
    format.number(value, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 3,
    });

  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <DemoRange
          label={t.markdown("z")}
          value={z}
          display={`$${number(z)}$`}
          min={-1.5}
          max={1.5}
          step={0.1}
          onChange={setZ}
        />
      }
      conclusion={
        <IcuMarkdownText value={t.markdown(valid ? "exists" : "empty")} />
      }
    >
      <svg viewBox="0 0 500 310" role="img" aria-label={t("label")}>
        <ellipse
          cx="250"
          cy="158"
          rx="106"
          ry="38"
          fill="none"
          stroke="currentColor"
          strokeOpacity=".2"
        />
        <ellipse
          cx="250"
          cy="158"
          rx="38"
          ry="106"
          fill="none"
          stroke="currentColor"
          strokeOpacity=".2"
        />
        <ellipse
          cx="250"
          cy="158"
          rx="106"
          ry="106"
          fill="currentColor"
          fillOpacity=".04"
          stroke="currentColor"
          strokeOpacity=".2"
        />
        {valid && (
          <ellipse
            cx={250 + z * 12}
            cy={158 - z * 63}
            rx={Math.max(2, radius * 106)}
            ry={Math.max(2, radius * 136)}
            fill="currentColor"
            fillOpacity=".14"
            stroke="currentColor"
            strokeWidth="2.5"
          />
        )}
        <SvgTex x={18} y={20} width={152} source="x^2+y^2+z^2=1" />
        {valid && (
          <SvgTex
            x={345}
            y={270}
            width={116}
            source={String.raw`r=${number(radius)}`}
          />
        )}
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <p>
          <Tex source={String.raw`x^2+y^2=${number(1 - z * z)}`} />
        </p>
      </div>
    </DemoFrame>
  );
}
