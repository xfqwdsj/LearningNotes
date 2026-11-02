"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function JointCdfDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [x, setX] = useState(0),
    [y, setY] = useState(0);
  const data = [
    [0.1, 0.2],
    [0.3, 0.4],
  ];
  let total = 0;
  for (let i = 0; i < 2; i++)
    for (let j = 0; j < 2; j++) if (i <= x && j <= y) total += data[i]![j]!;
  const num = (v: number) => format.number(v, { maximumFractionDigits: 2 });
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label={t.markdown("x")}
            value={x}
            display={String(x)}
            min={-1}
            max={1}
            onChange={setX}
          />
          <DemoRange
            label={t.markdown("y")}
            value={y}
            display={String(y)}
            min={-1}
            max={1}
            onChange={setY}
          />
        </>
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", { x, y, value: num(total) })}
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
            {data.map((row, i) => (
              <tr key={i}>
                <th scope="row">{i}</th>
                {row.map((v, j) => (
                  <td
                    key={j}
                    className={
                      i <= x && j <= y ? "text-primary font-bold" : "opacity-40"
                    }
                  >
                    {num(v)}
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
