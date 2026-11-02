"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function RandomTransformDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [p, setP] = useState(0.3);
  const middle = (1 - p) / 2,
    right = middle;
  const num = (v: number) => format.number(v, { maximumFractionDigits: 3 });
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <DemoRange
          label={t.markdown("probability")}
          value={p}
          display={num(p)}
          min={0}
          max={1}
          step={0.05}
          onChange={setP}
        />
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", {
            zero: num(middle),
            one: num(p + right),
          })}
        />
      }
    >
      <div className="overflow-x-auto px-6 py-4">
        <table className="demo-table">
          <thead>
            <tr>
              <th>
                <IcuMarkdownText value="$X$" />
              </th>
              <th>-1</th>
              <th>0</th>
              <th>1</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">
                <IcuMarkdownText value="$P(X)$" />
              </th>
              <td>{num(p)}</td>
              <td>{num(middle)}</td>
              <td>{num(right)}</td>
            </tr>
            <tr>
              <th scope="row">
                <IcuMarkdownText value="$X^2$" />
              </th>
              <td>1</td>
              <td>0</td>
              <td>1</td>
            </tr>
          </tbody>
        </table>
      </div>
    </DemoFrame>
  );
}
