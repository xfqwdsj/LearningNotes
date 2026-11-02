"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";

export default function IndicatorTossesDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [first, setFirst] = useState(false);
  const [second, setSecond] = useState(false);
  const a = Number(first);
  const b = Number(second);
  const selectedLabel = (selected: boolean) => (selected ? "heads" : "tails");
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <div
          className="grid grid-cols-2 gap-2"
          role="group"
          aria-label={t("outcome")}
        >
          {[
            { index: 1, selected: first, set: setFirst },
            { index: 2, selected: second, set: setSecond },
          ].map(({ index, selected, set }) => (
            <Button
              key={index}
              type="button"
              variant={selected ? "default" : "outline"}
              className="demo-bit-button w-full"
              aria-label={t("toss", { index })}
              aria-pressed={selected}
              onClick={() => set(!selected)}
            >
              <Tex source={`I_${index}`} />
              <strong>
                <IcuMarkdownText
                  value={t.markdown(selected ? "heads" : "tails")}
                />
              </strong>
            </Button>
          ))}
        </div>
      }
      conclusion={
        <IcuMarkdownText value={t.markdown("result", { a, b, total: a + b })} />
      }
    >
      <>
        <svg
          viewBox="0 0 460 190"
          role="img"
          aria-label={t("visual", { a, b, total: a + b })}
        >
          <rect
            x="62"
            y="64"
            width="82"
            height="66"
            rx="10"
            fill="currentColor"
            fillOpacity={first ? ".28" : ".06"}
            stroke="currentColor"
            strokeWidth="2"
          />
          <SvgTex x={77} y={82} width={54} source={String.raw`I_1=${a}`} />
          <SvgTex
            x={83}
            y={111}
            width={42}
            source={String.raw`\text{${t(selectedLabel(first))}}`}
          />
          <rect
            x="188"
            y="64"
            width="82"
            height="66"
            rx="10"
            fill="currentColor"
            fillOpacity={second ? ".28" : ".06"}
            stroke="currentColor"
            strokeWidth="2"
          />
          <SvgTex x={203} y={82} width={54} source={String.raw`I_2=${b}`} />
          <SvgTex
            x={209}
            y={111}
            width={42}
            source={String.raw`\text{${t(selectedLabel(second))}}`}
          />
          <SvgTex x={292} y={82} width={24} source="+" />
          <rect
            x="338"
            y="64"
            width="78"
            height="66"
            rx="10"
            fill="currentColor"
            fillOpacity=".16"
            stroke="currentColor"
            strokeWidth="2"
          />
          <SvgTex x={351} y={82} width={52} source={String.raw`N=${a + b}`} />
          <SvgTex
            x={85}
            y={155}
            width={288}
            source={String.raw`I_1+I_2=(${a})+(${b})=${a + b}`}
          />
        </svg>
        <div className="px-6 pb-4 text-sm">
          <IcuMarkdownText value={t.markdown("indicators", { a, b })} />
        </div>
      </>
    </DemoFrame>
  );
}
