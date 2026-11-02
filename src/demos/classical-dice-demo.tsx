"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function ClassicalDiceDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [sum, setSum] = useState(7);
  const count = Math.min(sum - 1, 13 - sum);
  const num = format.number(count / 36, { maximumFractionDigits: 3 });
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <DemoRange
          label={t.markdown("sum")}
          value={sum}
          display={String(sum)}
          min={2}
          max={12}
          onChange={setSum}
        />
      }
      conclusion={
        <IcuMarkdownText value={t.markdown("result", { count, num })} />
      }
    >
      <div className="overflow-x-auto px-6 py-4">
        <table className="demo-table">
          <tbody>
            {[1, 2, 3, 4, 5, 6].map((a) => (
              <tr key={a}>
                {[1, 2, 3, 4, 5, 6].map((b) => (
                  <td
                    key={b}
                    className={
                      a + b === sum ? "text-primary font-bold" : "opacity-40"
                    }
                  >
                    {a}+{b}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DemoFrame>
  );
}
