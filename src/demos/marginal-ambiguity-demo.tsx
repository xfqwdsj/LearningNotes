"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function MarginalAmbiguityDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [joint, setJoint] = useState(0.25);
  const num = (v: number) => format.number(v, { maximumFractionDigits: 2 });
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <DemoRange
          label={t.markdown("joint")}
          value={joint}
          display={num(joint)}
          min={0}
          max={0.5}
          step={0.05}
          onChange={setJoint}
        />
      }
      conclusion={
        <IcuMarkdownText value={t.markdown("result", { joint: num(joint) })} />
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
              <th>
                <IcuMarkdownText value="$P(X)$" />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">0</th>
              <td>{num(joint)}</td>
              <td>{num(0.5 - joint)}</td>
              <td>0.5</td>
            </tr>
            <tr>
              <th scope="row">1</th>
              <td>{num(0.5 - joint)}</td>
              <td>{num(joint)}</td>
              <td>0.5</td>
            </tr>
            <tr>
              <th scope="row">
                <IcuMarkdownText value="$P(Y)$" />
              </th>
              <td>0.5</td>
              <td>0.5</td>
              <td>1</td>
            </tr>
          </tbody>
        </table>
      </div>
    </DemoFrame>
  );
}
