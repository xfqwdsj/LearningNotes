import type {
  AnswerValue,
  Evaluation,
  Evaluator,
  ResponseInput,
} from "./learning-types";
const numberPattern = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;
function normalize(value: string, ignoreCase: boolean): string {
  const text = value.trim().normalize("NFC");
  return ignoreCase ? text.toLowerCase() : text;
}
export function evaluateAnswer(
  input: ResponseInput,
  answer: AnswerValue | undefined,
): Evaluation {
  if (!input.rule) return "ungraded";
  if (
    answer === undefined ||
    (typeof answer === "string" ? !answer.trim() : !answer.length)
  )
    return "unanswered";
  const values = input.rule.values;
  if (input.type === "multiple") {
    if (!Array.isArray(answer)) return "incorrect";
    const actual = new Set(answer);
    const expected = new Set(values);
    return actual.size === expected.size &&
      [...expected].every((v) => actual.has(v))
      ? "correct"
      : "incorrect";
  }
  if (typeof answer !== "string") return "incorrect";
  if (input.type === "single")
    return values.includes(answer) ? "correct" : "incorrect";
  if (input.type === "number") {
    const raw = answer.trim();
    if (!numberPattern.test(raw)) return "incorrect";
    const actual = Number(raw);
    if (!Number.isFinite(actual)) return "incorrect";
    return values.some((value) => {
      const expected = Number(value);
      const difference = Math.abs(actual - expected);
      const roundoff =
        Number.EPSILON * Math.max(1, Math.abs(actual), Math.abs(expected)) * 4;
      return (
        difference <=
        input.rule!.tolerance + (input.rule!.tolerance ? roundoff : 0)
      );
    })
      ? "correct"
      : "incorrect";
  }
  return values.some(
    (value) =>
      normalize(value, input.rule!.ignoreCase) ===
      normalize(answer, input.rule!.ignoreCase),
  )
    ? "correct"
    : "incorrect";
}
export const ruleEvaluator: Evaluator = { evaluate: evaluateAnswer };
