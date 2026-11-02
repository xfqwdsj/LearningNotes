"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function CovarianceDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [joint, setJoint] = useState(0.25);
  const cov = joint - 0.25,
    rho = 4 * cov,
    difference = 0.5 - 2 * cov;
  const num = (v: number) =>
    format.number(Math.abs(v) < 1e-10 ? 0 : v, { maximumFractionDigits: 2 });
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <DemoRange
          label={t.markdown("joint")}
          value={joint}
          display={num(joint)}
          min={0}
          max={0.5}
          step={0.05}
          onChange={setJoint}
        />
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", {
            cov: num(cov),
            rho: num(rho),
            variance: num(difference),
          })}
        />
      }
    >
      <svg
        viewBox="0 0 460 170"
        role="img"
        aria-label={t("diagram", { cov: num(cov), rho: num(rho) })}
      >
        <rect
          x="50"
          y="30"
          width="360"
          height="90"
          fill="currentColor"
          opacity=".08"
        />
        <rect
          x="50"
          y="30"
          width={720 * joint}
          height="90"
          fill="currentColor"
          opacity=".65"
        />
        <line
          x1="230"
          x2="230"
          y1="25"
          y2="125"
          stroke="currentColor"
          opacity=".4"
        />
        <SvgTex x={37} y={130} width={25} source="0" />
        <SvgTex x={210} y={130} width={40} source="1/4" />
        <SvgTex x={390} y={130} width={35} source="1/2" />
      </svg>
    </DemoFrame>
  );
}
