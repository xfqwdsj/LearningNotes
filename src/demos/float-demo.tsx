"use client";
import { createDemoTranslator, DemoRange } from "./demo-frame";
import { useId, useMemo, useState } from "react";
import { createContentFormatter } from "@/i18n/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";

function decode(value: number) {
  const array = new Float32Array(1);
  array[0] = value;
  const bits = new Uint32Array(array.buffer)[0]!;
  return {
    stored: array[0]!,
    sign: (bits >>> 31) & 1,
    exponent: (bits >>> 23) & 0xff,
    mantissa: bits & 0x7fffff,
    bits: Array.from({ length: 32 }, (_, index) =>
      String((bits >>> (31 - index)) & 1),
    ),
  };
}

export default function FloatDemo({
  title,
  locale,
  messages,
}: DemoComponentProps) {
  const t = useMemo(
    () => createDemoTranslator(locale, messages),
    [locale, messages],
  );
  const format = useMemo(() => createContentFormatter(locale), [locale]);
  const [text, setText] = useState("0.1");
  const inputId = useId();
  const parsed = Number(text);
  const valid = Number.isFinite(parsed);
  const decoded = decode(valid ? parsed : 0);
  const exact = valid && decoded.stored === parsed;
  const formattedStored = format.number(decoded.stored, {
    maximumFractionDigits: 12,
  });
  const formattedDifference = format.number(
    valid ? Math.abs(decoded.stored - parsed) : 0,
    { maximumFractionDigits: 12 },
  );
  const groups = [1, 8, 23] as const;
  let offset = 0;
  const fields = groups.map((length) => {
    const slice = decoded.bits.slice(offset, offset + length);
    offset += length;
    return slice;
  });
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
          <code>float32</code>
        </span>
      </div>
      <p className="demo-intro">
        <IcuMarkdownText value={t.raw("intro") as string} />
      </p>
      <div
        className="demo-bitfield"
        role="img"
        aria-label={t("graphLabel", { value: text, stored: formattedStored })}
      >
        <div className="demo-bitfield-fields">
          {fields.map((bits, index) => (
            <div
              key={index}
              className={`demo-bitfield-field demo-bitfield-${["sign", "exponent", "mantissa"][index]}`}
            >
              <span>
                <code>{["S", "E", "F"][index]}</code>
              </span>
              <div className="demo-bitfield-bits">
                {bits.map((bit, bitIndex) => (
                  <span key={bitIndex} className="demo-bit">
                    {bit}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="demo-bitfield-legend">
          <span>
            <IcuMarkdownText
              value={t.markdown("sign", { value: decoded.sign })}
            />
          </span>
          <span>
            <IcuMarkdownText
              value={t.markdown("exponent", { value: decoded.exponent })}
            />
          </span>
          <span>
            <IcuMarkdownText
              value={t.markdown("mantissa", { value: decoded.mantissa })}
            />
          </span>
        </div>
      </div>
      <div className="demo-controls">
        <label htmlFor={inputId}>
          <IcuMarkdownText value={t.markdown("valueLabel")} />
        </label>
        <Input
          id={inputId}
          inputMode="decimal"
          value={text}
          onChange={(event) => setText(event.target.value)}
          aria-invalid={!valid}
        />
        <DemoRange
          label={t.markdown("sliderLabel")}
          display={format.number(parsed, { maximumFractionDigits: 2 })}
          min={0}
          max={1}
          step={0.01}
          value={valid && parsed >= 0 && parsed <= 1 ? parsed : 0.1}
          onChange={(value) => setText(String(value))}
        />
        <Button variant="outline" size="sm" onClick={() => setText("0.1")}>
          <IcuMarkdownText value={t.markdown("reset")} />
        </Button>
      </div>
      <p className="demo-conclusion" aria-live="polite">
        <IcuMarkdownText
          value={t.markdown(exact ? "exact" : "inexact", {
            stored: formattedStored,
            difference: formattedDifference,
          })}
        />
      </p>
    </section>
  );
}
