"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function JointTableDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [prior, setPrior] = useState(0.5);
  const [first, setFirst] = useState(0.4);
  const [second, setSecond] = useState(0.8);
  const num = (v: number) => format.number(v, { maximumFractionDigits: 3 });
  const a = prior * first,
    b = prior * (1 - first),
    c = (1 - prior) * second,
    d = (1 - prior) * (1 - second);
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label={t.markdown("prior")}
            value={prior}
            display={num(prior)}
            min={0.05}
            max={0.95}
            step={0.05}
            onChange={setPrior}
          />
          <DemoRange
            label={t.markdown("first")}
            value={first}
            display={num(first)}
            min={0}
            max={1}
            step={0.05}
            onChange={setFirst}
          />
          <DemoRange
            label={t.markdown("second")}
            value={second}
            display={num(second)}
            min={0}
            max={1}
            step={0.05}
            onChange={setSecond}
          />
        </>
      }
      conclusion={
        <IcuMarkdownText value={t.markdown("result", { value: num(a + c) })} />
      }
    >
      <div className="overflow-x-auto px-6 py-4">
        <table className="demo-table">
          <thead>
            <tr>
              <th>
                <IcuMarkdownText value={"$X\\backslash Y$"} />
              </th>
              <th>
                <IcuMarkdownText value="$Y=1$" />
              </th>
              <th>
                <IcuMarkdownText value="$Y=0$" />
              </th>
              <th>
                <IcuMarkdownText value="$P(X)$" />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">
                <IcuMarkdownText value="$X=1$" />
              </th>
              <td>{num(a)}</td>
              <td>{num(b)}</td>
              <td>{num(prior)}</td>
            </tr>
            <tr>
              <th scope="row">
                <IcuMarkdownText value="$X=0$" />
              </th>
              <td>{num(c)}</td>
              <td>{num(d)}</td>
              <td>{num(1 - prior)}</td>
            </tr>
            <tr>
              <th scope="row">
                <IcuMarkdownText value="$P(Y)$" />
              </th>
              <td>{num(a + c)}</td>
              <td>{num(b + d)}</td>
              <td>1</td>
            </tr>
          </tbody>
        </table>
      </div>
    </DemoFrame>
  );
}
