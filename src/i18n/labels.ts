import { createUiTranslator, type UiTranslator } from "./translate";
import type { ContentKind, TaskType } from "@/lib/content/types";
export function getLabels(t: UiTranslator = createUiTranslator()) {
  const kindLabels: Record<ContentKind, string> = {
    knowledge: t("kinds.knowledge"),
    "course-note": t("kinds.course-note"),
    task: t("kinds.task"),
    article: t("kinds.article"),
  };
  const taskLabels: Record<TaskType, string> = {
    exercise: t("taskTypes.exercise"),
    exam: t("taskTypes.exam"),
    quiz: t("taskTypes.quiz"),
    assignment: t("taskTypes.assignment"),
  };
  return { kindLabels, taskLabels };
}
