"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
function choices(amount: number) {
  const greedy: number[] = [];
  let remain = amount;
  for (const c of [4, 3, 1])
    while (remain >= c) {
      greedy.push(c);
      remain -= c;
    }
  const best: number[][] = [[]];
  for (let i = 1; i <= amount; i++) {
    let winner: number[] | undefined;
    for (const c of [1, 3, 4])
      if (i >= c) {
        const candidate = [...best[i - c]!, c];
        if (!winner || candidate.length < winner.length) winner = candidate;
      }
    best.push(winner!);
  }
  return { greedy, optimum: best[amount]! };
}
export default function GreedyChangeDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [amount, setAmount] = useState(6);
  const { greedy, optimum } = choices(amount);
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <DemoRange
          label={t.markdown("amount")}
          value={amount}
          display={String(amount)}
          min={1}
          max={12}
          onChange={setAmount}
        />
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown(
            greedy.length === optimum.length ? "equal" : "worse",
            {
              greedy: greedy.length,
              optimum: optimum.length,
            },
          )}
        />
      }
    >
      <div className="grid grid-cols-2 gap-3 px-6 py-4">
        {[
          { name: t("greedy"), coins: greedy },
          { name: t("optimal"), coins: optimum },
        ].map(({ name, coins }) => (
          <div key={name} className="rounded-md border p-3">
            <div className="text-muted-foreground text-xs">{name}</div>
            <div className="mt-2 min-h-12 text-sm">{coins.join(" + ")}</div>
          </div>
        ))}
      </div>
    </DemoFrame>
  );
}
