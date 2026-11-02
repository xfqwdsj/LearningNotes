"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function RadixPlaceDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [value, setValue] = useState(53),
    [base, setBase] = useState(2);
  const digits = value.toString(base).toUpperCase().split("");
  const cells = [
    ...Array<string | null>(8 - digits.length).fill(null),
    ...digits,
  ];
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label={t.markdown("value")}
            value={value}
            display={String(value)}
            min={0}
            max={255}
            onChange={setValue}
          />
          <div
            role="group"
            aria-label={t("base")}
            className="grid grid-cols-3 gap-2"
          >
            {[2, 8, 16].map((b) => (
              <Button
                key={b}
                type="button"
                size="sm"
                variant={b === base ? "default" : "outline"}
                aria-pressed={b === base}
                className="w-full"
                onClick={() => setBase(b)}
              >
                <IcuMarkdownText
                  value={t.markdown("baseChoice", { base: b })}
                />
              </Button>
            ))}
          </div>
        </>
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", { value, base, digits: digits.join("") })}
        />
      }
    >
      <div
        className="grid grid-cols-4 gap-2 px-6 py-4"
        role="img"
        aria-label={t("diagram", { base, digits: digits.join("") })}
      >
        {cells.map((digit, i) => (
          <div
            key={i}
            aria-hidden="true"
            className={`demo-sequence-cell ${digit === null ? "invisible" : ""}`}
          >
            <span>
              <Tex source={`${base}^{${7 - i}}`} />
            </span>
            <strong>{digit ?? "0"}</strong>
          </div>
        ))}
      </div>
    </DemoFrame>
  );
}
