"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DemoFrame, useDemoContent } from "./demo-frame";
import { SvgTex, Tex } from "./demo-math";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import { roundSvgNumber } from "./svg";
import type { DemoComponentProps } from "./types";
export default function DiscontinuityDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [kind, setKind] = useState<"removable" | "jump" | "infinite">(
    "removable",
  );
  const curve = (side: -1 | 1) => {
    const xs = Array.from(
      { length: 120 },
      (_, i) => side * (0.02 + (i * 2.98) / 119),
    );
    return xs
      .map((x) => {
        const y =
          kind === "removable"
            ? Math.sin(x) / x
            : kind === "jump"
              ? Math.sign(x)
              : 1 / x;
        return Math.abs(y) <= 2
          ? `${roundSvgNumber(230 + 60 * x)},${roundSvgNumber(110 - 40 * y)}`
          : null;
      })
      .filter((point) => point !== null)
      .join(" ");
  };
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <div
          role="group"
          aria-label={t("choose")}
          className="grid grid-cols-3 gap-2"
        >
          {(["removable", "jump", "infinite"] as const).map((v) => (
            <Button
              type="button"
              key={v}
              size="sm"
              className="w-full min-w-0 px-0"
              variant={kind === v ? "default" : "outline"}
              aria-pressed={kind === v}
              onClick={() => setKind(v)}
            >
              <IcuMarkdownText value={t.markdown(v)} />
            </Button>
          ))}
        </div>
      }
      conclusion={<IcuMarkdownText value={t.markdown(kind + "Result")} />}
    >
      <p className="px-6 pt-4 text-sm">
        <IcuMarkdownText value={t.raw("graphNote") as string} />
      </p>
      <svg
        viewBox="0 0 460 225"
        role="img"
        aria-label={t("graphLabel", { kind: t(kind) })}
      >
        <line
          x1="35"
          y1="110"
          x2="425"
          y2="110"
          stroke="currentColor"
          opacity=".3"
        />
        <line
          x1="230"
          y1="25"
          x2="230"
          y2="195"
          stroke="currentColor"
          opacity=".3"
        />
        <polyline
          points={curve(-1)}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <polyline
          points={curve(1)}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        {kind !== "infinite" && (
          <circle
            cx="230"
            cy="70"
            r="5"
            fill="var(--background)"
            stroke="currentColor"
            strokeWidth="2"
          />
        )}
        {kind === "jump" && (
          <circle
            cx="230"
            cy="150"
            r="5"
            fill="var(--background)"
            stroke="currentColor"
            strokeWidth="2"
          />
        )}
        <SvgTex x={427} y={114} width={25} source="x" />
        <SvgTex x={236} y={20} width={30} source="y" />
      </svg>
      <div className="grid gap-2 px-6 py-4 text-sm">
        <p>
          <Tex
            source={String.raw`${kind === "removable" ? "f(x)=\\frac{\\sin x}{x}" : kind === "jump" ? "f(x)=\\frac{x}{|x|}" : "f(x)=\\frac{1}{x}"}`}
          />
        </p>
        <p>
          <IcuMarkdownText value={t.markdown("left")} />:{" "}
          <Tex
            source={
              kind === "removable"
                ? "1"
                : kind === "jump"
                  ? "-1"
                  : String.raw`-\infty`
            }
          />
        </p>
        <p>
          <IcuMarkdownText value={t.markdown("right")} />:{" "}
          <Tex source={kind === "infinite" ? String.raw`+\infty` : "1"} />
        </p>
      </div>
    </DemoFrame>
  );
}
