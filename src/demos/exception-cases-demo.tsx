"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, useDemoContent } from "./demo-frame";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function ExceptionCasesDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [event, setEvent] = useState<"page" | "divide">("page");
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
          {(["page", "divide"] as const).map((v) => (
            <Button
              key={v}
              type="button"
              size="sm"
              variant={event === v ? "default" : "outline"}
              aria-pressed={event === v}
              className="w-full"
              onClick={() => setEvent(v)}
            >
              <IcuMarkdownText value={t.markdown(v)} />
            </Button>
          ))}
        </div>
      }
      conclusion={<IcuMarkdownText value={t.markdown(`${event}Result`)} />}
    >
      <div className="grid grid-cols-2 gap-2 px-6 py-4">
        <div className="bg-muted rounded-md border px-2 py-3 text-center text-xs">
          <IcuMarkdownText value={t.markdown("instruction")} />
        </div>
        <div className="bg-muted rounded-md border px-2 py-3 text-center text-xs">
          <IcuMarkdownText value={t.markdown(event)} />
        </div>
      </div>
    </DemoFrame>
  );
}
