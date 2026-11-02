"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function CPrintfFieldDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [width, setWidth] = useState(5),
    [mode, setMode] = useState<"spaces" | "zeros" | "left">("spaces");
  const raw = "12",
    text =
      mode === "left"
        ? raw.padEnd(width, " ")
        : raw.padStart(width, mode === "zeros" ? "0" : " ");
  const flag = mode === "zeros" ? "0" : mode === "left" ? "-" : "";
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label={t.markdown("width")}
            value={width}
            display={String(width)}
            min={1}
            max={8}
            onChange={setWidth}
          />
          <div
            role="group"
            aria-label={t("choose")}
            className="grid grid-cols-3 gap-2"
          >
            {(["spaces", "zeros", "left"] as const).map((v) => (
              <Button
                key={v}
                type="button"
                size="sm"
                variant={mode === v ? "default" : "outline"}
                className="w-full min-w-0 px-0"
                aria-pressed={mode === v}
                onClick={() => setMode(v)}
              >
                <IcuMarkdownText value={t.markdown(v)} />
              </Button>
            ))}
          </div>
        </>
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", { length: text.length })}
        />
      }
    >
      <div className="grid gap-2 px-6 py-4 text-sm">
        <code>{`printf("%${flag}${width}d", 12)`}</code>
        <code className="bg-muted rounded-md border p-3">
          [{text.replaceAll(" ", "·")}]
        </code>
      </div>
    </DemoFrame>
  );
}
