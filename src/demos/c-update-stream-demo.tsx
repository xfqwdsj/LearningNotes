"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, useDemoContent } from "./demo-frame";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
type Direction = "none" | "read" | "write";
export default function CUpdateStreamDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [last, setLast] = useState<Direction>("none"),
    [message, setMessage] = useState("initial");
  function act(next: Direction) {
    if (last !== "none" && next !== last) {
      setMessage(last === "read" ? "readToWrite" : "writeToRead");
      return;
    }
    setLast(next);
    setMessage(next);
  }
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => act("read")}
          >
            <IcuMarkdownText value={t.markdown("readAction")} />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => act("write")}
          >
            <IcuMarkdownText value={t.markdown("writeAction")} />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              setLast("none");
              setMessage("positioned");
            }}
          >
            <IcuMarkdownText value={t.markdown("seek")} />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              setLast("none");
              setMessage("initial");
            }}
          >
            <IcuMarkdownText value={t.markdown("reset")} />
          </Button>
        </div>
      }
      conclusion={<IcuMarkdownText value={t.markdown(message)} />}
    >
      <div className="px-6 py-4 text-sm">
        <code>{'fopen("data.txt", "r+")'}</code>
      </div>
    </DemoFrame>
  );
}
