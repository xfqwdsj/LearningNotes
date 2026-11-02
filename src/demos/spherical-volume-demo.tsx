"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function SphericalVolumeDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [degrees, setDegrees] = useState(60);
  const phi = (degrees * Math.PI) / 180;
  const x = 210 + 90 * Math.sin(phi),
    y = 130 - 90 * Math.cos(phi);
  const d = `M210 130 L210 40 A90 90 0 ${degrees > 180 ? 1 : 0} 1 ${x} ${y} Z`;
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <DemoRange
          label={t.markdown("angle")}
          value={degrees}
          display={`${degrees}°`}
          min={0}
          max={180}
          step={5}
          onChange={setDegrees}
        />
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", {
            volume: ((2 * Math.PI * (1 - Math.cos(phi))) / 3).toFixed(3),
          })}
        />
      }
    >
      <svg
        viewBox="0 0 460 260"
        role="img"
        aria-label={t("graph", { angle: degrees })}
      >
        <circle
          cx="210"
          cy="130"
          r="90"
          fill="currentColor"
          fillOpacity=".06"
          stroke="currentColor"
          strokeOpacity=".45"
        />
        <path
          d={d}
          fill="currentColor"
          fillOpacity=".25"
          stroke="currentColor"
          strokeWidth="2"
        />
        <line
          x1="210"
          y1="20"
          x2="210"
          y2="240"
          stroke="currentColor"
          strokeOpacity=".35"
        />
        <line
          x1="100"
          y1="130"
          x2="320"
          y2="130"
          stroke="currentColor"
          strokeOpacity=".35"
        />
        <SvgTex x={218} y={10} width={24} source="z" />
        <SvgTex x={222} y={67} width={35} source={String.raw`\varphi`} />
      </svg>
      <div className="px-6 py-4 text-sm">
        <Tex
          source={String.raw`V=\int_0^{2\pi}\int_0^{\varphi}\int_0^1 r^2\sin u\,\mathrm dr\,\mathrm du\,\mathrm d\theta=\frac{2\pi}{3}(1-\cos\varphi)`}
          display
        />
      </div>
    </DemoFrame>
  );
}
