"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, useDemoContent } from "./demo-frame";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
type Mode = "r" | "w" | "a" | "x";
export default function PythonOpenModeDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [exists, setExists] = useState(true),
    [mode, setMode] = useState<Mode>("r");
  const result =
    mode === "r"
      ? exists
        ? "readExisting"
        : "missingError"
      : mode === "x"
        ? exists
          ? "existsError"
          : "createExclusive"
        : mode === "w"
          ? exists
            ? "truncate"
            : "createWrite"
          : exists
            ? "append"
            : "createAppend";
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <div
            role="group"
            aria-label={t("existence")}
            className="grid grid-cols-2 gap-2"
          >
            {[true, false].map((v) => (
              <Button
                key={String(v)}
                type="button"
                variant={exists === v ? "default" : "outline"}
                size="sm"
                className="w-full"
                aria-pressed={exists === v}
                onClick={() => setExists(v)}
              >
                <IcuMarkdownText value={t.markdown(v ? "exists" : "missing")} />
              </Button>
            ))}
          </div>
          <div
            role="group"
            aria-label={t("mode")}
            className="grid grid-cols-4 gap-2"
          >
            {(["r", "w", "a", "x"] as const).map((v) => (
              <Button
                key={v}
                type="button"
                variant={mode === v ? "default" : "outline"}
                size="sm"
                className="w-full"
                aria-pressed={mode === v}
                onClick={() => setMode(v)}
              >
                <code>{v}</code>
              </Button>
            ))}
          </div>
        </>
      }
      conclusion={<IcuMarkdownText value={t.markdown(result)} />}
    >
      <div className="px-6 py-4 text-sm">
        <code>{`open("data.txt", "${mode}")`}</code>
      </div>
    </DemoFrame>
  );
}
