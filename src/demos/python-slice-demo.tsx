"use client";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import { useId, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DemoFrame, useDemoContent } from "./demo-frame";
import { sliceIndices } from "./models";
import type { DemoComponentProps } from "./types";
const sequence = ["a", "b", "c", "d", "e", "f", "g"];
const fields = ["start", "stop", "step"] as const;
export default function PythonSliceDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const id = useId();
  const [bounds, setBounds] = useState(["1", "6", "2"]);
  const numbers = bounds.map(Number);
  const valid =
    bounds.every((value) => value.trim() !== "") &&
    numbers.every(Number.isInteger) &&
    numbers[2] !== 0;
  const indices = valid
    ? sliceIndices(sequence.length, numbers[0]!, numbers[1]!, numbers[2]!)
    : [];
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <div className="demo-slice-inputs">
            {fields.map((field, index) => (
              <div key={field}>
                <label htmlFor={`${id}-${field}`}>
                  <IcuMarkdownText value={t.markdown(field)} />
                </label>
                <Input
                  id={`${id}-${field}`}
                  type="number"
                  min={-14}
                  max={14}
                  step={1}
                  value={bounds[index]}
                  onChange={(event) =>
                    setBounds((previous) =>
                      previous.map((value, i) =>
                        i === index ? event.target.value : value,
                      ),
                    )
                  }
                />
              </div>
            ))}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setBounds(["6", "-8", "-2"])}
          >
            <IcuMarkdownText value={t.markdown("reverse")} />
          </Button>
        </>
      }
      conclusion={
        <>
          <p className="demo-inline-code">
            <code>{`s[${bounds.join(":")}]`}</code>
          </p>
          {valid ? (
            <output>
              <IcuMarkdownText
                value={t.markdown("result", {
                  value: `[${indices.map((index) => `'${sequence[index]}'`).join(", ")}]`,
                })}
              />
            </output>
          ) : (
            <span role="alert">
              <IcuMarkdownText value={t.markdown("invalid")} />
            </span>
          )}
        </>
      }
    >
      <div className="demo-sequence" role="group" aria-label={t("sequence")}>
        {sequence.map((value, index) => (
          <div
            key={index}
            className="demo-sequence-cell"
            data-selected={indices.includes(index)}
          >
            <span>{index}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <p className="demo-selection-order">
        <IcuMarkdownText
          value={t.markdown("order", {
            value: indices.length ? indices.join(", ") : t("empty"),
          })}
        />
      </p>
    </DemoFrame>
  );
}
