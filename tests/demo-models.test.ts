import SignedIntegerDemo from "@/demos/signed-integer-demo";
import { createTranslator } from "next-intl";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { fromHtml } from "hast-util-from-html";
import { visit } from "unist-util-visit";
import RecursionStackDemo from "@/demos/recursion-stack-demo";
import GradientDemo from "@/demos/gradient-demo";
import { demoRecord } from "@/demos/catalog";
import { describe, expect, it } from "vitest";
import {
  sliceIndices,
  signedByte,
  bayesPosterior,
  directionalSlope,
  factorialTrace,
  crossProductZ,
  uniformSampleMeans,
} from "@/demos/models";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { roundSvgNumber } from "@/demos/svg";
describe("interactive knowledge models", () => {
  it("quantizes SVG numbers at the shared presentation boundary", () => {
    expect(roundSvgNumber(204.9478062119517)).toBe(204.948);
    expect(roundSvgNumber(-70.00266661333384)).toBe(-70.003);
    expect(roundSvgNumber(0)).toBe(0);
    expect(roundSvgNumber(-0.0004)).toBe(0);
  });

  it("keeps demo-local rounding helpers out of SVG components", async () => {
    const root = path.resolve("src/demos");
    const duplicated =
      /const round = \(value: number\) => Math\.round\(value \* 1000\) \/ 1000;/;
    for (const name of await readdir(root)) {
      if (!name.endsWith(".tsx")) continue;
      const source = await readFile(path.join(root, name), "utf8");
      expect(source, name).not.toMatch(duplicated);
    }
  });

  it("renders the initial gradient direction accurately before hydration", () => {
    const html = renderToStaticMarkup(
      createElement(GradientDemo, demoRecord("gradient")),
    );
    const tree = fromHtml(html, { fragment: true });
    const lines: Record<string, unknown>[] = [];
    visit(tree, "element", (node) => {
      if (node.tagName === "line") lines.push(node.properties);
    });
    expect(lines).toHaveLength(1);
    expect(Number(lines[0]?.["x2"])).toBeGreaterThan(275);
    expect(Number(lines[0]?.["y2"])).toBeLessThan(105);
  });

  it("matches explicit Python slice normalization in both directions", () => {
    expect(sliceIndices(7, 1, 6, 2)).toEqual([1, 3, 5]);
    expect(sliceIndices(7, 6, -8, -2)).toEqual([6, 4, 2, 0]);
    expect(sliceIndices(7, -100, 100, 1)).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(sliceIndices(7, 6, -1, -1)).toEqual([]);
    expect(sliceIndices(7, 0, 7, -1)).toEqual([]);
    expect(() => sliceIndices(7, 1, 6, 0)).toThrow(RangeError);
  });
  it("handles the sign boundary without changing the bit pattern", () => {
    expect([0, 127, 128, 255].map(signedByte)).toEqual([0, 127, -128, -1]);
  });
  it("uses total screened mass as the Bayes denominator", () => {
    expect(bayesPosterior(0.2, 0.8, 0.1)).toBeCloseTo(2 / 3);
    expect(bayesPosterior(0.2, 0.8, 0)).toBe(1);
    expect(bayesPosterior(0.2, 0, 0)).toBeNull();
  });
  it("projects the gradient onto a unit direction", () => {
    expect(directionalSlope(45)).toBeCloseTo(2 * Math.sqrt(2));
    expect(directionalSlope(225)).toBeCloseTo(-2 * Math.sqrt(2));
    expect(directionalSlope(135)).toBe(0);
  });
});

describe("additional exploration models", () => {
  it("unwinds factorial calls in stack order, including the base case", () => {
    const trace = factorialTrace(4);
    expect(trace.map((step) => step.stack.length)).toEqual([
      1, 2, 3, 4, 5, 4, 3, 2, 1, 0,
    ]);
    expect(trace.at(-1)).toMatchObject({
      kind: "return",
      argument: 4,
      value: 24,
      stack: [],
    });
    expect(factorialTrace(0).at(-1)?.value).toBe(1);
    expect(() => factorialTrace(-1)).toThrow(RangeError);
  });
  it("retains the signed normal while area stays nonnegative", () => {
    expect(crossProductZ(2, 3, 90)).toBe(6);
    expect(crossProductZ(2, 3, -90)).toBe(-6);
    expect(crossProductZ(2, 3, 180)).toBe(0);
  });
  it("reproduces samples and shrinks sample-mean variance", () => {
    const samples = uniformSampleMeans(1, 8000, 1234);
    expect(uniformSampleMeans(1, 8000, 1234)).toEqual(samples);
    expect(uniformSampleMeans(1, 8000, 1235)).not.toEqual(samples);
    const average = (values: number[]) =>
      values.reduce((sum, value) => sum + value, 0) / values.length;
    const variance = (values: number[]) =>
      average(values.map((value) => (value - 0.5) ** 2));
    const means = uniformSampleMeans(32, 8000, 1234);
    expect(average(means)).toBeCloseTo(0.5, 2);
    expect(variance(samples) / variance(means)).toBeGreaterThan(25);
    expect(variance(samples) / variance(means)).toBeLessThan(40);
  });
});

it("keeps TeX braces separate from translated argument placeholders", () => {
  const errors: unknown[] = [];
  const recursion = demoRecord("recursion-stack"),
    sampling = demoRecord("central-limit");
  const t = createTranslator({
    locale: recursion.locale,
    messages: recursion.messages,
    onError: (error) => errors.push(error),
  });
  expect(t("calling", { n: 4 })).toContain("factorial(4)");
  expect(t("calling", { n: 4 })).not.toContain("{n}");
  expect(t("returning", { n: 4, value: 24 })).toContain("24");
  const samplingT = createTranslator({
    locale: sampling.locale,
    messages: sampling.messages,
    onError: (error) => errors.push(error),
  });
  expect(samplingT("standardResult", { n: 32 })).toContain("\\sqrt{12n}");
  expect(errors).toEqual([]);
});

it("keeps server-rendered exploration controls disabled until hydration", () => {
  const html = renderToStaticMarkup(
    createElement(RecursionStackDemo, demoRecord("recursion-stack")),
  );
  expect(html).toContain('<fieldset class="demo-controls" disabled="">');
  expect(html).toContain('aria-disabled="true"');
});

it("disables bit controls rendered outside the control footer until hydration", () => {
  const html = renderToStaticMarkup(
    createElement(SignedIntegerDemo, demoRecord("signed-integer")),
  );
  const tree = fromHtml(html, { fragment: true });
  let bits = 0;
  visit(tree, "element", (node) => {
    if (
      node.tagName === "button" &&
      String(node.properties.className).includes("demo-bit-button")
    ) {
      bits++;
      expect(node.properties.disabled).toBe(true);
    }
  });
  expect(bits).toBe(8);
});
