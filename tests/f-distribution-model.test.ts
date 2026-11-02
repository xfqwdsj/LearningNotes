import { describe, expect, it } from "vitest";
import { fDensity } from "@/demos/distribution-density";

describe("F distribution density", () => {
  it("agrees with the closed form for two and two degrees of freedom", () => {
    for (const x of [0.01, 0.1, 1, 5, 100]) {
      expect(fDensity(x, 2, 2)).toBeCloseTo(1 / (1 + x) ** 2, 12);
    }
  });

  it("places the default solid and swapped density modes at 0.4 and 0.5", () => {
    for (const x of [0.05, 0.4, 0.5, 1, 3]) {
      expect(fDensity(x, 4, 8)).toBeCloseTo((5 * x) / (1 + x / 2) ** 6, 12);
      expect(fDensity(x, 8, 4)).toBeCloseTo(
        (320 * x ** 3) / (1 + 2 * x) ** 6,
        12,
      );
    }
    for (const [n, m, mode] of [
      [4, 8, 0.4],
      [8, 4, 0.5],
    ]) {
      expect(fDensity(mode!, n!, m!)).toBeGreaterThan(
        fDensity(mode! - 0.01, n!, m!),
      );
      expect(fDensity(mode!, n!, m!)).toBeGreaterThan(
        fDensity(mode! + 0.01, n!, m!),
      );
    }
  });

  it("obeys the density change of variables for the reciprocal", () => {
    for (const [n, m] of [
      [1, 9],
      [4, 6],
      [9, 3],
    ] as const) {
      for (const x of [0.05, 0.5, 2, 20]) {
        expect(fDensity(x, m, n)).toBeCloseTo(
          fDensity(1 / x, n, m) / x ** 2,
          10,
        );
      }
    }
  });
});

it("matches the exponential and Cauchy special cases", async () => {
  const { chiSquareDensity, tDensity } =
    await import("@/demos/distribution-density");
  for (const x of [0.1, 1, 4]) {
    expect(chiSquareDensity(x, 2)).toBeCloseTo(Math.exp(-x / 2) / 2, 12);
    expect(tDensity(x, 1)).toBeCloseTo(1 / (Math.PI * (1 + x * x)), 12);
  }
});
