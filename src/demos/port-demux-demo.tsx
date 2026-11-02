"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, useDemoContent } from "./demo-frame";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function PortDemuxDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [port, setPort] = useState(53);
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <div
          role="group"
          aria-label={t("choose")}
          className="grid grid-cols-3 gap-2"
        >
          {[53, 80, 5000].map((v) => (
            <Button
              key={v}
              type="button"
              variant={port === v ? "default" : "outline"}
              size="sm"
              className="w-full"
              aria-pressed={port === v}
              onClick={() => setPort(v)}
            >
              {v}
            </Button>
          ))}
        </div>
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", {
            port,
            service: t.markdown(
              port === 53 ? "dns" : port === 80 ? "web" : "custom",
            ),
          })}
        />
      }
    >
      <div
        className="grid grid-cols-3 gap-2 px-6 py-4"
        role="img"
        aria-label={t("diagram", { port })}
      >
        {[53, 80, 5000].map((v) => (
          <div
            key={v}
            className={`rounded-md border py-3 text-center text-sm ${port === v ? "border-foreground bg-muted" : "text-muted-foreground"}`}
          >
            {v}
          </div>
        ))}
      </div>
    </DemoFrame>
  );
}
