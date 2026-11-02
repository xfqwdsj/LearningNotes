"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, useDemoContent } from "./demo-frame";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function CScanfSpaceDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [skip, setSkip] = useState(false);
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
          {[false, true].map((v) => (
            <Button
              key={String(v)}
              type="button"
              size="sm"
              variant={skip === v ? "default" : "outline"}
              className="w-full"
              aria-pressed={skip === v}
              onClick={() => setSkip(v)}
            >
              <code>{v ? " %c" : "%c"}</code>
            </Button>
          ))}
        </div>
      }
      conclusion={
        <IcuMarkdownText value={t.markdown(skip ? "skipped" : "direct")} />
      }
    >
      <div className="grid gap-2 px-6 py-4 text-sm">
        <div>
          <IcuMarkdownText value={t.markdown("input")} />: <code>\nA</code>
        </div>
        <div>
          <IcuMarkdownText value={t.markdown("character")} />:{" "}
          <code>{skip ? "A" : "\\n"}</code>
        </div>
      </div>
    </DemoFrame>
  );
}
