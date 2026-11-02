"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function CylindricalVolumeDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [r, setR] = useState(2);
  const [h, setH] = useState(2);
  const rx = 28 * r,
    top = 230 - 40 * h;
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label={t.markdown("radius")}
            value={r}
            display={r.toFixed(1)}
            min={0.5}
            max={3}
            step={0.5}
            onChange={setR}
          />
          <DemoRange
            label={t.markdown("height")}
            value={h}
            display={h.toFixed(1)}
            min={0.5}
            max={4}
            step={0.5}
            onChange={setH}
          />
        </>
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", {
            volume: (Math.PI * r * r * h).toFixed(3),
          })}
        />
      }
    >
      <svg
        viewBox="0 0 460 280"
        role="img"
        aria-label={t("graph", { radius: r, height: h })}
      >
        <path
          d={`M ${230 - rx} 230 L ${230 - rx} ${top} M ${230 + rx} 230 L ${230 + rx} ${top}`}
          fill="none"
          stroke="currentColor"
        />
        <ellipse
          cx="230"
          cy="230"
          rx={rx}
          ry={rx * 0.26}
          fill="currentColor"
          fillOpacity=".08"
          stroke="currentColor"
        />
        <ellipse
          cx="230"
          cy={top}
          rx={rx}
          ry={rx * 0.26}
          fill="currentColor"
          fillOpacity=".18"
          stroke="currentColor"
        />
        <line
          x1="230"
          y1={top}
          x2={230 + rx}
          y2={top}
          stroke="currentColor"
          strokeWidth="2"
        />
        <line
          x1={230 + rx + 18}
          y1="230"
          x2={230 + rx + 18}
          y2={top}
          stroke="currentColor"
          strokeDasharray="4 3"
        />
        <SvgTex x={230 + rx / 2} y={top - 25} width={42} source="R" />
        <SvgTex
          x={230 + rx + 22}
          y={(top + 230) / 2 - 10}
          width={30}
          source="h"
        />
      </svg>
      <div className="px-6 py-4 text-sm">
        <Tex
          source={String.raw`V=\int_0^{2\pi}\int_0^R\int_0^h r\,\mathrm dz\,\mathrm dr\,\mathrm d\theta=\pi R^2h`}
          display
        />
      </div>
    </DemoFrame>
  );
}
