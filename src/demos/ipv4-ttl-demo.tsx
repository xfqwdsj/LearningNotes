"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function Ipv4TtlDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [initial, setInitial] = useState(4),
    [hops, setHops] = useState(0);
  const ttl = initial - hops;
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label={t.markdown("initial")}
            value={initial}
            display={String(initial)}
            min={1}
            max={8}
            onChange={(v) => {
              setInitial(v);
              setHops(0);
            }}
          />
          <div className="demo-action-row">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={ttl === 0}
              onClick={() => setHops(hops + 1)}
            >
              <IcuMarkdownText value={t.markdown("forward")} />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setHops(0)}
            >
              <IcuMarkdownText value={t.markdown("reset")} />
            </Button>
          </div>
        </>
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown(ttl === 0 ? "dropped" : "active", { ttl, hops })}
        />
      }
    >
      <div
        className="grid grid-cols-4 gap-2 px-6 py-4"
        role="img"
        aria-label={t("diagram", { ttl })}
      >
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className={`rounded-md border py-3 text-center text-xs ${i < hops ? "border-foreground bg-muted" : "text-muted-foreground opacity-40"}`}
          >
            {i + 1}
          </div>
        ))}
      </div>
    </DemoFrame>
  );
}
