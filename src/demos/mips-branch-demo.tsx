"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";

export default function MipsBranchDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [left, setLeft] = useState(5);
  const [inclusive, setInclusive] = useState(false);
  const result = inclusive ? left <= 5 : left < 5;
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label={t.markdown("left")}
            value={left}
            display={String(left)}
            min={0}
            max={10}
            onChange={setLeft}
          />
          <div
            role="group"
            aria-label={t("comparison")}
            className="grid grid-cols-2 gap-2"
          >
            {[false, true].map((v) => (
              <Button
                key={String(v)}
                type="button"
                size="sm"
                className="w-full"
                variant={inclusive === v ? "default" : "outline"}
                aria-pressed={inclusive === v}
                onClick={() => setInclusive(v)}
              >
                {v ? "sle" : "slt"}
              </Button>
            ))}
          </div>
        </>
      }
      conclusion={
        <IcuMarkdownText value={t.markdown(result ? "continue" : "jump")} />
      }
    >
      <div className="grid gap-2 px-6 py-4 text-sm">
        <code>{inclusive ? "sle" : "slt"} $t0, $s1, $s2</code>
        <p>
          $s1 = {left}，$s2 = 5，$t0 = {result ? 1 : 0}
        </p>
        <code>beqz $t0, Loop</code>
      </div>
    </DemoFrame>
  );
}
