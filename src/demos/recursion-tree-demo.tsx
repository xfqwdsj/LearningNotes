"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
type Node = {
  value: number;
  x: number;
  y: number;
  parentX: number | null;
  parentY: number | null;
};
function leafCount(value: number): number {
  return value <= 1 ? 1 : leafCount(value - 1) + leafCount(value - 2);
}
function buildTree(n: number): Node[] {
  const leaves = leafCount(n);
  let nextLeaf = 0;
  const nodes: (Node & { parent: number | null })[] = [];
  function visit(value: number, depth: number, parent: number | null): number {
    const index = nodes.length;
    nodes.push({
      value,
      x: 0,
      y: 30 + depth * 46,
      parent,
      parentX: null,
      parentY: null,
    });
    if (value <= 1) {
      nodes[index]!.x =
        leaves === 1 ? 230 : 40 + (380 * nextLeaf++) / (leaves - 1);
    } else {
      const left = visit(value - 1, depth + 1, index);
      const right = visit(value - 2, depth + 1, index);
      nodes[index]!.x = (nodes[left]!.x + nodes[right]!.x) / 2;
    }
    return index;
  }
  visit(n, 0, null);
  return nodes.map((node) => ({
    ...node,
    parentX: node.parent === null ? null : nodes[node.parent]!.x,
    parentY: node.parent === null ? null : nodes[node.parent]!.y,
  }));
}
function fib(n: number): number {
  return n < 2 ? n : fib(n - 1) + fib(n - 2);
}
export default function RecursionTreeDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [n, setN] = useState(4);
  const nodes = buildTree(n);
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <DemoRange
          label={t.markdown("input")}
          value={n}
          display={String(n)}
          min={0}
          max={5}
          onChange={setN}
        />
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", { value: fib(n), count: nodes.length })}
        />
      }
    >
      <svg
        viewBox="0 0 460 300"
        role="img"
        aria-label={t("diagram", { count: nodes.length })}
      >
        {nodes.map((node, i) =>
          node.parentX === null ? null : (
            <line
              key={`e${i}`}
              x1={node.parentX}
              y1={node.parentY!}
              x2={node.x}
              y2={node.y}
              stroke="currentColor"
              opacity=".3"
            />
          ),
        )}
        {nodes.map((node, i) => (
          <g key={`n${i}`}>
            <circle
              cx={node.x}
              cy={node.y}
              r="16"
              fill="var(--background)"
              stroke="currentColor"
              opacity=".9"
            />
            <foreignObject
              x={node.x - 16}
              y={node.y - 16}
              width={32}
              height={32}
            >
              <div
                {...({ xmlns: "http://www.w3.org/1999/xhtml" } as Record<
                  string,
                  string
                >)}
                className="demo-graph-formula flex h-full items-center justify-center"
                style={{ fontSize: 16 }}
              >
                <Tex source={String(node.value)} />
              </div>
            </foreignObject>
          </g>
        ))}
      </svg>
    </DemoFrame>
  );
}
