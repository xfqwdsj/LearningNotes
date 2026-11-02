"use client";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, useDemoContent } from "./demo-frame";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
const board = [".....", ".#.##", ".#...", "..##.", "#...."];
type Frame = {
  path: number[];
  visited: number[];
  phase: "visit" | "backtrack" | "found";
};
function search() {
  const frames: Frame[] = [],
    path: number[] = [],
    visited = new Set<number>();
  function save(phase: Frame["phase"]) {
    frames.push({ path: [...path], visited: [...visited], phase });
  }
  function visit(i: number): boolean {
    visited.add(i);
    path.push(i);
    save("visit");
    if (i === 24) {
      save("found");
      return true;
    }
    const row = Math.floor(i / 5),
      col = i % 5;
    for (const [dr, dc] of [
      [0, 1],
      [1, 0],
      [0, -1],
      [-1, 0],
    ]) {
      const r = row + dr!,
        c = col + dc!,
        next = r * 5 + c;
      if (
        r >= 0 &&
        r < 5 &&
        c >= 0 &&
        c < 5 &&
        board[r]![c] !== "#" &&
        !visited.has(next) &&
        visit(next)
      )
        return true;
    }
    path.pop();
    save("backtrack");
    return false;
  }
  visit(0);
  return frames;
}
export default function MazeBacktrackDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const frames = useMemo(() => search(), []);
  const [step, setStep] = useState(0);
  const frame = frames[step]!;
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <div className="demo-action-row">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={step === 0}
            onClick={() => setStep(step - 1)}
          >
            <IcuMarkdownText value={t.markdown("previous")} />
          </Button>
          <span>
            <IcuMarkdownText
              value={t.markdown("progress", {
                current: step + 1,
                total: frames.length,
              })}
            />
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={step === frames.length - 1}
            onClick={() => setStep(step + 1)}
          >
            <IcuMarkdownText value={t.markdown("next")} />
          </Button>
        </div>
      }
      conclusion={<IcuMarkdownText value={t.markdown(frame.phase)} />}
    >
      <div
        className="mx-auto grid max-w-64 grid-cols-5 gap-1 px-6 py-4"
        role="img"
        aria-label={t("diagram", { current: step + 1, total: frames.length })}
      >
        {board.flatMap((row, r) =>
          [...row].map((cell, c) => {
            const i = r * 5 + c,
              active = frame.path.at(-1) === i,
              onPath = frame.path.includes(i),
              seen = frame.visited.includes(i);
            const symbol =
              cell === "#"
                ? "■"
                : i === 0
                  ? "S"
                  : i === 24
                    ? "E"
                    : active
                      ? "◆"
                      : onPath
                        ? "●"
                        : seen
                          ? "·"
                          : "";
            return (
              <div
                key={i}
                className={`flex aspect-square items-center justify-center rounded-md border text-xs ${active ? "bg-foreground text-background" : onPath ? "bg-muted border-foreground" : cell === "#" ? "bg-muted" : ""}`}
              >
                {symbol === "S" || symbol === "E" ? (
                  <code>{symbol}</code>
                ) : (
                  symbol
                )}
              </div>
            );
          }),
        )}
      </div>
    </DemoFrame>
  );
}
