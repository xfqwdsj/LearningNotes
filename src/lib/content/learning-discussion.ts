import type {
  DiscussionPayload,
  ProblemSetData,
  QuestionData,
  QuestionResource,
} from "./learning-types";
import { flattenQuestionTree } from "./learning-client";

function references(questions: QuestionData[]): string {
  return questions
    .flatMap((question) =>
      question.answers
        .filter((answer) => answer.kind === "reference")
        .map((answer) => `${question.target}\n\n${answer.markdown}`),
    )
    .join("\n\n");
}

export function questionDiscussion(question: QuestionData): DiscussionPayload {
  const family = flattenQuestionTree([question]);
  const nestedWork = family
    .slice(1)
    .flatMap((member) =>
      member.answers
        .filter((answer) => answer.kind === "work" && answer.anchor)
        .map((answer) => `${member.target}\n\n${answer.markdown}`),
    )
    .join("\n\n");
  return {
    version: 2,
    source: [question.discussion.markdown, nestedWork]
      .filter(Boolean)
      .join("\n\n"),
    references: references(family),
  };
}

export function problemSetDiscussion(set: ProblemSetData): DiscussionPayload {
  return {
    version: 2,
    source: set.discussion.markdown,
    references: references(flattenQuestionTree(set.questions)),
  };
}

export function findProblemSet(
  resource: QuestionResource,
  id: string,
): ProblemSetData | undefined {
  return resource.problemSets.find((set) => set.id === id);
}

export function findQuestion(
  resource: QuestionResource,
  target: string,
): QuestionData | undefined {
  return flattenQuestionTree(
    resource.problemSets.flatMap((set) => set.questions),
  ).find((question) => question.target === target);
}
