"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, useDemoContent } from "./demo-frame";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";

export default function TestErrorsDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [truth, setTruth] = useState(true);
  const [reject, setReject] = useState(false);
  const outcome = truth
    ? reject
      ? "type1"
      : "correct0"
    : reject
      ? "power"
      : "type2";
  const cells = [
    { truth: true, reject: false, key: "correct0" },
    { truth: true, reject: true, key: "type1" },
    { truth: false, reject: false, key: "type2" },
    { truth: false, reject: true, key: "power" },
  ];

  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <div
            role="group"
            aria-label={t("truth")}
            className="grid grid-cols-2 gap-2"
          >
            {[true, false].map((value) => (
              <Button
                key={String(value)}
                type="button"
                size="sm"
                className="w-full"
                variant={truth === value ? "default" : "outline"}
                aria-pressed={truth === value}
                onClick={() => setTruth(value)}
              >
                <IcuMarkdownText value={t.markdown(value ? "true" : "false")} />
              </Button>
            ))}
          </div>
          <div
            role="group"
            aria-label={t("decision")}
            className="grid grid-cols-2 gap-2"
          >
            {[false, true].map((value) => (
              <Button
                key={String(value)}
                type="button"
                size="sm"
                className="w-full"
                variant={reject === value ? "default" : "outline"}
                aria-pressed={reject === value}
                onClick={() => setReject(value)}
              >
                <IcuMarkdownText
                  value={t.markdown(value ? "reject" : "keep")}
                />
              </Button>
            ))}
          </div>
        </>
      }
      conclusion={<IcuMarkdownText value={t.markdown(outcome)} />}
    >
      <svg viewBox="0 0 500 270" role="img" aria-label={t("label")}>
        <foreignObject x="54" y="30" width="94" height="40">
          <div
            {...({ xmlns: "http://www.w3.org/1999/xhtml" } as Record<
              string,
              string
            >)}
          >
            <IcuMarkdownText value={t.markdown("decision")} />
          </div>
        </foreignObject>
        <foreignObject x="52" y="86" width="98" height="40">
          <div
            {...({ xmlns: "http://www.w3.org/1999/xhtml" } as Record<
              string,
              string
            >)}
          >
            <IcuMarkdownText value={t.markdown("keep")} />
          </div>
        </foreignObject>
        <foreignObject x="52" y="176" width="98" height="40">
          <div
            {...({ xmlns: "http://www.w3.org/1999/xhtml" } as Record<
              string,
              string
            >)}
          >
            <IcuMarkdownText value={t.markdown("reject")} />
          </div>
        </foreignObject>
        <foreignObject x="158" y="18" width="130" height="40">
          <div
            {...({ xmlns: "http://www.w3.org/1999/xhtml" } as Record<
              string,
              string
            >)}
          >
            <IcuMarkdownText value={t.markdown("true")} />
          </div>
        </foreignObject>
        <foreignObject x="310" y="18" width="130" height="40">
          <div
            {...({ xmlns: "http://www.w3.org/1999/xhtml" } as Record<
              string,
              string
            >)}
          >
            <IcuMarkdownText value={t.markdown("false")} />
          </div>
        </foreignObject>
        {cells.map((cell) => {
          const selected = cell.truth === truth && cell.reject === reject;
          const x = cell.truth ? 156 : 308;
          const y = cell.reject ? 164 : 58;
          return (
            <g key={cell.key}>
              <rect
                x={x}
                y={y}
                width="138"
                height="92"
                rx="8"
                fill="currentColor"
                fillOpacity={selected ? 0.2 : 0.04}
                stroke="currentColor"
                strokeWidth={selected ? 2.5 : 1}
                strokeOpacity={selected ? 1 : 0.25}
              />
              <foreignObject x={x + 10} y={y + 20} width="118" height="54">
                <div
                  {...({ xmlns: "http://www.w3.org/1999/xhtml" } as Record<
                    string,
                    string
                  >)}
                >
                  <IcuMarkdownText value={t.markdown(cell.key)} />
                </div>
              </foreignObject>
            </g>
          );
        })}
      </svg>
    </DemoFrame>
  );
}
