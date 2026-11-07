import type { MarkdownValue } from "@/lib/markdown/types";
import type { ReferenceLocation } from "./types";

export const DEFAULT_PROBLEM_SET_ID = "default";

export interface ImageRegionData {
  src: string;
  alt: string;
  x: number;
  y: number;
  width: number;
  height: number;
  displayWidth: string;
}
export type AnswerValue = string | string[];
export interface AnswerRule {
  values: string[];
  tolerance: number;
  ignoreCase: boolean;
}
export interface ResponseInput {
  id: string;
  type: "text" | "number" | "single" | "multiple";
  placeholder?: string;
  options: {
    id: string;
    label: MarkdownValue;
    markdown: string;
    text: string;
    html: string;
  }[];
  rule?: AnswerRule;
}
export interface AuthoredAnswer {
  id: string;
  kind: "work" | "reference";
  html: string;
  markdown: string;
  text: string;
  anchor?: string;
}
export interface QuestionData {
  id: string;
  target: string;
  anchor: string;
  number?: string;
  leadingPage?: string;
  html: string;
  markdown: string;
  text: string;
  discussion: MarkdownValue;
  inputs: ResponseInput[];
  answers: AuthoredAnswer[];
  parts: QuestionData[];
  revision: string;
}
export interface ProblemHeading {
  id: string;
  title: MarkdownValue;
  depth: number;
  html: string;
}
export type ProblemBlock =
  | {
      type: "questions";
      ids: string[];
      ordered?: boolean;
      sourceId?: string;
    }
  | { type: "heading"; heading: ProblemHeading }
  | { type: "content"; html: string };
export interface ProblemSetData {
  heading?: ProblemHeading;
  blocks: ProblemBlock[];
  markdown: string;
  text: string;
  html: string;
  discussion: MarkdownValue;
  id: string;
  source: MarkdownValue;
  ordered: boolean;
  questions: QuestionData[];
}
export type ClientAuthoredAnswer = Omit<AuthoredAnswer, "markdown">;
export interface ClientQuestionData {
  id: string;
  target: string;
  anchor: string;
  number?: string;
  leadingPage?: string;
  html: string;
  inputs: ResponseInput[];
  answers: ClientAuthoredAnswer[];
  parts: ClientQuestionData[];
  revision: string;
}
export interface ClientProblemSetData {
  id: string;
  ordered: boolean;
  heading?: ProblemHeading;
  blocks: ProblemBlock[];
  questions: ClientQuestionData[];
}
export interface DiscussionPayload {
  version: 2;
  source: string;
  references: string;
}
export interface QuestionResource {
  version: 2;
  problemSets: ProblemSetData[];
}
export interface QuestionContext {
  title: string;
  href: string;
  markdownUrl: string;
  privateContent: boolean;
  storageKey: string;
  sections?: {
    id: string;
    title: string;
    markdownUrl: string;
    slot?: string;
    references?: ReferenceLocation[];
  }[];
}
export type Evaluation = "correct" | "incorrect" | "ungraded" | "unanswered";
/** Replaceable assessment boundary; no BYOK credentials, providers or network transport. */
export interface Evaluator {
  evaluate(
    input: ResponseInput,
    answer: AnswerValue | undefined,
  ): Evaluation | Promise<Evaluation>;
}
