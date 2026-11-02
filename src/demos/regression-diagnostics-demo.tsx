"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, useDemoContent } from "./demo-frame";
import { SvgTex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function RegressionDiagnosticsDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [curved, setCurved] = useState(true);
  const residuals = curved ? [2, -1, -2, -1, 2] : [-1, 2, -2, 2, -1];
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <div
          role="group"
          aria-label={t("choose")}
          className="grid grid-cols-2 gap-2"
        >
          {[true, false].map((v) => (
            <Button
              key={String(v)}
              type="button"
              size="sm"
              variant={curved === v ? "default" : "outline"}
              aria-pressed={curved === v}
              onClick={() => setCurved(v)}
            >
              <IcuMarkdownText
                value={t.markdown(v ? "curved" : "alternating")}
              />
            </Button>
          ))}
        </div>
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown(curved ? "curvedResult" : "alternatingResult")}
        />
      }
    >
      <svg
        viewBox="0 0 460 240"
        role="img"
        aria-label={t(curved ? "curvedGraph" : "alternatingGraph")}
      >
        <line
          x1="55"
          y1="120"
          x2="405"
          y2="120"
          stroke="currentColor"
          strokeOpacity=".4"
          strokeDasharray="4 4"
        />
        {residuals.map((v, i) => (
          <circle
            key={i}
            cx={90 + i * 70}
            cy={120 - v * 35}
            r="5"
            fill="currentColor"
          />
        ))}
        <SvgTex x={20} y={110} width={30} source="0" />
        <SvgTex x={410} y={125} width={25} source="x" />
        <SvgTex x={25} y={25} width={25} source="e" />
      </svg>
    </DemoFrame>
  );
}
