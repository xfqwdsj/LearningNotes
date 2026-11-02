"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
function choose(n: number, k: number) {
  if (k > n) return 0;
  let c = 1;
  for (let i = 1; i <= k; i++) c = (c * (n - i + 1)) / i;
  return c;
}
export default function BinomialCountDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [p, setP] = useState(0.4),
    [n, setN] = useState(5),
    [k, setK] = useState(2);
  const probability = (j: number) =>
      j > n ? 0 : choose(n, j) * p ** j * (1 - p) ** (n - j),
    v = probability(k);
  const num = (x: number) => format.number(x, { maximumFractionDigits: 3 });
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label={t.markdown("probability")}
            value={p}
            display={num(p)}
            min={0.05}
            max={0.95}
            step={0.05}
            onChange={setP}
          />
          <DemoRange
            label={t.markdown("trials")}
            value={n}
            display={String(n)}
            min={1}
            max={10}
            onChange={setN}
          />
          <DemoRange
            label={t.markdown("successes")}
            value={k}
            display={String(k)}
            min={0}
            max={10}
            onChange={setK}
          />
        </>
      }
      conclusion={
        <IcuMarkdownText value={t.markdown("result", { k, value: num(v) })} />
      }
    >
      <div
        className="flex h-36 items-end justify-around gap-1 px-6 pt-4"
        role="img"
        aria-label={t("diagram", { k, value: num(v) })}
      >
        {Array.from({ length: 11 }, (_, i) => (
          <div
            key={i}
            className="flex h-full flex-1 flex-col items-center justify-end"
          >
            <div
              className="w-full bg-current"
              style={{
                height: `${probability(i) * 100}%`,
                opacity: i === k ? 0.8 : 0.2,
              }}
            />
            <span className="w-full text-center">{i}</span>
          </div>
        ))}
      </div>
    </DemoFrame>
  );
}
