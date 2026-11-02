"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function IndependentVariablesDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [q, setQ] = useState(0.5);
  const joint = 0.5 * q,
    marginal = 0.25 + 0.5 * q,
    product = 0.5 * marginal;
  const num = (v: number) => format.number(v, { maximumFractionDigits: 3 });
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <DemoRange
          label={t.markdown("conditional")}
          value={q}
          display={num(q)}
          min={0}
          max={1}
          step={0.05}
          onChange={setQ}
        />
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown(
            Math.abs(q - 0.5) < 1e-9 ? "independent" : "dependent",
            {
              joint: num(joint),
              product: num(product),
            },
          )}
        />
      }
    >
      <div className="overflow-x-auto px-6 py-4">
        <table className="demo-table">
          <thead>
            <tr>
              <th>
                <IcuMarkdownText value={"$X\\backslash Y$"} />
              </th>
              <th>0</th>
              <th>1</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">0</th>
              <td>0.25</td>
              <td>0.25</td>
            </tr>
            <tr>
              <th scope="row">1</th>
              <td>{num(0.5 - joint)}</td>
              <td>{num(joint)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </DemoFrame>
  );
}
