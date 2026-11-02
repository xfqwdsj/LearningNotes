"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function RandomVectorMappingDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [point, setPoint] = useState(1);
  const x = point % 2 === 0 ? 1 : 0,
    y = point > 3 ? 1 : 0;
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <DemoRange
          label={t.markdown("point")}
          value={point}
          display={String(point)}
          min={1}
          max={6}
          onChange={setPoint}
        />
      }
      conclusion={
        <IcuMarkdownText value={t.markdown("result", { point, x, y })} />
      }
    >
      <div className="overflow-x-auto px-6 py-4">
        <table className="demo-table">
          <thead>
            <tr>
              <th>
                <IcuMarkdownText value={"$\\omega$"} />
              </th>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <th key={n}>{n}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">
                <IcuMarkdownText value="$X$" />
              </th>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <td key={n}>{n % 2 === 0 ? 1 : 0}</td>
              ))}
            </tr>
            <tr>
              <th scope="row">
                <IcuMarkdownText value="$Y$" />
              </th>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <td key={n}>{n > 3 ? 1 : 0}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </DemoFrame>
  );
}
