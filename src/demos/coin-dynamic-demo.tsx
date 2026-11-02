"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
function minimumCoins() {
  const costs = [0];
  for (let i = 1; i <= 12; i++)
    costs.push(
      1 +
        Math.min(...[1, 3, 4].filter((c) => c <= i).map((c) => costs[i - c]!)),
    );
  return costs;
}
export default function CoinDynamicDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [amount, setAmount] = useState(6);
  const dp = minimumCoins();
  const predecessors = [1, 3, 4]
    .filter((c) => c <= amount)
    .map((c) => dp[amount - c]!);
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
          value={t.markdown("result", {
            amount,
            steps: predecessors.join(", "),
            answer: dp[amount]!,
          })}
        />
      }
    >
      <div
        className="grid grid-cols-7 gap-1 px-6 py-4"
        role="img"
        aria-label={t("diagram", { amount, answer: dp[amount]! })}
      >
        {dp.map((value, i) => (
          <div
            key={i}
            className={`rounded-md border px-1 py-2 text-center text-xs ${i === amount ? "border-foreground bg-muted font-bold" : i > amount ? "opacity-30" : ""}`}
          >
            <div className="text-muted-foreground">{i}</div>
            <div>{value}</div>
          </div>
        ))}
      </div>
    </DemoFrame>
  );
}
