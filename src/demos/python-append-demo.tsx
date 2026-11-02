"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, useDemoContent } from "./demo-frame";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function PythonAppendDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [mode, setMode] = useState<"append" | "extend">("append");
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <div
          role="group"
          aria-label={t("choose")}
          className="grid grid-cols-2 gap-2"
        >
          {(["append", "extend"] as const).map((v) => (
            <Button
              key={v}
              type="button"
              size="sm"
              variant={v === mode ? "default" : "outline"}
              className="w-full"
              aria-pressed={v === mode}
              onClick={() => setMode(v)}
            >
              <code>{v}</code>
            </Button>
          ))}
        </div>
      }
      conclusion={<IcuMarkdownText value={t.markdown(`${mode}Result`)} />}
    >
      <div className="px-6 py-4 text-sm">
        <code>{mode === "append" ? "[1, 2, [3, 4]]" : "[1, 2, 3, 4]"}</code>
      </div>
    </DemoFrame>
  );
}
