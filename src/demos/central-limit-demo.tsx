"use client";
import { useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { SvgTex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import { uniformSampleMeans } from "./models";
import { roundSvgNumber } from "./svg";
import type { DemoComponentProps } from "./types";
const sizes = [1, 2, 4, 8, 16, 32] as const;
export default function CentralLimitDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [index, setIndex] = useState(0),
    [seed, setSeed] = useState(1234),
    [standard, setStandard] = useState(false);
  const n = sizes[index]!;
  const means = useMemo(() => uniformSampleMeans(n, 800, seed), [n, seed]);
  const values = standard
    ? means.map((mean) => (mean - 0.5) * Math.sqrt(12 * n))
    : means;
  const min = standard ? -4 : 0,
    max = standard ? 4 : 1,
    width = (max - min) / 24;
  const bins = Array<number>(24).fill(0);
  let outside = 0;
  for (const value of values) {
    const bin = Math.floor((value - min) / width);
    if (bin >= 0 && bin < bins.length) bins[bin] = bins[bin]! + 1;
    else outside++;
  }
  const density = bins.map((count) => count / (values.length * width));
  const ceiling = Math.max(...density, standard ? 0.45 : 1) * 1.1;
  const x = (value: number) =>
    roundSvgNumber(40 + ((value - min) / (max - min)) * 380);
  const y = (value: number) => roundSvgNumber(245 - (value / ceiling) * 200);
  const normal = Array.from({ length: 81 }, (_, i) => {
    const z = -4 + i / 10;
    return `${i === 0 ? "M" : "L"}${x(z)} ${y(Math.exp((-z * z) / 2) / Math.sqrt(2 * Math.PI))}`;
  }).join(" ");
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label={t.markdown("size")}
            value={index}
            display={format.number(n)}
            min={0}
            max={sizes.length - 1}
            onChange={setIndex}
          />
          <div className="demo-action-row">
            <Button
              variant={standard ? "default" : "outline"}
              size="sm"
              aria-pressed={standard}
              onClick={() => setStandard(!standard)}
            >
              <IcuMarkdownText value={t.markdown("standard")} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSeed(seed + 1)}
            >
              <RefreshCw />
              <IcuMarkdownText value={t.markdown("resample")} />
            </Button>
          </div>
        </>
      }
      conclusion={
        <>
          <IcuMarkdownText
            value={t.markdown(standard ? "standardResult" : "meanResult", {
              n,
            })}
          />
          {outside > 0 && (
            <p>
              <IcuMarkdownText
                value={t.markdown("outside", { count: outside })}
              />
            </p>
          )}
        </>
      }
    >
      <svg viewBox="0 0 460 300" role="img" aria-label={t("diagram", { n })}>
        {density.map((value, i) => (
          <rect
            key={i}
            x={roundSvgNumber(40 + (i * 380) / 24 + 0.5)}
            y={y(value)}
            width={roundSvgNumber(380 / 24 - 1)}
            height={245 - y(value)}
            fill="currentColor"
            opacity=".3"
          />
        ))}
        {standard && (
          <path
            d={normal}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          />
        )}
        <path
          d="M40 35V245H420"
          fill="none"
          stroke="currentColor"
          opacity=".3"
        />
        {(standard ? [-4, -2, 0, 2, 4] : [0, 0.25, 0.5, 0.75, 1]).map(
          (tick) => (
            <SvgTex
              key={tick}
              x={x(tick) - 20}
              y={251}
              width={40}
              align="center"
              source={String(tick)}
            />
          ),
        )}
        <SvgTex
          x={195}
          y={276}
          width={70}
          source={standard ? "Z_n" : "\\bar X_n"}
        />
      </svg>
    </DemoFrame>
  );
}
