"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, useDemoContent } from "./demo-frame";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function PathResolutionDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [cwd, setCwd] = useState<"notes" | "home">("notes"),
    [kind, setKind] = useState<"relative" | "absolute">("relative");
  const directory = cwd === "notes" ? "/home/ana/notes" : "/home/ana",
    path = kind === "relative" ? "./draft.md" : "/home/ana/notes/draft.md",
    resolved = kind === "relative" ? `${directory}/draft.md` : path;
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <div
            role="group"
            aria-label={t("cwd")}
            className="grid grid-cols-2 gap-2"
          >
            {(["notes", "home"] as const).map((v) => (
              <Button
                key={v}
                type="button"
                size="sm"
                variant={cwd === v ? "default" : "outline"}
                className="w-full"
                aria-pressed={cwd === v}
                onClick={() => setCwd(v)}
              >
                <IcuMarkdownText value={t.markdown(v)} />
              </Button>
            ))}
          </div>
          <div
            role="group"
            aria-label={t("kind")}
            className="grid grid-cols-2 gap-2"
          >
            {(["relative", "absolute"] as const).map((v) => (
              <Button
                key={v}
                type="button"
                size="sm"
                variant={kind === v ? "default" : "outline"}
                className="w-full"
                aria-pressed={kind === v}
                onClick={() => setKind(v)}
              >
                <IcuMarkdownText value={t.markdown(v)} />
              </Button>
            ))}
          </div>
        </>
      }
      conclusion={
        <IcuMarkdownText value={t.markdown("result", { resolved })} />
      }
    >
      <div className="grid gap-2 px-6 py-4 text-sm">
        <div>
          <IcuMarkdownText value={t.markdown("cwd")} />:{" "}
          <code className="break-all">{directory}</code>
        </div>
        <div>
          <IcuMarkdownText value={t.markdown("path")} />:{" "}
          <code className="break-all">{path}</code>
        </div>
      </div>
    </DemoFrame>
  );
}
