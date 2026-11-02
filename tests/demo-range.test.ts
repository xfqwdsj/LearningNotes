import { describe, expect, it } from "vitest";
import {
  demoRangeStepValues,
  dockDemoRangeValue,
  shouldShowDemoRangeMarks,
} from "@/demos/demo-range";

describe("demo range docking", () => {
  it("docks a continuous pointer value to the nearest step", () => {
    expect(dockDemoRangeValue(0.234, 0, 1, 0.05)).toBe(0.25);
    expect(dockDemoRangeValue(0.224, 0, 1, 0.05)).toBe(0.2);
  });

  it("aligns steps to the minimum and respects the endpoints", () => {
    expect(dockDemoRangeValue(5.2, 1, 10, 3)).toBe(4);
    expect(dockDemoRangeValue(9.7, 1, 10, 3)).toBe(10);
    expect(dockDemoRangeValue(-4, -2, 2, 0.1)).toBe(-2);
    expect(dockDemoRangeValue(8, -2, 2, 0.1)).toBe(2);
  });

  it("includes a clamped endpoint when the range is not evenly divisible", () => {
    expect(demoRangeStepValues(1, 10, 3)).toEqual([1, 4, 7, 10]);
    expect(demoRangeStepValues(0, 1, 0.25)).toEqual([0, 0.25, 0.5, 0.75, 1]);
  });
});

describe("demo range marks", () => {
  it("shows marks only when adjacent steps have enough visual space", () => {
    expect(shouldShowDemoRangeMarks(400, 0, 10, 1)).toBe(true);
    expect(shouldShowDemoRangeMarks(400, 0, 40, 1)).toBe(true);
    expect(shouldShowDemoRangeMarks(350, 0, 40, 1)).toBe(false);
    expect(shouldShowDemoRangeMarks(0, 0, 10, 1)).toBe(false);
  });
});
