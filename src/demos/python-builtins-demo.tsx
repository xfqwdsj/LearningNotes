"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, useDemoContent } from "./demo-frame";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
export default function PythonBuiltinsDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [count, setCount] = useState(2);
  const values = Array.from({ length: count }, (_, i) => i + 1);
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <div className="demo-action-row">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={count === 0}
            onClick={() => setCount(count - 1)}
          >
            <IcuMarkdownText value={t.markdown("remove")} />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={count === 5}
            onClick={() => setCount(count + 1)}
          >
            <IcuMarkdownText value={t.markdown("add")} />
          </Button>
        </div>
      }
      conclusion={
        <IcuMarkdownText value={t.markdown("result", { length: count })} />
      }
    >
      <div className="px-6 py-4 text-sm">
        <code>len([{values.join(", ")}])</code>
      </div>
    </DemoFrame>
  );
}
