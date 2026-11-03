"use client";
import { MarkdownText } from "@/components/markdown-text";
import {
  createContext,
  memo,
  useContext,
  useEffect,
  useId,
  type CSSProperties,
} from "react";
import { useTranslations } from "next-intl";
import type {
  ClientProblemSetData,
  ClientQuestionData,
  QuestionContext,
  ResponseInput,
} from "@/lib/content/learning-types";
import { DEFAULT_PROBLEM_SET_ID } from "@/lib/content/learning-types";
import { flattenQuestionTree } from "@/lib/content/learning-client";
import {
  problemSetMarkdownUrl,
  questionMarkdownUrl,
  questionResourceUrl,
} from "@/lib/content/learning-routes";
import { evaluateAnswer } from "@/lib/content/evaluation";
import { ContentActions } from "../content-actions";
import { SectionHeading } from "../section-heading";
import { OriginalNumber } from "./original-number";
import { AnswerDisclosure } from "./answer-disclosure";
import { RichContent } from "../rich-content";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Textarea } from "../ui/textarea";
import { useAnswerDrafts } from "./use-answer-drafts";
import { copyBlankSelection } from "./blank-copy";

type DraftState = ReturnType<typeof useAnswerDrafts>;
const Answers = createContext<DraftState | null>(null);
function useAnswers() {
  const value = useContext(Answers);
  if (!value) throw new Error("Question outside its answer provider");
  return value;
}
function isGradeableInput(input: ResponseInput) {
  return Boolean(input.rule);
}
function AnswerFeedback({
  question,
  input,
  inline = false,
}: {
  question: ClientQuestionData;
  input: ResponseInput;
  inline?: boolean;
}) {
  const t = useTranslations();
  const { drafts } = useAnswers();
  const draft = drafts[question.target];
  if (!draft?.checked) return null;
  const result = evaluateAnswer(input, draft.answers[input.id]);
  return (
    <span
      className={
        inline ? "question-inline-feedback" : "question-input-feedback"
      }
      role="status"
    >
      <span className={`answer-feedback answer-${result}`}>
        {t(`learning.${result}`)}
      </span>
    </span>
  );
}
function Blank({
  question,
  input,
}: {
  question: ClientQuestionData;
  input: ResponseInput;
}) {
  const t = useTranslations();
  const { drafts, ready, answer } = useAnswers();
  const value = drafts[question.target]?.answers[input.id];
  return (
    <span className="question-inline-answer">
      <Input
        aria-label={t("learning.inputLabel", {
          number: question.number ?? question.id,
          input: input.id,
        })}
        className="question-inline-input"
        disabled={!ready}
        inputMode={input.type === "number" ? "decimal" : "text"}
        value={typeof value === "string" ? value : ""}
        onChange={(event) => answer(question, input.id, event.target.value)}
      />
      <AnswerFeedback question={question} input={input} inline />
    </span>
  );
}
function Choices({
  question,
  input,
}: {
  question: ClientQuestionData;
  input: ResponseInput;
}) {
  const t = useTranslations();
  const { drafts, ready, answer } = useAnswers();
  const value = drafts[question.target]?.answers[input.id];
  const base = useId();
  if (input.type === "single")
    return (
      <div className="question-choice-answer">
        <fieldset className="question-choice-fieldset">
          <legend className="sr-only">{t("learning.choose")}</legend>
          <RadioGroup
            className="question-choices"
            value={typeof value === "string" ? value : ""}
            disabled={!ready}
            onValueChange={(selected) => answer(question, input.id, selected)}
            aria-label={t("learning.inputLabel", {
              number: question.number ?? question.id,
              input: input.id,
            })}
          >
            {input.options.map((option) => (
              <label
                className="question-choice"
                htmlFor={`${base}-${option.id}`}
                key={option.id}
              >
                <RadioGroupItem id={`${base}-${option.id}`} value={option.id} />
                <span className="question-choice-label">
                  <MarkdownText value={option.label} />
                </span>
                <div className="question-choice-content">
                  <RichContent html={option.html} />
                </div>
              </label>
            ))}
          </RadioGroup>
        </fieldset>
        <AnswerFeedback question={question} input={input} />
      </div>
    );
  const values = Array.isArray(value) ? value : [];
  return (
    <div className="question-choice-answer">
      <fieldset className="question-choice-fieldset">
        <legend className="sr-only">
          {t("learning.inputLabel", {
            number: question.number ?? question.id,
            input: input.id,
          })}
        </legend>
        <div className="question-choices">
          {input.options.map((option) => (
            <label
              className="question-choice"
              htmlFor={`${base}-${option.id}`}
              key={option.id}
            >
              <Checkbox
                id={`${base}-${option.id}`}
                checked={values.includes(option.id)}
                disabled={!ready}
                onCheckedChange={(checked) =>
                  answer(
                    question,
                    input.id,
                    checked === true
                      ? [...new Set([...values, option.id])]
                      : values.filter((item) => item !== option.id),
                  )
                }
              />
              <span className="question-choice-label">
                <MarkdownText value={option.label} />
              </span>
              <div className="question-choice-content">
                <RichContent html={option.html} />
              </div>
            </label>
          ))}
        </div>
      </fieldset>
      <AnswerFeedback question={question} input={input} />
    </div>
  );
}
/* Typing updates the draft context; keeping the stem render stable stops the inputs from remounting. */
const QuestionStem = memo(function QuestionStem({
  question,
}: {
  question: ClientQuestionData;
}) {
  return (
    <div className="question-stem prose prose-neutral dark:prose-invert">
      <RichContent
        html={question.html}
        renderBlank={(id) => {
          const input = question.inputs.find((item) => item.id === id);
          return input ? <Blank question={question} input={input} /> : null;
        }}
      />
    </div>
  );
});
function Question({
  question,
  context,
  part = false,
  actionOwner = "self",
  ordinal,
}: {
  question: ClientQuestionData;
  context: QuestionContext;
  part?: boolean;
  actionOwner?: "self" | "parent";
  ordinal?: number;
}) {
  const t = useTranslations();
  const state = useAnswers();
  const draft = state.drafts[question.target];
  const blankIds = new Set(
    [...question.html.matchAll(/data-learning-blank="([^"]+)"/g)].map(
      (match) => match[1],
    ),
  );
  const free = question.inputs.filter(
    (input) =>
      input.type !== "single" &&
      input.type !== "multiple" &&
      !blankIds.has(input.id),
  );
  const family = flattenQuestionTree([question]);
  const current = family
    .flatMap((member) =>
      member.inputs.flatMap((input) => {
        const value = state.drafts[member.target]?.answers[input.id];
        if (
          value === undefined ||
          value === "" ||
          (Array.isArray(value) && !value.length)
        )
          return [];
        return [
          `${member.target}/${input.id}: ${Array.isArray(value) ? value.join(", ") : value}`,
        ];
      }),
    )
    .join("\n");
  const displayNumber =
    question.number ?? (ordinal !== undefined ? String(ordinal) : question.id);
  const multiPart = question.parts.length > 1;
  const controlScope = multiPart ? [question] : family;
  const hasClearableInputs = controlScope.some(
    (member) => member.inputs.length > 0,
  );
  const hasGradeableInputs = controlScope.some((member) =>
    member.inputs.some((input) => isGradeableInput(input)),
  );
  const shareScope = part ? "part" : multiPart ? "questionGroup" : "question";
  const shareTitle = part
    ? t("learning.partTitle", {
        title: context.title,
        number: displayNumber,
      })
    : multiPart
      ? t("learning.questionGroupTitle", {
          title: context.title,
          number: displayNumber,
        })
      : t("learning.questionTitle", {
          title: context.title,
          number: displayNumber,
        });
  const check = multiPart ? state.checkSelf : state.check;
  const clear = multiPart ? state.clearSelf : state.clear;
  const questionUrl = `${context.href}#${question.anchor}`;
  const shareActions =
    actionOwner === "self" ? (
      <ContentActions
        compact
        scope={shareScope}
        title={shareTitle}
        href={questionUrl}
        markdownUrl={questionMarkdownUrl(context.href, question.target)}
        privateContent={context.privateContent}
        resourceContext={{
          answer: t("learning.currentAnswer", { answer: current }),
          hasReferences: family.some((member) =>
            member.answers.some((answer) => answer.kind === "reference"),
          ),
          resourceUrl: questionResourceUrl(context.href),
          selector: { type: "question", target: question.target },
        }}
      />
    ) : null;
  return (
    <li
      id={question.anchor}
      className={part ? "question-part" : "question-item"}
      value={ordinal}
      data-question-target={question.target}
      data-original-number={question.number}
    >
      {question.number ? (
        <div className="question-heading">
          <OriginalNumber value={question.number} />
          {shareActions && (
            <div className="question-share-actions">{shareActions}</div>
          )}
        </div>
      ) : shareActions ? (
        <div className="question-share-actions question-share-float">
          {shareActions}
        </div>
      ) : null}
      {question.leadingPage ? (
        <span className="source-page">
          {t("learning.page", { page: question.leadingPage })}
        </span>
      ) : null}
      <QuestionStem question={question} />
      {question.inputs
        .filter((input) => input.type === "single" || input.type === "multiple")
        .map((input) => (
          <Choices key={input.id} question={question} input={input} />
        ))}
      {free.map((input) => (
        <div className="question-free-answer" key={input.id}>
          <label className="question-free-answer-label">
            <span>{t("learning.tryAnswer")}</span>
            <Textarea
              disabled={!state.ready}
              aria-label={t("learning.inputLabel", {
                number: displayNumber,
                input: input.id,
              })}
              placeholder={t("learning.freeAnswer")}
              value={
                typeof draft?.answers[input.id] === "string"
                  ? (draft.answers[input.id] as string)
                  : ""
              }
              onChange={(event) =>
                state.answer(question, input.id, event.target.value)
              }
            />
          </label>
          <AnswerFeedback question={question} input={input} />
        </div>
      ))}
      {question.parts.length > 0 && (
        <ol className="question-parts">
          {question.parts.map((child, index) => (
            <Question
              key={child.id}
              question={child}
              context={context}
              ordinal={index + 1}
              part
              actionOwner={
                actionOwner === "parent" || question.parts.length === 1
                  ? "parent"
                  : "self"
              }
            />
          ))}
        </ol>
      )}
      {actionOwner === "self" && hasClearableInputs ? (
        <div className="question-toolbar">
          {hasGradeableInputs ? (
            <Button
              type="button"
              size="xs"
              variant="outline"
              disabled={!state.ready}
              onClick={() => check(question)}
            >
              {t(part ? "learning.checkPart" : "learning.check")}
            </Button>
          ) : null}
          <Button
            type="button"
            size="xs"
            variant="ghost"
            disabled={!state.ready}
            onClick={() => clear(question)}
          >
            {t(part ? "learning.clearPart" : "learning.clearQuestion")}
          </Button>
        </div>
      ) : null}
      {question.answers.map((answer) =>
        answer.anchor ? (
          <a
            className="question-work-link"
            href={`#${answer.anchor}`}
            key={answer.id}
          >
            {t("learning.viewWork")}
          </a>
        ) : (
          <AnswerDisclosure key={answer.id} kind={answer.kind}>
            <RichContent html={answer.html} />
          </AnswerDisclosure>
        ),
      )}
    </li>
  );
}
export function ProblemSet({
  set,
  context,
  defaultBlockId,
}: {
  set: ClientProblemSetData;
  context: QuestionContext;
  defaultBlockId?: string;
}) {
  const t = useTranslations();
  const placeholder = t("learning.blankPlaceholder");
  const state = useAnswerDrafts(context.storageKey, set.questions);
  const isDefaultSet = set.id === DEFAULT_PROBLEM_SET_ID;
  const blocks = isDefaultSet
    ? set.blocks.filter(
        (block) =>
          block.type === "questions" && block.sourceId === defaultBlockId,
      )
    : set.blocks;
  useEffect(() => {
    /* Listen on the document because copying can start outside the selected question. */
    const copy = (event: ClipboardEvent) =>
      copyBlankSelection(event, placeholder);
    document.addEventListener("copy", copy);
    return () => document.removeEventListener("copy", copy);
  }, [placeholder]);
  if (isDefaultSet && (!defaultBlockId || blocks.length !== 1))
    throw new Error(`Missing default question block: ${defaultBlockId ?? ""}`);
  if (!isDefaultSet && defaultBlockId)
    throw new Error("A source question block must use the default set");
  let total = 0,
    correct = 0;
  for (const question of flattenQuestionTree(set.questions))
    for (const input of question.inputs)
      if (isGradeableInput(input)) {
        total++;
        const draft = state.drafts[question.target];
        if (
          draft?.checked &&
          evaluateAnswer(input, draft.answers[input.id]) === "correct"
        )
          correct++;
      }
  return (
    <Answers value={state}>
      <section
        className="problem-set"
        id={isDefaultSet || set.heading?.id === set.id ? undefined : set.id}
        data-problem-set={isDefaultSet ? undefined : set.id}
        aria-busy={!state.ready}
      >
        {!isDefaultSet && set.heading ? (
          <SectionHeading
            className="problem-set-header"
            scope="set"
            heading={set.heading}
            context={context}
            markdownUrl={problemSetMarkdownUrl(context.href, set.id)}
            resourceContext={{
              answer: t("learning.currentAnswer", {
                answer: flattenQuestionTree(set.questions)
                  .flatMap((question) =>
                    question.inputs.flatMap((input) => {
                      const value =
                        state.drafts[question.target]?.answers[input.id];
                      return value === undefined
                        ? []
                        : [
                            `${question.target}/${input.id}: ${Array.isArray(value) ? value.join(", ") : value}`,
                          ];
                    }),
                  )
                  .join("\n"),
              }),
              hasReferences: flattenQuestionTree(set.questions).some(
                (question) =>
                  question.answers.some(
                    (answer) => answer.kind === "reference",
                  ),
              ),
              resourceUrl: questionResourceUrl(context.href),
              selector: { type: "set", id: set.id },
            }}
          />
        ) : null}
        {blocks.map((block, blockIndex) => {
          if (block.type === "heading")
            return (
              <SectionHeading
                key={block.heading.id}
                heading={block.heading}
                context={context}
              />
            );
          if (block.type === "content")
            return (
              <div
                className="prose prose-neutral dark:prose-invert max-w-none"
                key={blockIndex}
              >
                <RichContent html={block.html} />
              </div>
            );
          const List = (block.ordered ?? set.ordered) ? "ol" : "ul";
          return (
            <List
              key={blockIndex}
              className="question-list"
              style={
                {
                  "--question-marker-size": `${String(set.questions.length).length + 2}ch`,
                } as CSSProperties
              }
            >
              {block.ids.map((id) => {
                const index = set.questions.findIndex(
                  (question) => question.id === id,
                );
                const question = set.questions[index]!;
                return (
                  <Question
                    key={id}
                    question={question}
                    context={context}
                    ordinal={index + 1}
                  />
                );
              })}
            </List>
          );
        })}
        {!isDefaultSet ? (
          <footer className="problem-set-footer">
            <div className="problem-set-footer-info">
              {total > 0 && (
                <span className="problem-set-score">
                  {t("learning.summary", { correct, total })}
                </span>
              )}
              <p className="problem-set-save" role="status">
                {state.ready
                  ? t(
                      state.available
                        ? "learning.saved"
                        : "learning.storageUnavailable",
                    )
                  : null}
              </p>
            </div>
            <div className="problem-set-footer-actions">
              {total > 0 ? (
                <Button
                  type="button"
                  size="xs"
                  variant="outline"
                  disabled={!state.ready}
                  onClick={() => state.checkAll()}
                >
                  {t("learning.checkSet")}
                </Button>
              ) : null}
              <Button
                type="button"
                size="xs"
                variant="ghost"
                disabled={!state.ready}
                onClick={() => state.clear()}
              >
                {t("learning.clearSet")}
              </Button>
            </div>
          </footer>
        ) : null}
      </section>
    </Answers>
  );
}
