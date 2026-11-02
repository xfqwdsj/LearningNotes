"use client";
import { createDemoTranslator, DemoRange } from "./demo-frame";
import { useId, useMemo, useState } from "react";
import { createContentFormatter } from "@/i18n/format";
import { Button } from "@/components/ui/button";
import { SvgTex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

const left = 64;
const right = 416;
const top = 34;
const bottom = 252;
const maxY = 1.15;
const sx = (x: number) => roundSvgNumber(left + x * (right - left));
const sy = (y: number) => roundSvgNumber(bottom - (y / maxY) * (bottom - top));

export default function RiemannDemo({
  title,
  locale,
  messages,
}: DemoComponentProps) {
  const t = useMemo(
    () => createDemoTranslator(locale, messages),
    [locale, messages],
  );
  const format = useMemo(() => createContentFormatter(locale), [locale]);
  const [count, setCount] = useState(4);
  const clipId = useId();
  const sum = useMemo(
    () =>
      Array.from({ length: count }, (_, index) => {
        const x = (index + 1) / count;
        return (x * x) / count;
      }).reduce((total, value) => total + value, 0),
    [count],
  );
  const exact = 1 / 3;
  const formattedSum = format.number(sum, { maximumFractionDigits: 4 });
  const formattedError = format.number(Math.abs(sum - exact), {
    maximumFractionDigits: 4,
  });
  const curve = Array.from({ length: 81 }, (_, index) => {
    const x = index / 80;
    return `${index ? "L" : "M"}${sx(x)},${sy(x * x)}`;
  }).join(" ");
  return (
    <section
      lang={locale}
      className="interactive-demo not-prose"
      aria-label={t("label")}
    >
      <div className="demo-header">
        <h3>
          <IcuMarkdownText value={title} />
        </h3>
        <span className="demo-status">
          <IcuMarkdownText value={t.markdown("count", { count })} />
        </span>
      </div>
      <p className="demo-intro">
        <IcuMarkdownText value={t.raw("intro") as string} />
      </p>
      <svg
        viewBox="0 0 460 300"
        role="img"
        aria-label={t("graphLabel", { count, sum: formattedSum })}
      >
        <defs>
          <clipPath id={clipId}>
            <rect x={left} y={top} width={right - left} height={bottom - top} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clipId})`}>
          <path
            d={`M${left} ${top}H${right}M${left} ${top}V${bottom}`}
            stroke="currentColor"
            strokeOpacity=".2"
          />
          {Array.from({ length: count }, (_, index) => {
            const x = (index + 1) / count;
            const width = (right - left) / count;
            const height = (x * x * (bottom - top)) / maxY;
            return (
              <rect
                key={index}
                x={sx(index / count)}
                y={bottom - height}
                width={width}
                height={height}
                fill="currentColor"
                fillOpacity=".12"
                stroke="currentColor"
                strokeOpacity=".3"
              />
            );
          })}
          <path d={curve} fill="none" stroke="currentColor" strokeWidth="2" />
        </g>
        <SvgTex x={right - 4} y={bottom + 6} width={18} source="x" />
        <SvgTex x={left - 22} y={top - 4} width={18} source="y" />
        <SvgTex x={left - 24} y={bottom - 12} width={18} source="0" />
        <SvgTex x={right - 14} y={bottom + 6} width={18} source="1" />
      </svg>
      <div className="demo-controls">
        <DemoRange
          label={t.markdown("countLabel")}
          display={String(count)}
          min={1}
          max={40}
          step={1}
          value={count}
          onChange={setCount}
        />
        <Button variant="outline" size="sm" onClick={() => setCount(4)}>
          <IcuMarkdownText value={t.markdown("reset")} />
        </Button>
      </div>
      <p className="demo-conclusion" aria-live="polite">
        <IcuMarkdownText
          value={t.markdown("conclusion", {
            sum: formattedSum,
            error: formattedError,
          })}
        />
      </p>
    </section>
  );
}
