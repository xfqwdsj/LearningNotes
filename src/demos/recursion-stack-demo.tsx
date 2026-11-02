"use client";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import { factorialTrace } from "./models";
import type { DemoComponentProps } from "./types";
export default function RecursionStackDemo(props: DemoComponentProps) {
  const { t, format } = useDemoContent(props);
  const [n, setN] = useState(4),
    [step, setStep] = useState(0);
  const reduced = useReducedMotion();
  const trace = factorialTrace(n),
    current = trace[step]!;
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <>
          <DemoRange
            label={t.markdown("depth")}
            value={n}
            display={format.number(n)}
            min={0}
            max={6}
            onChange={(value) => {
              setN(value);
              setStep(0);
            }}
          />
          <div className="demo-action-row">
            <Button
              variant="outline"
              size="sm"
              disabled={step === 0}
              onClick={() => setStep(step - 1)}
            >
              <ArrowLeft />
              <IcuMarkdownText value={t.markdown("previous")} />
            </Button>
            <span>
              <IcuMarkdownText
                value={t.markdown("progress", {
                  current: step + 1,
                  total: trace.length,
                })}
              />
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={step === trace.length - 1}
              onClick={() => setStep(step + 1)}
            >
              <IcuMarkdownText value={t.markdown("next")} />
              <ArrowRight />
            </Button>
          </div>
        </>
      }
      conclusion={
        <IcuMarkdownText
          value={
            current.kind === "call"
              ? t.markdown("calling", { n: current.argument })
              : t.markdown("returning", {
                  n: current.argument,
                  value: current.value,
                })
          }
        />
      }
    >
      <div
        className="demo-stack"
        role="img"
        aria-label={t("stack", { count: current.stack.length })}
      >
        <AnimatePresence initial={false}>
          {current.stack.map((frame, index) => (
            <motion.div
              className="demo-stack-frame"
              key={frame.argument}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.2 }}
              style={{ bottom: `${index * 2.75}rem` }}
              data-active={index === current.stack.length - 1}
            >
              <code>factorial({frame.argument})</code>
              <span>
                {index === current.stack.length - 1
                  ? t("active")
                  : t("waiting")}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
        {current.stack.length === 0 && (
          <p>
            <IcuMarkdownText value={t.markdown("empty")} />
          </p>
        )}
      </div>
    </DemoFrame>
  );
}
