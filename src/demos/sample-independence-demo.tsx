"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, useDemoContent } from "./demo-frame";
import { SvgTex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";

export default function SampleIndependenceDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [replace, setReplace] = useState(true);
  const [firstRed, setFirstRed] = useState(true);
  const firstProbability = 1 / 2;
  const secondProbability = replace ? 1 / 2 : firstRed ? 0 : 1;

  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <div
            role="group"
            aria-label={t("mode")}
            className="grid grid-cols-2 gap-2"
          >
            {[true, false].map((value) => (
              <Button
                key={String(value)}
                type="button"
                size="sm"
                variant={replace === value ? "default" : "outline"}
                aria-pressed={replace === value}
                onClick={() => setReplace(value)}
              >
                <IcuMarkdownText
                  value={t.markdown(value ? "replace" : "noReplace")}
                />
              </Button>
            ))}
          </div>
          <div
            role="group"
            aria-label={t("first")}
            className="grid grid-cols-2 gap-2"
          >
            {[true, false].map((value) => (
              <Button
                key={String(value)}
                type="button"
                size="sm"
                variant={firstRed === value ? "default" : "outline"}
                aria-pressed={firstRed === value}
                onClick={() => setFirstRed(value)}
              >
                <IcuMarkdownText value={t.markdown(value ? "red" : "blue")} />
              </Button>
            ))}
          </div>
        </>
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown(replace ? "independent" : "dependent")}
        />
      }
    >
      <svg viewBox="0 0 500 300" role="img" aria-label={t("label")}>
        <circle
          cx="82"
          cy="150"
          r="28"
          fill={firstRed ? "currentColor" : "var(--background)"}
          stroke="currentColor"
          strokeWidth="2"
        />
        <line x1="110" y1="150" x2="210" y2="80" stroke="currentColor" />
        <line x1="110" y1="150" x2="210" y2="220" stroke="currentColor" />
        <circle
          cx="238"
          cy="80"
          r="25"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle
          cx="238"
          cy="220"
          r="25"
          fill="var(--background)"
          stroke="currentColor"
          strokeWidth="2"
        />
        <line
          x1="263"
          y1="80"
          x2="365"
          y2="45"
          stroke="currentColor"
          strokeOpacity=".4"
        />
        <line
          x1="263"
          y1="80"
          x2="365"
          y2="115"
          stroke="currentColor"
          strokeOpacity=".4"
        />
        <line
          x1="263"
          y1="220"
          x2="365"
          y2="185"
          stroke="currentColor"
          strokeOpacity=".4"
        />
        <line
          x1="263"
          y1="220"
          x2="365"
          y2="255"
          stroke="currentColor"
          strokeOpacity=".4"
        />
        <SvgTex x={52} y={184} width={58} source="\text{first}" />
        <SvgTex
          x={208}
          y={30}
          width={70}
          source={String.raw`P=${firstProbability}`}
        />
        <SvgTex
          x={208}
          y={272}
          width={72}
          source={String.raw`P=${firstProbability}`}
        />
        <SvgTex
          x={376}
          y={37}
          width={98}
          source={String.raw`P=${secondProbability}`}
        />
        <SvgTex
          x={376}
          y={107}
          width={98}
          source={String.raw`P=${1 - secondProbability}`}
        />
        <SvgTex
          x={376}
          y={177}
          width={98}
          source={String.raw`P=${secondProbability}`}
        />
        <SvgTex
          x={376}
          y={247}
          width={98}
          source={String.raw`P=${1 - secondProbability}`}
        />
      </svg>
    </DemoFrame>
  );
}
