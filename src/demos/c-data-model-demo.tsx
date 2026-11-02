"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, useDemoContent } from "./demo-frame";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function CDataModelDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [model, setModel] = useState<"lp64" | "llp64">("lp64");
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <div
          role="group"
          aria-label={t("choose")}
          className="grid grid-cols-2 gap-2"
        >
          {(["lp64", "llp64"] as const).map((v) => (
            <Button
              key={v}
              type="button"
              size="sm"
              variant={modeVariant(v, model)}
              className="w-full"
              aria-pressed={model === v}
              onClick={() => setModel(v)}
            >
              {v.toUpperCase()}
            </Button>
          ))}
        </div>
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", { size: model === "lp64" ? 8 : 4 })}
        />
      }
    >
      <div className="overflow-x-auto px-6 py-4">
        <table className="demo-table">
          <thead>
            <tr>
              <th>
                <IcuMarkdownText value={t.markdown("type")} />
              </th>
              <th>
                <IcuMarkdownText value={t.markdown("size")} />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>int</code>
              </td>
              <td>4</td>
            </tr>
            <tr>
              <td>
                <code>long</code>
              </td>
              <td>{model === "lp64" ? 8 : 4}</td>
            </tr>
            <tr>
              <td>
                <IcuMarkdownText value={t.markdown("pointer")} />
              </td>
              <td>8</td>
            </tr>
          </tbody>
        </table>
      </div>
    </DemoFrame>
  );
}
function modeVariant(v: string, model: string) {
  return v === model ? "default" : "outline";
}
