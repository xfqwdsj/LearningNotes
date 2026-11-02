"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function IpRoutingDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [first, setFirst] = useState<10 | 203>(10),
    [second, setSecond] = useState(1);
  const route =
    first !== 10 ? "default" : second === 1 ? "specific" : "general";
  const rows = [
    { id: "specific", prefix: "10.1.0.0/16", next: "B" },
    { id: "general", prefix: "10.0.0.0/8", next: "A" },
    { id: "default", prefix: "0.0.0.0/0", next: "C" },
  ];
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <div
            role="group"
            aria-label={t("first")}
            className="grid grid-cols-2 gap-2"
          >
            {([10, 203] as const).map((v) => (
              <Button
                key={v}
                type="button"
                variant={v === first ? "default" : "outline"}
                size="sm"
                className="w-full"
                aria-pressed={v === first}
                onClick={() => setFirst(v)}
              >
                {v}
              </Button>
            ))}
          </div>
          <DemoRange
            label={t.markdown("second")}
            value={second}
            display={String(second)}
            min={0}
            max={3}
            onChange={setSecond}
          />
        </>
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", {
            address: `${first}.${second}.2.3`,
            route: rows.find((r) => r.id === route)!.prefix,
            next: rows.find((r) => r.id === route)!.next,
          })}
        />
      }
    >
      <div className="overflow-x-auto px-6 py-4">
        <table className="demo-table">
          <thead>
            <tr>
              <th>
                <IcuMarkdownText value={t.markdown("prefix")} />
              </th>
              <th>
                <IcuMarkdownText value={t.markdown("nextHop")} />
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className={route === row.id ? "bg-muted font-bold" : ""}
              >
                <td>
                  <code>{row.prefix}</code>
                </td>
                <td>{row.next}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DemoFrame>
  );
}
