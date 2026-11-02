"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function PythonZipDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [a, setA] = useState(4),
    [b, setB] = useState(2),
    count = Math.min(a, b);
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label={t.markdown("first")}
            value={a}
            display={String(a)}
            min={0}
            max={5}
            onChange={setA}
          />
          <DemoRange
            label={t.markdown("second")}
            value={b}
            display={String(b)}
            min={0}
            max={5}
            onChange={setB}
          />
        </>
      }
      conclusion={<IcuMarkdownText value={t.markdown("result", { count })} />}
    >
      <div className="overflow-x-auto px-6 py-4">
        <table className="demo-table">
          <thead>
            <tr>
              <th>
                <IcuMarkdownText value={t.markdown("position")} />
              </th>
              <th>
                <IcuMarkdownText value={t.markdown("firstColumn")} />
              </th>
              <th>
                <IcuMarkdownText value={t.markdown("secondColumn")} />
              </th>
              <th>
                <IcuMarkdownText value={t.markdown("pair")} />
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }, (_, i) => (
              <tr
                key={i}
                className={i < count ? "bg-muted" : "text-muted-foreground"}
              >
                <td>{i + 1}</td>
                <td>{i < a ? i + 1 : "—"}</td>
                <td>{i < b ? String.fromCharCode(65 + i) : "—"}</td>
                <td>
                  {i < count
                    ? `(${i + 1}, ${String.fromCharCode(65 + i)})`
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DemoFrame>
  );
}
