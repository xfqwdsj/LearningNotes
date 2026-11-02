"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, useDemoContent } from "./demo-frame";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
type Mode = "user" | "kernel";
type Action = "add" | "cli" | "kernelMemory";
export default function PrivilegeDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [mode, setMode] = useState<Mode>("user"),
    [action, setAction] = useState<Action>("add");
  const blocked = mode === "user" && action !== "add";
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <div
            role="group"
            aria-label={t("mode")}
            className="grid grid-cols-2 gap-2"
          >
            {(["user", "kernel"] as const).map((v) => (
              <Button
                key={v}
                type="button"
                size="sm"
                variant={mode === v ? "default" : "outline"}
                className="w-full"
                aria-pressed={mode === v}
                onClick={() => setMode(v)}
              >
                <IcuMarkdownText value={t.markdown(v)} />
              </Button>
            ))}
          </div>
          <div role="group" aria-label={t("action")} className="grid gap-2">
            {(["add", "cli", "kernelMemory"] as const).map((v) => (
              <Button
                key={v}
                type="button"
                size="sm"
                variant={action === v ? "default" : "outline"}
                className="w-full"
                aria-pressed={action === v}
                onClick={() => setAction(v)}
              >
                <IcuMarkdownText value={t.markdown(v)} />
              </Button>
            ))}
          </div>
        </>
      }
      conclusion={
        <IcuMarkdownText value={t.markdown(blocked ? "blocked" : "allowed")} />
      }
    >
      <div className="px-6 py-4 text-sm">
        <IcuMarkdownText value={t.markdown("assumption")} />
      </div>
    </DemoFrame>
  );
}
