"use client";

import { IcuMarkdownText } from "@/components/icu-markdown-text";
import { useClientReady } from "@/components/client-ready";
import type { MarkdownValue } from "@/lib/markdown/types";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
} from "react";

const MINIMUM_MARK_GAP = 10;

function decimalPlaces(value: number) {
  const text = String(value);
  if (text.includes("e-")) return Number(text.split("e-")[1]);
  return text.split(".")[1]?.length ?? 0;
}

function roundTo(value: number, places: number) {
  const factor = 10 ** places;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function dockDemoRangeValue(
  value: number,
  min: number,
  max: number,
  step: number,
) {
  const safeStep = Number.isFinite(step) && step > 0 ? step : 1;
  const clamped = Math.min(max, Math.max(min, value));
  const docked = min + Math.round((clamped - min) / safeStep) * safeStep;
  return roundTo(Math.min(max, Math.max(min, docked)), decimalPlaces(safeStep));
}

export function demoRangeStepValues(min: number, max: number, step: number) {
  if (!(max > min) || !(step > 0)) return [min];
  const values: number[] = [];
  const places = decimalPlaces(step);
  for (let value = min; value < max; value = roundTo(value + step, places)) {
    values.push(value);
  }
  if (values.at(-1) !== max) values.push(max);
  return values;
}

export function shouldShowDemoRangeMarks(
  width: number,
  min: number,
  max: number,
  step: number,
  minimumGap = MINIMUM_MARK_GAP,
) {
  if (width <= 0 || !(max > min) || !(step > 0)) return false;
  return (step / (max - min)) * width >= minimumGap;
}

function percentOf(value: number, min: number, max: number) {
  if (!(max > min)) return 0;
  return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
}

type RangeStyle = CSSProperties & {
  "--demo-range-position": string;
};

export function DemoRange({
  label,
  value,
  display,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: MarkdownValue | string;
  value: number;
  display: MarkdownValue | string;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  const inputId = useId();
  const labelId = useId();
  const ready = useClientReady();
  const railRef = useRef<HTMLDivElement>(null);
  const settleFrameRef = useRef<number | null>(null);
  const marksHideTimerRef = useRef<number | null>(null);
  const draggingRef = useRef(false);
  const [trackWidth, setTrackWidth] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [marksPhase, setMarksPhase] = useState<
    "hidden" | "visible" | "exiting"
  >("hidden");
  const [previewValue, setPreviewValue] = useState<number | null>(null);
  const currentValue = previewValue ?? value;
  const activeValue = dockDemoRangeValue(currentValue, min, max, step);
  const marksSupported = shouldShowDemoRangeMarks(trackWidth, min, max, step);
  const marksVisible = marksSupported && marksPhase !== "hidden";
  const stepValues = marksVisible ? demoRangeStepValues(min, max, step) : [];
  const activeIndex = stepValues.indexOf(activeValue);
  const style = {
    "--demo-range-position": `${percentOf(currentValue, min, max)}%`,
  } as RangeStyle;

  useEffect(() => {
    if (!ready || !railRef.current) return;
    const rail = railRef.current;
    const measure = () => setTrackWidth(rail.getBoundingClientRect().width);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(rail);
    return () => observer.disconnect();
  }, [ready]);

  useEffect(() => {
    return () => {
      if (settleFrameRef.current !== null)
        window.cancelAnimationFrame(settleFrameRef.current);
      if (marksHideTimerRef.current !== null)
        window.clearTimeout(marksHideTimerRef.current);
    };
  }, []);

  const finishDrag = useCallback(() => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setDragging(false);
    setMarksPhase((phase) => (phase === "visible" ? "exiting" : phase));
    if (marksHideTimerRef.current !== null)
      window.clearTimeout(marksHideTimerRef.current);
    marksHideTimerRef.current = window.setTimeout(() => {
      setMarksPhase("hidden");
      marksHideTimerRef.current = null;
    }, 230);
    if (settleFrameRef.current !== null)
      window.cancelAnimationFrame(settleFrameRef.current);
    settleFrameRef.current = window.requestAnimationFrame(() => {
      setPreviewValue(null);
      settleFrameRef.current = null;
    });
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const finish = () => finishDrag();
    window.addEventListener("pointerup", finish);
    window.addEventListener("pointercancel", finish);
    return () => {
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", finish);
    };
  }, [dragging, finishDrag]);

  const commit = (nextValue: number) => {
    const docked = dockDemoRangeValue(nextValue, min, max, step);
    if (docked !== value) onChange(docked);
    return docked;
  };

  const onRangeChange = (nextValue: number) => {
    if (!ready || !Number.isFinite(nextValue)) return;
    setPreviewValue(nextValue);
    commit(nextValue);
  };

  return (
    <div className="demo-range">
      <label id={labelId} htmlFor={inputId} className="demo-range-label">
        <span>
          <IcuMarkdownText value={label} />
        </span>
        <strong
          key={String(activeValue)}
          className="demo-range-value"
          aria-hidden="true"
        >
          <IcuMarkdownText value={display} />
        </strong>
      </label>
      <div
        className="demo-range-control"
        data-dragging={dragging ? "true" : "false"}
        data-marks={marksVisible ? "true" : "false"}
        style={style}
      >
        <div ref={railRef} className="demo-range-rail" aria-hidden="true">
          <span className="demo-range-fill" />
        </div>
        {marksVisible ? (
          <span
            className="demo-range-ticks"
            data-phase={marksPhase}
            aria-hidden="true"
          >
            {stepValues.map((mark, index) => {
              const active = mark === activeValue;
              const distance =
                activeIndex >= 0
                  ? Math.abs(index - activeIndex)
                  : Math.min(index, stepValues.length - index - 1);
              return (
                <span
                  key={mark}
                  className="demo-range-tick"
                  data-active={active ? "true" : "false"}
                  style={
                    {
                      "--demo-range-tick-position": `${percentOf(mark, min, max)}%`,
                      "--demo-range-tick-delay": `${Math.min(120, distance * 3)}ms`,
                    } as CSSProperties
                  }
                />
              );
            })}
          </span>
        ) : null}
        <span className="demo-range-thumb" aria-hidden="true">
          <span className="demo-range-thumb-core" />
        </span>
        <input
          id={inputId}
          className="demo-range-input"
          data-slot="demo-range-input"
          type="range"
          role="slider"
          min={min}
          max={max}
          step="any"
          value={currentValue}
          disabled={!ready}
          aria-disabled={!ready ? "true" : undefined}
          aria-labelledby={labelId}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={activeValue}
          aria-valuetext={String(activeValue)}
          onChange={(event) => onRangeChange(event.currentTarget.valueAsNumber)}
          onPointerDown={() => {
            if (!ready) return;
            if (settleFrameRef.current !== null) {
              window.cancelAnimationFrame(settleFrameRef.current);
              settleFrameRef.current = null;
            }
            if (marksHideTimerRef.current !== null) {
              window.clearTimeout(marksHideTimerRef.current);
              marksHideTimerRef.current = null;
            }
            draggingRef.current = true;
            setPreviewValue(value);
            setDragging(true);
            setMarksPhase(marksSupported ? "visible" : "hidden");
          }}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
          onKeyDown={(event) => {
            const page = event.key === "PageUp" || event.key === "PageDown";
            const arrow =
              event.key === "ArrowLeft" ||
              event.key === "ArrowRight" ||
              event.key === "ArrowUp" ||
              event.key === "ArrowDown";
            if (event.key === "Home" || event.key === "End") {
              event.preventDefault();
              const next = event.key === "Home" ? min : max;
              onChange(next);
              return;
            }
            if (!page && !arrow) return;
            event.preventDefault();
            const direction =
              event.key === "ArrowLeft" ||
              event.key === "ArrowDown" ||
              event.key === "PageDown"
                ? -1
                : 1;
            const multiplier = page || event.shiftKey ? 10 : 1;
            const next = dockDemoRangeValue(
              value + direction * step * multiplier,
              min,
              max,
              step,
            );
            onChange(next);
          }}
          onBlur={finishDrag}
        />
      </div>
    </div>
  );
}
