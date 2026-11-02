"use client";
import { createDemoTranslator, DemoRange } from "./demo-frame";
import { useMemo, useState } from "react";
import { createContentFormatter } from "@/i18n/format";
import { Button } from "@/components/ui/button";
import { SvgTex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
import { roundSvgNumber } from "./svg";

const left = 48;
const right = 430;
const top = 32;
const bottom = 250;
const maxY = 0.95;
const xMin = -6;
const xMax = 6;
const sx = (x: number) =>
  roundSvgNumber(left + ((x - xMin) / (xMax - xMin)) * (right - left));
const sy = (y: number) => roundSvgNumber(bottom - (y / maxY) * (bottom - top));
const density = (x: number, mu: number, sigma: number) =>
  Math.exp(-((x - mu) ** 2) / (2 * sigma ** 2)) /
  (sigma * Math.sqrt(2 * Math.PI));
function erf(x: number) {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * ax);
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) *
      t +
      0.254829592) *
      t *
      Math.exp(-ax * ax);
  return sign * y;
}
const probability = (z: number) => erf(z / Math.SQRT2);

export default function NormalDemo({
  title,
  locale,
  messages,
}: DemoComponentProps) {
  const t = useMemo(
    () => createDemoTranslator(locale, messages),
    [locale, messages],
  );
  const format = useMemo(() => createContentFormatter(locale), [locale]);
  const [mu, setMu] = useState(0);
  const [sigma, setSigma] = useState(1);
  const [z, setZ] = useState(1);
  const p = probability(z);
  const formattedP = format.number(p * 100, { maximumFractionDigits: 1 });
  const curve = Array.from({ length: 161 }, (_, index) => {
    const x = xMin + (index / 160) * (xMax - xMin);
    return `${index ? "L" : "M"}${sx(x)},${sy(density(x, mu, sigma))}`;
  }).join(" ");
  const lower = Math.max(xMin, mu - z * sigma);
  const upper = Math.min(xMax, mu + z * sigma);
  const area = Array.from({ length: 81 }, (_, index) => {
    const x = lower + (index / 80) * (upper - lower);
    return `${index ? "L" : "M"}${sx(x)},${sy(density(x, mu, sigma))}`;
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
          <IcuMarkdownText
            value={t.markdown("probability", { value: formattedP })}
          />
        </span>
      </div>
      <p className="demo-intro">
        <IcuMarkdownText value={t.raw("intro") as string} />
      </p>
      <svg
        viewBox="0 0 460 300"
        role="img"
        aria-label={t("graphLabel", {
          mu: format.number(mu),
          sigma: format.number(sigma),
          z: format.number(z),
          value: formattedP,
        })}
      >
        <path
          d={`M${left} ${bottom}H${right}M${sx(0)} ${top}V${bottom}`}
          stroke="currentColor"
          strokeOpacity=".2"
        />
        <path
          d={`${area}L${sx(upper)},${bottom}L${sx(lower)},${bottom}Z`}
          fill="currentColor"
          fillOpacity=".15"
        />
        <path d={curve} fill="none" stroke="currentColor" strokeWidth="2" />
        <SvgTex x={sx(0) - 4} y={bottom + 5} width={18} source="0" />
        <SvgTex x={right - 4} y={bottom + 5} width={18} source="x" />
        <SvgTex x={sx(mu) - 6} y={bottom - 18} width={18} source="\mu" />
      </svg>
      <div className="demo-controls">
        <DemoRange
          label={t.markdown("mean")}
          display={format.number(mu, { maximumFractionDigits: 1 })}
          min={-2}
          max={2}
          step={0.1}
          value={mu}
          onChange={setMu}
        />
        <DemoRange
          label={t.markdown("sigma")}
          display={format.number(sigma, { maximumFractionDigits: 2 })}
          min={0.5}
          max={2}
          step={0.05}
          value={sigma}
          onChange={setSigma}
        />
        <DemoRange
          label={t.markdown("interval")}
          display={`$\\pm${format.number(z, { maximumFractionDigits: 1 })}\\sigma$`}
          min={0.5}
          max={3}
          step={0.1}
          value={z}
          onChange={setZ}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setMu(0);
            setSigma(1);
            setZ(1);
          }}
        >
          <IcuMarkdownText value={t.markdown("reset")} />
        </Button>
      </div>
      <p className="demo-conclusion" aria-live="polite">
        <IcuMarkdownText
          value={t.markdown("conclusion", { value: formattedP })}
        />
      </p>
    </section>
  );
}
