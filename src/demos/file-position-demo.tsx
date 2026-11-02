"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, useDemoContent } from "./demo-frame";
import { Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";

export default function FilePositionDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [position, setPosition] = useState(0);
  const [lastRead, setLastRead] = useState("");
  const bytes = ["A", "B", "C", "D"];
  function read() {
    setLastRead(bytes.slice(position, position + 2).join(""));
    setPosition(Math.min(position + 2, bytes.length));
  }
  function rewind() {
    setPosition(0);
    setLastRead("");
  }
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <div className="grid grid-cols-2 gap-2">
          <Button type="button" size="sm" onClick={read}>
            <IcuMarkdownText value={t.markdown("read")} />
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={rewind}>
            <IcuMarkdownText value={t.markdown("rewind")} />
          </Button>
        </div>
      }
      conclusion={
        <IcuMarkdownText value={t.markdown("position", { position })} />
      }
    >
      <div className="grid gap-2 px-6 py-4 text-sm">
        <div className="flex gap-2">
          {bytes.map((byte, index) => (
            <span
              key={index}
              className={`rounded border px-3 py-2 ${index === position ? "border-primary bg-primary/10" : ""}`}
            >
              <code>{byte}</code>
            </span>
          ))}
        </div>
        <p>
          <IcuMarkdownText value={t.markdown("last")} />:{" "}
          {lastRead ? (
            <code>{lastRead}</code>
          ) : (
            <Tex source={String.raw`\varnothing`} />
          )}
        </p>
      </div>
    </DemoFrame>
  );
}
