"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import { roundSvgNumber } from "./svg";
import type { DemoComponentProps } from "./types";
export default function PValueDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [z, setZ] = useState(1);
  const [side, setSide] = useState<"right" | "left" | "two">("right");
  const cdf = [0.02275, 0.15866, 0.5, 0.84134, 0.97725][z + 2] ?? 0.5;
  const p =
    side === "right"
      ? 1 - cdf
      : side === "left"
        ? cdf
        : 2 * Math.min(cdf, 1 - cdf);
  const sx = (x: number) => roundSvgNumber(230 + x * 43);
  const sy = (x: number) =>
    roundSvgNumber(
      205 - (Math.exp((-x * x) / 2) / Math.sqrt(2 * Math.PI)) * 390,
    );
  const xs = Array.from({ length: 161 }, (_, i) => -4 + i * 0.05);
  const curve = xs.map((x) => `${sx(x)},${sy(x)}`).join(" ");
  const area = (low: number, high: number) => {
    const points = Array.from(
      { length: 81 },
      (_, i) => low + ((high - low) * i) / 80,
    );
    return `${sx(low)},205 ${points.map((x) => `${sx(x)},${sy(x)}`).join(" ")} ${sx(high)},205`;
  };
  const regions =
    side === "left"
      ? [[-4, z]]
      : side === "right"
        ? [[z, 4]]
        : [
            [-4, -Math.abs(z)],
            [Math.abs(z), 4],
          ];
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label={t.markdown("z")}
            value={z}
            display={String(z)}
            min={-2}
            max={2}
            onChange={setZ}
          />
          <div
            role="group"
            aria-label={t("side")}
            className="grid grid-cols-3 gap-2"
          >
            {(["left", "right", "two"] as const).map((v) => (
              <Button
                type="button"
                key={v}
                size="sm"
                className="w-full min-w-0 px-0"
                variant={side === v ? "default" : "outline"}
                aria-pressed={side === v}
                onClick={() => setSide(v)}
              >
                <IcuMarkdownText value={t.markdown(v)} />
              </Button>
            ))}
          </div>
        </>
      }
      conclusion={
        <IcuMarkdownText value={t.markdown("result", { p: p.toFixed(4) })} />
      }
    >
      <p className="px-6 pt-4 text-sm">
        <IcuMarkdownText value={t.raw("graphNote") as string} />
      </p>
      <svg
        viewBox="0 0 460 240"
        role="img"
        aria-label={t("graphLabel", { z, side: t(side), p: p.toFixed(4) })}
      >
        <line
          x1="58"
          y1="205"
          x2="402"
          y2="205"
          stroke="currentColor"
          strokeOpacity=".35"
        />
        {regions.map((r, i) => (
          <polygon
            key={i}
            points={area(r[0] ?? -4, r[1] ?? 4)}
            fill="currentColor"
            fillOpacity=".2"
          />
        ))}
        <polyline
          points={curve}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <line
          x1={sx(z)}
          y1={sy(z)}
          x2={sx(z)}
          y2="205"
          stroke="currentColor"
          strokeDasharray="4 3"
        />
        <SvgTex x={sx(z) - 10} y={210} width={36} source={String(z)} />
        <SvgTex x={405} y={210} width={25} source="z" />
      </svg>
      <div className="px-6 py-4 text-sm">
        <Tex source={String.raw`z=${z},\quad p\approx${p.toFixed(4)}`} />
      </div>
    </DemoFrame>
  );
}
