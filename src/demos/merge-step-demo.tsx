"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, useDemoContent } from "./demo-frame";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
const left = [1, 4, 7],
  right = [2, 3, 6];
export default function MergeStepDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [i, setI] = useState(0),
    [j, setJ] = useState(0),
    [result, setResult] = useState<number[]>([]),
    [wrong, setWrong] = useState(false);
  const nextLeft = left[i],
    nextRight = right[j],
    done = i === left.length && j === right.length;
  function choose(side: "left" | "right") {
    const value = side === "left" ? nextLeft : nextRight,
      other = side === "left" ? nextRight : nextLeft;
    if (value === undefined) return;
    if (other !== undefined && value > other) {
      setWrong(true);
      return;
    }
    setWrong(false);
    setResult([...result, value]);
    if (side === "left") setI(i + 1);
    else setJ(j + 1);
  }
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <div
          className="grid grid-cols-2 gap-2"
          role="group"
          aria-label={t("choose")}
        >
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="w-full"
            disabled={nextLeft === undefined}
            onClick={() => choose("left")}
          >
            <IcuMarkdownText
              value={t.markdown("left", { value: nextLeft ?? "—" })}
            />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="w-full"
            disabled={nextRight === undefined}
            onClick={() => choose("right")}
          >
            <IcuMarkdownText
              value={t.markdown("right", { value: nextRight ?? "—" })}
            />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              setI(0);
              setJ(0);
              setResult([]);
              setWrong(false);
            }}
          >
            <IcuMarkdownText value={t.markdown("reset")} />
          </Button>
        </div>
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown(wrong ? "wrong" : done ? "done" : "continue")}
        />
      }
    >
      <div className="px-6 py-4 text-sm">
        <p className="m-0">
          <IcuMarkdownText
            value={t.markdown("remaining", {
              left: left.slice(i).join(", ") || "—",
              right: right.slice(j).join(", ") || "—",
            })}
          />
        </p>
        <p className="mt-2 mb-0">
          <IcuMarkdownText
            value={t.markdown("output", { value: result.join(", ") || "—" })}
          />
        </p>
      </div>
    </DemoFrame>
  );
}
