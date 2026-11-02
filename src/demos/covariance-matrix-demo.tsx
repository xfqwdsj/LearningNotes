"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function CovarianceMatrixDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [cov, setCov] = useState(1),
    [coefficient, setCoefficient] = useState(2);
  const variance = 4 * coefficient ** 2 + 2 * coefficient * cov + 9;
  const num = (v: number) => format.number(v, { maximumFractionDigits: 2 });
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label={t.markdown("covariance")}
            value={cov}
            display={num(cov)}
            min={-6}
            max={6}
            step={0.5}
            onChange={setCov}
          />
          <DemoRange
            label={t.markdown("coefficient")}
            value={coefficient}
            display={num(coefficient)}
            min={-2}
            max={2}
            step={0.25}
            onChange={setCoefficient}
          />
        </>
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", {
            cov: num(cov),
            coefficient: num(coefficient),
            variance: num(variance),
          })}
        />
      }
    >
      <svg
        viewBox="0 0 460 120"
        role="img"
        aria-label={t("diagram", { variance: num(variance) })}
      >
        <rect
          x="50"
          y="30"
          width="360"
          height="30"
          fill="currentColor"
          opacity=".1"
        />
        <rect
          x="50"
          y="30"
          width={(360 * variance) / 49}
          height="30"
          fill="currentColor"
          opacity=".7"
        />
        <SvgTex x={40} y={70} width={25} source="0" />
        <SvgTex x={390} y={70} width={40} source="49" />
      </svg>
    </DemoFrame>
  );
}
