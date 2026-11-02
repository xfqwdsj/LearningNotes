import { useEffect, useState } from "react";
import type {
  AnswerValue,
  ClientQuestionData,
} from "@/lib/content/learning-types";
import { flattenQuestionTree } from "@/lib/content/learning-client";
export interface Draft {
  revision: string;
  answers: Record<string, AnswerValue>;
  checked: boolean;
}
const memory = new Map<string, Draft>();
function readDraft(
  value: unknown,
  question: ClientQuestionData,
): Draft | undefined {
  if (
    !value ||
    typeof value !== "object" ||
    !("revision" in value) ||
    typeof value.revision !== "string" ||
    value.revision !== question.revision ||
    !("answers" in value) ||
    !value.answers ||
    typeof value.answers !== "object" ||
    Array.isArray(value.answers) ||
    !("checked" in value) ||
    typeof value.checked !== "boolean" ||
    Object.keys(value).some(
      (key) => !["revision", "answers", "checked"].includes(key),
    )
  )
    return undefined;
  const answers: Record<string, AnswerValue> = {};
  const inputIds = new Set(question.inputs.map((input) => input.id));
  for (const [input, answer] of Object.entries(
    value.answers as Record<string, unknown>,
  )) {
    if (!inputIds.has(input)) return undefined;
    if (
      typeof answer === "string" ||
      (Array.isArray(answer) &&
        answer.every((item) => typeof item === "string"))
    )
      answers[input] = answer;
    else return undefined;
  }
  return {
    revision: value.revision,
    answers,
    checked: value.checked,
  };
}
export function useAnswerDrafts(
  storageKey: string,
  questions: ClientQuestionData[],
) {
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [ready, setReady] = useState(false);
  const [available, setAvailable] = useState(true);
  const all = flattenQuestionTree(questions);
  useEffect(() => {
    let alive = true;
    const load = () => {
      const loaded: Record<string, Draft> = {};
      let storageAvailable = true;
      for (const question of flattenQuestionTree(questions)) {
        const key = `learning:answers:v1:${storageKey}:${question.target}`;
        let candidate: unknown = memory.get(key);
        try {
          const raw = localStorage.getItem(key);
          if (raw) candidate = JSON.parse(raw) as unknown;
        } catch {
          storageAvailable = false;
        }
        const draft = readDraft(candidate, question);
        if (draft) loaded[question.target] = draft;
      }
      if (alive) {
        setDrafts(loaded);
        setReady(true);
        setAvailable(storageAvailable);
      }
    };
    queueMicrotask(load);
    const onStorage = (event: StorageEvent) => {
      if (
        !event.key ||
        event.key.startsWith(`learning:answers:v1:${storageKey}:`)
      )
        load();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      alive = false;
      window.removeEventListener("storage", onStorage);
    };
  }, [storageKey, questions]);
  const write = (question: ClientQuestionData, draft: Draft) => {
    const key = `learning:answers:v1:${storageKey}:${question.target}`;
    memory.set(key, draft);
    setDrafts((current) => ({ ...current, [question.target]: draft }));
    try {
      localStorage.setItem(key, JSON.stringify(draft));
    } catch {
      setAvailable(false);
    }
  };
  const answer = (
    question: ClientQuestionData,
    input: string,
    value: AnswerValue,
  ) =>
    write(question, {
      revision: question.revision,
      answers: { ...drafts[question.target]?.answers, [input]: value },
      checked: false,
    });
  const checkSelf = (question: ClientQuestionData) => {
    if (!question.inputs.length) return;
    write(question, {
      revision: question.revision,
      answers: drafts[question.target]?.answers ?? {},
      checked: true,
    });
  };
  const check = (question: ClientQuestionData) => {
    for (const member of flattenQuestionTree([question])) checkSelf(member);
  };
  const checkAll = () => {
    for (const question of all) checkSelf(question);
  };
  const clearTargets = (targets: ClientQuestionData[]) => {
    const ids = new Set(targets.map((item) => item.target));
    setDrafts((current) =>
      Object.fromEntries(
        Object.entries(current).filter(([target]) => !ids.has(target)),
      ),
    );
    for (const item of targets) {
      const key = `learning:answers:v1:${storageKey}:${item.target}`;
      memory.delete(key);
      try {
        localStorage.removeItem(key);
      } catch {
        setAvailable(false);
      }
    }
  };
  const clearSelf = (question: ClientQuestionData) => clearTargets([question]);
  const clear = (question?: ClientQuestionData) =>
    clearTargets(
      question ? [question, ...flattenQuestionTree(question.parts)] : all,
    );
  return {
    drafts,
    ready,
    available,
    answer,
    check,
    checkSelf,
    checkAll,
    clear,
    clearSelf,
  };
}
