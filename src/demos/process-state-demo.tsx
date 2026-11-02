"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, useDemoContent } from "./demo-frame";
import { SvgTex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
type State = "new" | "ready" | "running" | "blocked" | "terminated";
const transitions: Record<State, { event: string; next: State }[]> = {
  new: [{ event: "admit", next: "ready" }],
  ready: [{ event: "dispatch", next: "running" }],
  running: [
    { event: "preempt", next: "ready" },
    { event: "wait", next: "blocked" },
    { event: "exit", next: "terminated" },
  ],
  blocked: [{ event: "complete", next: "ready" }],
  terminated: [],
};
const nodes: Array<{ state: State; x: number; y: number; labelX: number }> = [
  { state: "new", x: 38, y: 126, labelX: 52 },
  { state: "ready", x: 150, y: 126, labelX: 164 },
  { state: "running", x: 270, y: 126, labelX: 284 },
  { state: "blocked", x: 390, y: 126, labelX: 404 },
  { state: "terminated", x: 270, y: 40, labelX: 284 },
];
export default function ProcessStateDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [state, setState] = useState<State>("new");
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <div className="flex flex-wrap gap-2">
          {transitions[state].map(({ event, next }) => (
            <Button
              key={event}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setState(next)}
            >
              <IcuMarkdownText value={t.markdown(event)} />
            </Button>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setState("new")}
          >
            <IcuMarkdownText value={t.markdown("reset")} />
          </Button>
        </div>
      }
      conclusion={<IcuMarkdownText value={t.markdown(`${state}Meaning`)} />}
    >
      <svg
        viewBox="0 0 500 280"
        role="img"
        aria-label={`${t("states")}：${t(state)}`}
        className="px-4 py-3"
      >
        <defs>
          <marker
            id="process-arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M0 0L10 5L0 10Z" fill="currentColor" />
          </marker>
        </defs>
        <path
          d="M116 148H150M228 148H270M346 148H390M308 126V76"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          markerEnd="url(#process-arrow)"
        />
        <path
          d="M270 126C250 88 190 88 150 126"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          markerEnd="url(#process-arrow)"
        />
        <path
          d="M390 170C330 252 210 252 150 170"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          markerEnd="url(#process-arrow)"
        />
        {nodes.map((node) => {
          const active = state === node.state;
          return (
            <g key={node.state}>
              <rect
                x={node.x}
                y={node.y}
                width="78"
                height="44"
                rx="10"
                fill={active ? "currentColor" : "transparent"}
                fillOpacity={active ? ".14" : "0"}
                stroke="currentColor"
                strokeOpacity={active ? "1" : ".42"}
                strokeWidth={active ? "2.5" : "1.5"}
              />
              <SvgTex
                x={node.labelX}
                y={node.y + 12}
                width={50}
                source={`\\text{${t(node.state)}}`}
              />
            </g>
          );
        })}
        <SvgTex
          x={122}
          y={134}
          width={78}
          source={String.raw`\text{${t("admitShort")}}`}
        />
        <SvgTex
          x={236}
          y={134}
          width={58}
          source={String.raw`\text{${t("dispatchShort")}}`}
        />
        <SvgTex
          x={358}
          y={134}
          width={66}
          source={String.raw`\text{${t("waitShort")}}`}
        />
        <SvgTex
          x={178}
          y={84}
          width={86}
          source={String.raw`\text{${t("preemptShort")}}`}
        />
        <SvgTex
          x={226}
          y={229}
          width={88}
          source={String.raw`\text{${t("completeShort")}}`}
        />
        <SvgTex
          x={316}
          y={92}
          width={42}
          source={String.raw`\text{${t("exitShort")}}`}
        />
      </svg>
    </DemoFrame>
  );
}
