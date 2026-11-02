"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function BinaryAdditionDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [a, setA] = useState(9),
    [b, setB] = useState(7);
  const sum = a + b,
    bits = (n: number) => n.toString(2).padStart(4, "0");
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label={t.markdown("first")}
            value={a}
            display={String(a)}
            min={0}
            max={15}
            onChange={setA}
          />
          <DemoRange
            label={t.markdown("second")}
            value={b}
            display={String(b)}
            min={0}
            max={15}
            onChange={setB}
          />
        </>
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown(sum > 15 ? "overflow" : "fits", {
            sum,
            result: sum % 16,
            carry: sum > 15 ? 1 : 0,
          })}
        />
      }
    >
      <div className="px-6 py-4">
        <div className="demo-inline-code font-mono text-sm">
          {bits(a)} + {bits(b)} = {sum.toString(2).padStart(5, "0")}
        </div>
        <div className="text-muted-foreground mt-2 text-xs">
          <IcuMarkdownText
            value={t.markdown("stored", { bits: bits(sum % 16) })}
          />
        </div>
      </div>
    </DemoFrame>
  );
}
