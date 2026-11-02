export function sliceIndices(
  length: number,
  start: number,
  stop: number,
  step: number,
): number[] {
  if (
    ![length, start, stop, step].every(Number.isInteger) ||
    length < 0 ||
    step === 0
  )
    throw new RangeError("Invalid slice");
  const lower = step > 0 ? 0 : -1,
    upper = step > 0 ? length : length - 1;
  const normalize = (value: number) =>
    Math.max(lower, Math.min(upper, value < 0 ? value + length : value));
  const result: number[] = [];
  for (
    let index = normalize(start);
    step > 0 ? index < normalize(stop) : index > normalize(stop);
    index += step
  )
    result.push(index);
  return result;
}
export const signedByte = (value: number) =>
  value >= 128 ? value - 256 : value;
export function bayesPosterior(
  prior: number,
  positiveGivenA: number,
  positiveGivenOther: number,
) {
  const numerator = prior * positiveGivenA;
  const denominator = numerator + (1 - prior) * positiveGivenOther;
  return denominator === 0 ? null : numerator / denominator;
}
export const directionalSlope = (degrees: number) => {
  const radians = (degrees * Math.PI) / 180;
  const result = 2 * Math.cos(radians) + 2 * Math.sin(radians);
  return Math.abs(result) < 1e-10 ? 0 : result;
};

export interface FactorialFrame {
  argument: number;
}
export interface FactorialStep {
  kind: "call" | "return";
  argument: number;
  value: number;
  stack: FactorialFrame[];
}
export function factorialTrace(n: number): FactorialStep[] {
  if (!Number.isInteger(n) || n < 0 || n > 6)
    throw new RangeError("Invalid factorial input");
  const steps: FactorialStep[] = [],
    stack: FactorialFrame[] = [];
  for (let argument = n; argument >= 0; argument--) {
    stack.push({ argument });
    steps.push({ kind: "call", argument, value: 1, stack: [...stack] });
  }
  let value = 1;
  for (let argument = 0; argument <= n; argument++) {
    value *= Math.max(1, argument);
    stack.pop();
    steps.push({ kind: "return", argument, value, stack: [...stack] });
  }
  return steps;
}
export function crossProductZ(a: number, b: number, angle: number) {
  const value = a * b * Math.sin((angle * Math.PI) / 180);
  return Math.abs(value) < 1e-10 ? 0 : value;
}
export function uniformSampleMeans(
  n: number,
  count: number,
  seed: number,
): number[] {
  if (!Number.isInteger(n) || n < 1 || !Number.isInteger(count) || count < 1)
    throw new RangeError("Invalid sample size");
  let state = seed >>> 0 || 1;
  const random = () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
  return Array.from({ length: count }, () => {
    let sum = 0;
    for (let index = 0; index < n; index++) sum += random();
    return sum / n;
  });
}
