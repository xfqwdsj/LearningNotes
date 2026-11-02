"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";

type Mode = "alias" | "copy" | "immutable";

export default function PythonMutabilityDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [mode, setMode] = useState<Mode>("alias");
  const shared = mode === "alias";
  const aValue =
    mode === "immutable"
      ? String.raw`\texttt{"ab"}`
      : String.raw`\texttt{[1,2]}`;
  const bValue =
    mode === "alias"
      ? String.raw`\texttt{[1,2,3]}`
      : mode === "copy"
        ? String.raw`\texttt{[1,2,3]}`
        : String.raw`\texttt{"abc"}`;

  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <div
          role="group"
          aria-label={t("choose")}
          className="grid grid-cols-1 gap-2 sm:grid-cols-3"
        >
          {(["alias", "copy", "immutable"] as const).map((value) => (
            <Button
              key={value}
              type="button"
              size="sm"
              variant={mode === value ? "default" : "outline"}
              aria-pressed={mode === value}
              onClick={() => setMode(value)}
            >
              <IcuMarkdownText value={t.markdown(value)} />
            </Button>
          ))}
        </div>
      }
      conclusion={<IcuMarkdownText value={t.markdown(`${mode}Result`)} />}
    >
      <svg
        viewBox="0 0 500 300"
        role="img"
        aria-label={t("graphLabel", { mode: t(mode) })}
      >
        <defs>
          <marker
            id="mutability-arrow"
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
        <rect
          x="54"
          y="70"
          width="82"
          height="48"
          rx="9"
          fill="currentColor"
          fillOpacity=".06"
          stroke="currentColor"
          strokeOpacity=".5"
        />
        <SvgTex x={84} y={83} width={24} source={String.raw`\texttt{a}`} />
        <rect
          x="54"
          y="182"
          width="82"
          height="48"
          rx="9"
          fill="currentColor"
          fillOpacity=".06"
          stroke="currentColor"
          strokeOpacity=".5"
        />
        <SvgTex x={84} y={195} width={24} source={String.raw`\texttt{b}`} />
        {shared ? (
          <>
            <path
              d="M142 94C190 94 196 133 242 139"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              markerEnd="url(#mutability-arrow)"
            />
            <path
              d="M142 206C190 206 196 167 242 161"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              markerEnd="url(#mutability-arrow)"
            />
            <rect
              x="250"
              y="112"
              width="184"
              height="76"
              rx="12"
              fill="currentColor"
              fillOpacity=".18"
              stroke="currentColor"
              strokeWidth="2"
            />
            <SvgTex
              x={284}
              y={127}
              width={116}
              source={String.raw`\texttt{list: [1,2,3]}`}
            />
            <SvgTex
              x={292}
              y={157}
              width={102}
              source={String.raw`\text{${t("sharedObject")}}`}
            />
          </>
        ) : (
          <>
            <path
              d="M142 94H242"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              markerEnd="url(#mutability-arrow)"
            />
            <path
              d="M142 206H242"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              markerEnd="url(#mutability-arrow)"
            />
            <rect
              x="250"
              y="70"
              width="194"
              height="48"
              rx="10"
              fill="currentColor"
              fillOpacity=".1"
              stroke="currentColor"
              strokeOpacity=".6"
            />
            <SvgTex x={286} y={83} width={122} source={aValue} />
            <rect
              x="250"
              y="182"
              width="194"
              height="48"
              rx="10"
              fill="currentColor"
              fillOpacity=".18"
              stroke="currentColor"
              strokeWidth="2"
            />
            <SvgTex x={286} y={195} width={122} source={bValue} />
          </>
        )}
      </svg>
      <div className="px-6 pb-4 text-sm">
        <Tex
          source={
            mode === "immutable"
              ? String.raw`\texttt{t = t + "c"}`
              : String.raw`\texttt{b.append(3)}`
          }
        />
      </div>
    </DemoFrame>
  );
}
