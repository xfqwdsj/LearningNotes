"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, useDemoContent } from "./demo-frame";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
function compress(parts: number[]) {
  let bestStart = -1,
    bestLength = 0;
  for (let i = 0; i < parts.length;) {
    if (parts[i] !== 0) {
      i++;
      continue;
    }
    let j = i;
    while (j < parts.length && parts[j] === 0) j++;
    if (j - i > bestLength) {
      bestStart = i;
      bestLength = j - i;
    }
    i = j;
  }
  const hex = parts.map((n) => n.toString(16));
  if (bestLength < 2) return hex.join(":");
  const before = hex.slice(0, bestStart).join(":"),
    after = hex.slice(bestStart + bestLength).join(":");
  return `${before}::${after}`;
}
export default function Ipv6CompressionDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [parts, setParts] = useState([0x2001, 0xdb8, 0, 0, 0, 0, 0, 1]);
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <div
          role="group"
          aria-label={t("groups")}
          className="grid grid-cols-4 gap-2"
        >
          {parts.map((value, i) => (
            <Button
              key={i}
              type="button"
              size="sm"
              className="w-full min-w-0 px-0"
              variant={value === 0 ? "outline" : "default"}
              aria-label={t("group", { index: i + 1 })}
              aria-pressed={value !== 0}
              onClick={() =>
                setParts(
                  parts.map((v, j) => (j === i ? (v === 0 ? i + 1 : 0) : v)),
                )
              }
            >
              {value.toString(16).padStart(4, "0")}
            </Button>
          ))}
        </div>
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", { value: compress(parts) })}
        />
      }
    >
      <div className="px-6 py-4 text-sm">
        <code className="break-all">
          {parts.map((v) => v.toString(16).padStart(4, "0")).join(":")}
        </code>
      </div>
    </DemoFrame>
  );
}
