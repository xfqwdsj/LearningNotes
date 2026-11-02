"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, useDemoContent } from "./demo-frame";
import { SvgTex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";

export default function BoundaryOrientationDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [hole, setHole] = useState(false);

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
          {[false, true].map((value) => (
            <Button
              key={String(value)}
              type="button"
              size="sm"
              className="w-full"
              variant={hole === value ? "default" : "outline"}
              aria-pressed={hole === value}
              onClick={() => setHole(value)}
            >
              <IcuMarkdownText value={t.markdown(value ? "annulus" : "disk")} />
            </Button>
          ))}
        </div>
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown(hole ? "annulusResult" : "diskResult")}
        />
      }
    >
      <svg viewBox="0 0 500 310" role="img" aria-label={t("label")}>
        <circle
          cx="250"
          cy="154"
          r="105"
          fill="currentColor"
          fillOpacity=".12"
        />
        <circle
          cx="250"
          cy="154"
          r="105"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
        />
        {hole && (
          <>
            <circle cx="250" cy="154" r="42" fill="var(--background)" />
            <circle
              cx="250"
              cy="154"
              r="42"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />
          </>
        )}
        <path d="M250 42L239 55H261Z" fill="currentColor" />
        <path d="M250 266L239 253H261Z" fill="currentColor" opacity=".55" />
        {hole && (
          <>
            <path d="M250 106L260 117H240Z" fill="currentColor" />
            <path d="M250 202L240 191H260Z" fill="currentColor" />
          </>
        )}
        <SvgTex x={371} y={43} width={102} source="\partial D" />
        {hole && <SvgTex x={299} y={117} width={76} source="\partial D_0" />}
        <SvgTex x={227} y={139} width={52} source="D" />
      </svg>
    </DemoFrame>
  );
}
