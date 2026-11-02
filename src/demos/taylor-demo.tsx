"use client";
import { createDemoTranslator, DemoRange } from "./demo-frame";
import { useId, useMemo, useState } from "react";
import { createContentFormatter } from "@/i18n/format";
import { Button } from "@/components/ui/button";
import { SvgTex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import { roundSvgNumber } from "./svg";
import type { DemoComponentProps } from "./types";

const left = 54;
const right = 418;
const top = 34;
const bottom = 254;
const sx = (x: number) =>
  roundSvgNumber(left + ((x + Math.PI) / (2 * Math.PI)) * (right - left));
const sy = (y: number) =>
  roundSvgNumber((top + bottom) / 2 - (y / 2.2) * ((bottom - top) / 2));

function taylorSin(x: number, order: number) {
  let total = 0;
  for (let k = 0; 2 * k + 1 <= order; k++) {
    const sign = k % 2 === 0 ? 1 : -1;
    let factorial = 1;
    for (let i = 2; i <= 2 * k + 1; i++) factorial *= i;
    total += (sign * x ** (2 * k + 1)) / factorial;
  }
  return total;
}

export default function TaylorDemo({
  title,
  locale,
  messages,
}: DemoComponentProps) {
  const t = useMemo(
    () => createDemoTranslator(locale, messages),
    [locale, messages],
  );
  const format = useMemo(() => createContentFormatter(locale), [locale]);
  const [index, setIndex] = useState(1);
  const order = index * 2 + 1;
  const clipId = useId();
  const samples = useMemo(
    () =>
      Array.from({ length: 121 }, (_, i) => {
        const x = -Math.PI + (i / 120) * 2 * Math.PI;
        return { x, sin: Math.sin(x), taylor: taylorSin(x, order) };
      }),
    [order],
  );
  const error = useMemo(
    () => Math.max(...samples.map(({ sin, taylor }) => Math.abs(sin - taylor))),
    [samples],
  );
  const line = (key: "sin" | "taylor") =>
    samples
      .map(
        ({ x, ...values }, i) => `${i ? "L" : "M"}${sx(x)},${sy(values[key])}`,
      )
      .join(" ");
  const formattedError = format.number(error, { maximumFractionDigits: 3 });
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
          <IcuMarkdownText value={t.markdown("degree", { order })} />
        </span>
      </div>
      <p className="demo-intro">
        <IcuMarkdownText value={t.raw("intro") as string} />
      </p>
      <svg
        viewBox="0 0 460 300"
        role="img"
        aria-label={t("graphLabel", { order, error: formattedError })}
      >
        <defs>
          <clipPath id={clipId}>
            <rect x={left} y={top} width={right - left} height={bottom - top} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clipId})`}>
          <path
            d={`M${left} ${sy(0)}H${right}M${sx(0)} ${top}V${bottom}`}
            stroke="currentColor"
            strokeOpacity=".2"
          />
          <path
            d={line("taylor")}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d={line("sin")}
            fill="none"
            stroke="currentColor"
            strokeOpacity=".4"
            strokeDasharray="5 5"
            strokeWidth="1.5"
          />
        </g>
        <SvgTex x={sx(-Math.PI) - 8} y={sy(0) + 5} width={40} source="-\pi" />
        <SvgTex x={sx(Math.PI) - 8} y={sy(0) + 5} width={30} source="\pi" />
        <SvgTex x={sx(0) + 5} y={top - 4} width={18} source="y" />
        <SvgTex x={right - 4} y={sy(0) + 5} width={18} source="x" />
      </svg>
      <div className="demo-controls">
        <DemoRange
          label={t.markdown("orderLabel")}
          display={t.markdown("degree", { order })}
          min={0}
          max={5}
          step={1}
          value={index}
          onChange={setIndex}
        />
        <Button variant="outline" size="sm" onClick={() => setIndex(1)}>
          <IcuMarkdownText value={t.markdown("reset")} />
        </Button>
      </div>
      <p className="demo-conclusion" aria-live="polite">
        <IcuMarkdownText
          value={t.markdown("conclusion", { error: formattedError })}
        />
      </p>
    </section>
  );
}
