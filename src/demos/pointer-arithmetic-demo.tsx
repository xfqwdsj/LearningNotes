"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
const values = [10, 20, 30, 40];
const address = (index: number) => `0x${(4096 + index * 4).toString(16)}`;
export default function PointerArithmeticDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [index, setIndex] = useState(0);
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <DemoRange
          label={t.markdown("offset")}
          value={index}
          display={format.number(index)}
          min={0}
          max={4}
          onChange={setIndex}
        />
      }
      conclusion={
        index === values.length ? (
          <IcuMarkdownText
            value={t.markdown("onePast", { address: address(index) })}
          />
        ) : (
          <IcuMarkdownText
            value={t.markdown("result", {
              index,
              address: address(index),
              value: values[index]!,
            })}
          />
        )
      }
    >
      <div
        className="demo-memory"
        role="img"
        aria-label={t("diagram", { index, address: address(index) })}
      >
        {[...values, undefined].map((value, i) => (
          <div
            className="demo-memory-cell"
            key={i}
            data-selected={i === index}
            data-boundary={i === values.length}
          >
            <code>{address(i)}</code>
            <strong>{value ?? t("boundary")}</strong>
            <code>{i < values.length ? `a[${i}]` : "a + 4"}</code>
          </div>
        ))}
      </div>
    </DemoFrame>
  );
}
