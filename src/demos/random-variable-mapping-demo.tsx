"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function RandomVariableMappingDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [threshold, setThreshold] = useState(4);
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <DemoRange
          label={t.markdown("threshold")}
          value={threshold}
          display={String(threshold)}
          min={1}
          max={6}
          onChange={setThreshold}
        />
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", { count: 7 - threshold })}
        />
      }
    >
      <div className="overflow-x-auto px-6 py-4">
        <table className="demo-table">
          <tbody>
            <tr>
              <th scope="row">
                <IcuMarkdownText value={t.markdown("outcome")} />
              </th>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <td key={n}>{n}</td>
              ))}
            </tr>
            <tr>
              <th scope="row">
                <IcuMarkdownText value={t.markdown("variable")} />
              </th>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <td key={n}>{n >= threshold ? 1 : 0}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </DemoFrame>
  );
}
