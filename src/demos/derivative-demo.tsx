"use client";
import { createDemoTranslator, DemoRange } from "./demo-frame";
import { useMemo, useState } from "react";
import { createContentFormatter } from "@/i18n/format";
import { motion, useReducedMotion } from "motion/react";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import { Button } from "@/components/ui/button";
import type { DemoComponentProps } from "./types";
export default function DerivativeDemo({
  title,
  locale,
  messages,
}: DemoComponentProps) {
  const [distance, setDistance] = useState(1);
  const t = useMemo(
    () => createDemoTranslator(locale, messages),
    [locale, messages],
  );
  const format = useMemo(() => createContentFormatter(locale), [locale]);
  const reduced = useReducedMotion();
  const point = (x: number, y: number) => `${90 + x * 85},${255 - y * 42}`;
  const curve = Array.from({ length: 101 }, (_, index) => {
    const x = index / 40;
    return `${index ? "L" : "M"}${point(x, x * x)}`;
  }).join(" ");
  const x = 1 + distance;
  const slope = 2 + distance;
  return (
    <section
      className="interactive-demo not-prose"
      lang={locale}
      aria-label={t("label")}
    >
      <div className="demo-header">
        <h3>
          <IcuMarkdownText value={title} />
        </h3>
      </div>
      <p className="demo-intro">
        <IcuMarkdownText value={t.markdown("intro")} />
      </p>
      <svg
        viewBox="0 0 460 300"
        role="img"
        aria-label={t("graphLabel", {
          distance: format.number(distance),
          slope: format.number(slope),
        })}
      >
        <path
          d="M35 255H430M90 25V280"
          stroke="currentColor"
          strokeOpacity=".2"
        />
        <path d={curve} fill="none" stroke="currentColor" strokeWidth="2" />
        <path
          d={`M${point(0, -1)}L${point(2.6, 4.2)}`}
          stroke="currentColor"
          strokeDasharray="5 5"
          strokeOpacity=".4"
        />
        <motion.path
          d={`M${point(0, 1 - slope)}L${point(2.5, 1 + slope * 1.5)}`}
          fill="none"
          stroke="currentColor"
          strokeOpacity=".65"
        />
        <circle cx="175" cy="213" r="5" fill="currentColor" />
        <motion.circle
          animate={{ cx: 90 + x * 85, cy: 255 - x * x * 42 }}
          transition={{ duration: reduced ? 0 : 0.15 }}
          r="5"
          fill="var(--background)"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
      <div className="demo-controls">
        <DemoRange
          label={t.markdown("distance")}
          display={format.number(distance, { maximumFractionDigits: 2 })}
          min={0.02}
          max={1}
          step={0.02}
          value={distance}
          onChange={setDistance}
        />
        <Button size="sm" variant="outline" onClick={() => setDistance(1)}>
          <IcuMarkdownText value={t.markdown("reset")} />
        </Button>
      </div>
      <p className="demo-conclusion" aria-live="polite">
        <IcuMarkdownText
          value={t.markdown("slope", {
            slope: format.number(slope, { maximumFractionDigits: 2 }),
          })}
        />{" "}
        <IcuMarkdownText value={t.markdown("conclusion")} />
      </p>
    </section>
  );
}
