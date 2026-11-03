import type {
  ClientProblemSetData,
  ClientQuestionData,
  ProblemSetData,
  QuestionData,
} from "./learning-types";

function clientQuestion(question: QuestionData): ClientQuestionData {
  return {
    id: question.id,
    target: question.target,
    anchor: question.anchor,
    ...(question.number ? { number: question.number } : {}),
    ...(question.leadingPage ? { leadingPage: question.leadingPage } : {}),
    html: question.html,
    inputs: question.inputs,
    answers: question.answers.map((answer) => ({
      id: answer.id,
      kind: answer.kind,
      html: answer.html,
      text: answer.text,
      ...(answer.anchor ? { anchor: answer.anchor } : {}),
    })),
    parts: question.parts.map(clientQuestion),
    revision: question.revision,
  };
}

/** Keep source/export strings on the server; the interactive view only needs render data. */
export function clientProblemSet(set: ProblemSetData): ClientProblemSetData {
  return {
    id: set.id,
    ordered: set.ordered,
    ...(set.heading ? { heading: set.heading } : {}),
    blocks: set.blocks,
    questions: set.questions.map(clientQuestion),
  };
}

export function flattenQuestionTree<T extends { parts: T[] }>(
  questions: T[],
): T[] {
  return questions.flatMap((question) => [
    question,
    ...flattenQuestionTree(question.parts),
  ]);
}
