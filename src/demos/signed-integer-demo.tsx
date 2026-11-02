"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, useDemoContent } from "./demo-frame";
import { Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import { signedByte } from "./models";
import type { DemoComponentProps } from "./types";
export default function SignedIntegerDemo(props: DemoComponentProps) {
  const { t, ready } = useDemoContent(props);
  const [value, setValue] = useState(13);
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <Button variant="outline" size="sm" onClick={() => setValue(13)}>
          <IcuMarkdownText value={t.markdown("reset")} />
        </Button>
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", {
            unsigned: value,
            signed: signedByte(value),
          })}
        />
      }
    >
      <div className="demo-bit-buttons" role="group" aria-label={t("bits")}>
        {Array.from({ length: 8 }, (_, index) => 7 - index).map((bit) => (
          <Button
            key={bit}
            variant={value & (1 << bit) ? "default" : "outline"}
            className="demo-bit-button"
            aria-label={t("bit", { position: bit })}
            disabled={!ready}
            aria-pressed={Boolean(value & (1 << bit))}
            onClick={() => setValue((current) => current ^ (1 << bit))}
          >
            <Tex source={`2^{${bit}}`} />
            <strong>{(value >> bit) & 1}</strong>
          </Button>
        ))}
      </div>
    </DemoFrame>
  );
}
