"use client";
import { createDemoTranslator, DemoRange } from "./demo-frame";
import { createContentFormatter } from "@/i18n/format";
import type { DemoComponentProps } from "./types";
import { useId, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { SvgTex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import { Button } from "@/components/ui/button";

export default function ContinuityDemo({
  title,
  locale,
  messages,
}: DemoComponentProps) {
  const t = useMemo(
    () => createDemoTranslator(locale, messages),
    [locale, messages],
  );
  const format = useMemo(() => createContentFormatter(locale), [locale]);
  const gridId = useId();

  const [value, setValue] = useState(0);
  const reduced = useReducedMotion();
  const formattedValue = format.number(value, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  const continuous = Math.abs(value) < 0.05;
  const curve = Array.from({ length: 121 }, (_, i) => {
    const x = (i - 60) / 20;
    return `${i ? "L" : "M"}${230 + x * 60},${170 - Math.sin(x) * 48}`;
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
        <span className={`demo-status ${continuous ? "is-continuous" : ""}`}>
          {continuous ? t("continuous") : t("discontinuous")}
        </span>
      </div>
      <p className="demo-intro">
        <IcuMarkdownText value={t.raw("intro") as string} />
      </p>
      <svg
        viewBox="0 0 460 300"
        role="img"
        aria-label={t("graphLabel", {
          value: formattedValue,
          status: continuous ? t("continuous") : t("discontinuous"),
        })}
      >
        <defs>
          <pattern
            id={gridId}
            width="30"
            height="30"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M30 0 H0 V30"
              fill="none"
              stroke="currentColor"
              strokeOpacity=".05"
            />
          </pattern>
        </defs>
        <rect width="460" height="300" fill={`url(#${gridId})`} />
        <path
          d="M30 170 H430 M230 25 V275"
          stroke="currentColor"
          strokeOpacity=".25"
        />
        <SvgTex x={430} y={178} width={24} source="x" />
        <SvgTex x={238} y={20} width={24} source="y" />
        <SvgTex x={206} y={144} width={24} source="0" />
        <path d={curve} fill="none" stroke="currentColor" strokeWidth="2" />
        <motion.path
          d={`M230 170 L230 ${170 - value * 48}`}
          fill="none"
          stroke="currentColor"
          strokeOpacity=".3"
          strokeDasharray="4 4"
        />
        <circle
          cx="230"
          cy="170"
          r="5"
          fill="var(--background)"
          stroke="currentColor"
          strokeWidth="2"
        />
        <motion.circle
          cx="230"
          animate={{ cy: 170 - value * 48 }}
          transition={{ duration: reduced ? 0 : 0.15 }}
          r="5"
          fill="currentColor"
        />
        <SvgTex
          x={245}
          y={Math.min(260, Math.max(45, 165 - value * 48)) - 17}
          width={170}
          height={26}
          source={`f(0)=${formattedValue}`}
        />
      </svg>
      <div className="demo-controls">
        <DemoRange
          label={t.markdown("valueLabel")}
          display={formattedValue}
          min={-2}
          max={2}
          step={0.1}
          value={value}
          onChange={setValue}
        />
        <Button variant="outline" size="sm" onClick={() => setValue(0)}>
          <IcuMarkdownText value={t.raw("reset") as string} />
        </Button>
      </div>
      <p className="demo-conclusion" aria-live="polite">
        <IcuMarkdownText
          value={
            continuous
              ? (t.raw("continuousConclusion") as string)
              : (t.raw("discontinuousConclusion") as string)
          }
        />
      </p>
    </section>
  );
}
