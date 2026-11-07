import {
  renderMarkdownValue,
  renderMarkdownSource,
  markdownPlainText,
} from "@/lib/markdown/render";
import type { MarkdownFragment } from "@/lib/markdown/types";
import { plainValue } from "@/lib/markdown/types";
import { createHash } from "node:crypto";
import type { Root, RootContent, List, ListItem } from "mdast";
import type { ContainerDirective, LeafDirective } from "mdast-util-directive";
import { visit } from "unist-util-visit";
import {
  isDirective,
  imageRegion,
  requirePageNumber,
  type Directive,
} from "./directive-presentation";
import { sourceSections } from "./source-sections";
import { attachProblemSets } from "./problem-sets";
import { requireId } from "./semantic";
import { createExportFragment, stringifyExportedTree } from "./content-export";
import { DEFAULT_PROBLEM_SET_ID } from "./learning-types";
import type {
  ProblemSetData as PreparedProblemSet,
  QuestionData as PreparedQuestion,
  AuthoredAnswer as PreparedAnswer,
  ResponseInput,
} from "./learning-types";

type AuthoredAnswer = Omit<PreparedAnswer, "text"> & { tree: Root };
type QuestionData = Omit<
  PreparedQuestion,
  "text" | "discussion" | "parts" | "answers"
> & {
  discussionMarkdown: string;
  discussionTree: Root;
  markdownTree: Root;
  parts: QuestionData[];
  answers: AuthoredAnswer[];
};
type ProblemSetData = Omit<
  PreparedProblemSet,
  "text" | "html" | "discussion" | "source" | "questions"
> & {
  source: string;
  discussionMarkdown: string;
  discussionTree: Root;
  markdownTree: Root;
  questions: QuestionData[];
};

export interface CompileExercisesOptions {
  sectionsPrepared?: boolean;
}

export async function compileExercises(
  tree: Root,
  render: (tree: Root) => Promise<string>,
  { sectionsPrepared = false }: CompileExercisesOptions = {},
): Promise<PreparedProblemSet[]> {
  attachProblemSets(tree);
  if (!sectionsPrepared) sourceSections(tree);
  const sets: ProblemSetData[] = [];
  const contentBlocks = new Map<
    { type: "content"; html: string },
    RootContent
  >();
  const targets = new Map<string, QuestionData>();
  const resolveQuestionTarget = (target: string) => {
    const exact = targets.get(target);
    if (exact || target.startsWith(`${DEFAULT_PROBLEM_SET_ID}/`)) return exact;
    return targets.get(`${DEFAULT_PROBLEM_SET_ID}/${target}`);
  };
  const definitions: RootContent[] = [];
  visit(tree, "definition", (n) => {
    definitions.push(n);
  });
  const definitionUrls = new Map(
    definitions.flatMap((n) =>
      n.type === "definition"
        ? [[n.identifier.toLowerCase(), n.url] as const]
        : [],
    ),
  );
  const fragment = (nodes: RootContent[]): Root => ({
    type: "root",
    children: [...nodes, ...definitions],
  });
  const exported = (nodes: RootContent[]): MarkdownFragment =>
    createExportFragment(fragment(nodes));
  const markdown = (nodes: RootContent[]) => exported(nodes).markdown;
  let answerCount = 0;
  const embeddedAnswers = new Set<Directive>();
  const linkedMarkdown = new Map<string, MarkdownFragment>();
  async function authored(node: Directive): Promise<AuthoredAnswer> {
    const children = node.children as RootContent[];
    const body = children.filter(
      (n) => !(isDirective(n) && n.name === "correct"),
    );
    const exportedAnswer = exported(children);
    return {
      id: `answer-${++answerCount}`,
      kind: node.name === "work" ? "work" : "reference",
      html: await render(fragment(body)),
      markdown: exportedAnswer.markdown,
      tree: exportedAnswer.tree,
    };
  }
  function marker(item: ListItem, name: string): Directive | undefined {
    const first = item.children[0];
    return first && isDirective(first) && first.name === name
      ? first
      : undefined;
  }
  function applyRules(q: QuestionData, rules: Directive[]) {
    const target = q.target;
    for (const key of rules) {
      const a = key.attributes ?? {};
      if (
        a["option"] &&
        !a["input"] &&
        q.inputs.filter((i) => i.type === "single" || i.type === "multiple")
          .length > 1
      )
        throw new Error(`Answer key requires an explicit input: ${target}`);
      const inputId =
        a["blank"] ??
        a["input"] ??
        (a["option"]
          ? q.inputs.find((i) => i.type === "single" || i.type === "multiple")
              ?.id
          : "response");
      const input = inputId
        ? q.inputs.find((input) => input.id === inputId)
        : undefined;
      if (!input) throw new Error(`Unknown answer input ${target}/${inputId}`);
      const value = a["option"] ?? a["value"];
      if (value === undefined || value === null)
        throw new Error(`Missing answer key: ${target}`);
      if (
        (input.type === "single" || input.type === "multiple") &&
        !input.options.some((o) => o.id === value)
      )
        throw new Error(`Unknown correct option: ${value}`);
      const tolerance = Number(a["tolerance"] ?? 0);
      if (a["ignore-case"] && !["true", "false"].includes(a["ignore-case"]))
        throw new Error(`Invalid text comparison option: ${target}`);
      if (!Number.isFinite(tolerance) || tolerance < 0)
        throw new Error(`Invalid numeric tolerance: ${target}`);
      if (
        input.type === "number" &&
        (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(value) ||
          !Number.isFinite(Number(value)))
      )
        throw new Error(`Invalid numeric answer: ${value}`);
      input.rule ??= {
        values: [],
        tolerance,
        ignoreCase: a["ignore-case"] === "true",
      };
      if (
        input.rule.tolerance !== tolerance ||
        input.rule.ignoreCase !== (a["ignore-case"] === "true")
      )
        throw new Error(`Inconsistent answer rules: ${target}`);
      input.rule.values.push(value);
    }
    if (
      q.inputs.some(
        (i) => i.type === "single" && (i.rule?.values.length ?? 0) > 1,
      )
    )
      throw new Error(`Single choice has multiple answer keys: ${target}`);
  }
  async function question(
    item: ListItem,
    parent: string,
    part = false,
  ): Promise<QuestionData> {
    const metadata = marker(item, part ? "part" : "question");
    if (!metadata)
      throw new Error(
        `A ${part ? "part" : "question"} list item requires explicit metadata in ${parent}`,
      );
    const id = requireId(
      metadata.attributes?.["id"],
      part ? "part" : "question",
    );
    const target = `${parent}/${id}`;
    if (targets.has(target)) throw new Error(`Duplicate question: ${target}`);
    const number = metadata.attributes?.["number"] ?? undefined;
    const q: QuestionData = {
      id,
      target,
      anchor: `question-${target.replaceAll("/", "--")}`,
      ...(number ? { number } : {}),
      html: "",
      markdown: "",
      discussionMarkdown: "",
      discussionTree: { type: "root", children: [] },
      markdownTree: { type: "root", children: [] },
      inputs: [],
      answers: [],
      parts: [],
      revision: "",
    };
    targets.set(target, q);
    const inputMap = new Map<string, ResponseInput>();
    const rules: Directive[] = [];
    const body: RootContent[] = [];
    const raw = item.children.slice(1) as RootContent[];
    const register = (input: ResponseInput) => {
      requireId(input.id, "response");
      if (inputMap.has(input.id))
        throw new Error(`Duplicate input ${target}/${input.id}`);
      inputMap.set(input.id, input);
      q.inputs.push(input);
    };
    async function children(nodes: RootContent[]): Promise<RootContent[]> {
      const output: RootContent[] = [];
      for (const node of nodes) {
        if (
          node.type === "list" &&
          node.children.some((n) => marker(n, "part"))
        ) {
          if (part)
            throw new Error(
              "Only one subquestion level is currently supported",
            );
          for (let i = 0; i < node.children.length; i++)
            q.parts.push(await question(node.children[i]!, target, true));
          continue;
        }
        if (isDirective(node)) {
          const a = node.attributes ?? {};
          if (node.name === "reference" || node.name === "work") {
            if (a["for"] && resolveQuestionTarget(a["for"]) !== q)
              throw new Error(
                `Nested answer target differs from owning question: ${a["for"]}`,
              );
            embeddedAnswers.add(node);
            q.answers.push(await authored(node));
            if (node.name === "reference")
              visit(node, (n) => {
                if (
                  isDirective(n as RootContent) &&
                  (n as Directive).name === "correct"
                )
                  rules.push(n as Directive);
              });
            continue;
          }
          if (node.name === "choices") {
            const inputId = a["id"] ?? "choice";
            if (a["mode"] !== "single" && a["mode"] !== "multiple")
              throw new Error(`Invalid choice mode: ${target}`);
            const list = node.children.find((n) => n.type === "list") as
              List | undefined;
            if (!list)
              throw new Error(`Choices require a Markdown list: ${target}`);
            const options = [];
            for (const option of list.children) {
              const copy = structuredClone(option);
              const paragraph = copy.children[0];
              const label =
                paragraph?.type === "paragraph"
                  ? paragraph.children[0]
                  : undefined;
              if (!label || !isDirective(label) || label.name !== "option")
                throw new Error(
                  `Choice requires an explicit option marker: ${target}`,
                );
              const optionId = requireId(label.attributes?.["id"], "option");

              if (paragraph?.type === "paragraph") paragraph.children.shift();
              const optionTree = fragment(copy.children as RootContent[]);
              options.push({
                id: optionId,
                label: label.children.length
                  ? renderMarkdownValue(
                      exported([
                        { type: "paragraph", children: label.children },
                      ]),
                      { mode: "single-line", linkPolicy: "plain" },
                    )
                  : plainValue(optionId.toUpperCase()),
                markdown: markdown(copy.children as RootContent[]),
                text: markdownPlainText(optionTree),
                html: await render(optionTree),
              });
            }
            if (new Set(options.map((o) => o.id)).size !== options.length)
              throw new Error(`Duplicate option: ${target}`);
            register({ id: inputId, type: a["mode"], options });
            continue;
          }
          if (node.name === "blank") {
            if (a["type"] && a["type"] !== "text" && a["type"] !== "number")
              throw new Error(`Invalid blank type: ${target}`);
            const placeholder = a["placeholder"]?.trim();
            register({
              id: requireId(a["id"], "blank"),
              type: a["type"] === "number" ? "number" : "text",
              ...(placeholder ? { placeholder } : {}),
              options: [],
            });
          }
          if (node.name === "correct")
            throw new Error(
              `Answer keys belong inside reference blocks: ${target}`,
            );
        }
        const copy = structuredClone(node);
        if ("children" in copy && "children" in node)
          copy.children = (await children(
            node.children as RootContent[],
          )) as typeof copy.children;
        output.push(copy);
      }
      return output;
    }
    body.push(...(await children(raw)));
    if (!q.inputs.length && !q.parts.length)
      register({ id: "response", type: "text", options: [] });
    applyRules(q, rules);
    q.html = await render(fragment(body));
    const questionExport = exported([metadata, ...raw]);
    q.markdownTree = questionExport.tree;
    q.markdown = questionExport.markdown;
    const discussion = structuredClone(fragment(raw));
    const omitReference = (nodes: RootContent[]): RootContent[] =>
      nodes.flatMap((node) => {
        if (isDirective(node) && node.name === "reference") return [];
        if ("children" in node)
          node.children = omitReference(
            node.children as RootContent[],
          ) as typeof node.children;
        return [node];
      });
    discussion.children = omitReference(discussion.children);
    const discussionExport = createExportFragment(discussion);
    q.discussionTree = discussionExport.tree;
    q.discussionMarkdown = discussionExport.markdown;
    q.revision = createHash("sha256")
      .update(JSON.stringify({ markdown: q.markdown, inputs: q.inputs }))
      .digest("hex")
      .slice(0, 16);
    return q;
  }
  const containers: ContainerDirective[] = [];
  const defaultGroups: ContainerDirective[] = [];
  visit(tree, (node) => {
    if (node.type === "containerDirective" && node.name === "problems")
      containers.push(node);
    if (node.type === "containerDirective" && node.name === "default-questions")
      defaultGroups.push(node);
    if (node.type === "leafDirective" && node.name === "image-region")
      imageRegion(node, definitionUrls);
  });
  const setIds = new Set<string>();
  for (const node of containers) {
    const id = requireId(node.attributes?.["id"], "problem set");
    if (id === DEFAULT_PROBLEM_SET_ID)
      throw new Error(
        `Problem set ID ${DEFAULT_PROBLEM_SET_ID} is reserved for standalone questions`,
      );
    if (setIds.has(id)) throw new Error(`Duplicate problem set ID: ${id}`);
    setIds.add(id);
    const setExport = exported([node]);
    const set: ProblemSetData = {
      id,
      source: node.attributes?.["source"] ?? "",
      ordered: true,
      questions: [],
      blocks: [],
      markdown: setExport.markdown,
      discussionMarkdown: "",
      discussionTree: { type: "root", children: [] },
      markdownTree: setExport.tree,
    };
    let page: LeafDirective | undefined;
    for (const [childIndex, child] of node.children.entries()) {
      if (child.type === "heading") {
        const heading = {
          id: String(child.data?.hProperties?.id ?? ""),
          title: renderMarkdownValue(
            exported([{ type: "paragraph", children: child.children }]),
            { mode: "single-line", linkPolicy: "plain" },
          ),
          depth: child.depth,
          html: await render(fragment([child])),
        };
        if (childIndex === 0 && !node.data?.["omittedHeading"])
          set.heading = heading;
        else set.blocks.push({ type: "heading", heading });
        continue;
      }
      if (child.type === "leafDirective" && child.name === "page") {
        page = child;
        continue;
      }
      if (
        child.type !== "list" ||
        !child.children.some((item) => marker(item, "question"))
      ) {
        if (child.type !== "definition") {
          const block = { type: "content" as const, html: "" };
          set.blocks.push(block);
          contentBlocks.set(block, child as RootContent);
        }
        continue;
      }
      if (!set.questions.length) set.ordered = child.ordered ?? false;
      if (Boolean(child.ordered) !== set.ordered)
        throw new Error(`Mixed list styles in problem set ${id}`);
      const previous = set.blocks.at(-1);
      const block: { type: "questions"; ids: string[] } =
        previous?.type === "questions"
          ? previous
          : { type: "questions", ids: [] };
      if (previous?.type !== "questions") set.blocks.push(block);
      for (const item of child.children) {
        const q = await question(item, id);
        if (page) {
          q.leadingPage = requirePageNumber(page);
          const pageExport = exported([page]);
          q.markdownTree.children.unshift(...pageExport.tree.children);
          q.discussionTree.children.unshift(...pageExport.tree.children);
          page = undefined;
        }
        set.questions.push(q);
        block.ids.push(q.id);
      }
    }
    if (!set.questions.length) throw new Error(`Empty problem set: ${id}`);
    sets.push(set);
  }
  if (defaultGroups.length) {
    const setExport = exported(defaultGroups);
    const discussionExport = exported(
      defaultGroups.flatMap((group) => group.children as RootContent[]),
    );
    const set: ProblemSetData = {
      id: DEFAULT_PROBLEM_SET_ID,
      source: "",
      ordered: true,
      questions: [],
      blocks: [],
      markdown: setExport.markdown,
      markdownTree: setExport.tree,
      discussionMarkdown: discussionExport.markdown,
      discussionTree: discussionExport.tree,
    };
    const blockIds = new Set<string>();
    for (const group of defaultGroups) {
      const sourceId = requireId(
        group.attributes?.["id"],
        "default question block",
      );
      if (blockIds.has(sourceId))
        throw new Error(`Duplicate default question block: ${sourceId}`);
      blockIds.add(sourceId);
      const list = group.children.find((child) => child.type === "list");
      if (!list || list.type !== "list")
        throw new Error(
          `Default question block has no question list: ${sourceId}`,
        );
      if (!list.children.length)
        throw new Error(`Default question block is empty: ${sourceId}`);
      const block: {
        type: "questions";
        ids: string[];
        ordered: boolean;
        sourceId: string;
      } = {
        type: "questions",
        ids: [],
        ordered: list.ordered ?? false,
        sourceId,
      };
      set.blocks.push(block);
      for (const item of list.children) {
        const questionData = await question(item, DEFAULT_PROBLEM_SET_ID);
        set.questions.push(questionData);
        block.ids.push(questionData.id);
      }
    }
    sets.push(set);
  }
  // External authored answers remain in their original section, with an explicit link from the question.
  const external: Directive[] = [];
  visit(tree, (node) => {
    if (
      isDirective(node as RootContent) &&
      ["work", "reference"].includes((node as Directive).name) &&
      (node as Directive).attributes?.["for"]
    )
      external.push(node as Directive);
  });
  for (const node of external) {
    const target = node.attributes?.["for"];
    const q = target ? resolveQuestionTarget(target) : undefined;
    if (!q) throw new Error(`Unknown authored answer target: ${target}`);
    if (embeddedAnswers.has(node)) continue;
    const answer = await authored(node);
    node.attributes = { ...node.attributes, id: answer.id };
    q.answers.push({ ...answer, anchor: answer.id });
    const exportedAnswer = exported([node]);
    linkedMarkdown.set(answer.id, exportedAnswer);
    q.markdownTree.children.push(...exportedAnswer.tree.children);
    if (answer.kind === "work")
      q.discussionTree.children.push(...answer.tree.children);
    if (answer.kind === "reference") {
      const keys: Directive[] = [];
      visit(node, (n) => {
        if (
          isDirective(n as RootContent) &&
          (n as Directive).name === "correct"
        )
          keys.push(n as Directive);
      });
      applyRules(q, keys);
    }
  }
  for (const q of targets.values()) {
    const linkedAnswers = (parts: QuestionData[]): RootContent[] =>
      parts.flatMap((child) => [
        ...child.answers
          .filter((answer) => answer.anchor)
          .flatMap(
            (answer) => linkedMarkdown.get(answer.id)?.tree.children ?? [],
          ),
        ...linkedAnswers(child.parts),
      ]);
    const linked = linkedAnswers(q.parts);
    q.markdownTree.children.push(...linked);
  }
  for (const [block, node] of contentBlocks)
    block.html = await render(fragment([node]));
  for (const set of sets) {
    if (set.id === DEFAULT_PROBLEM_SET_ID) continue;
    const omitReferences = (nodes: RootContent[]): RootContent[] =>
      nodes.flatMap((node) => {
        if (isDirective(node) && node.name === "reference") return [];
        if ("children" in node)
          node.children = omitReferences(
            node.children as RootContent[],
          ) as typeof node.children;
        return [node];
      });
    const original = containers.find(
      (node) => node.attributes?.["id"] === set.id,
    )!;
    const copy = structuredClone(original.children as RootContent[]);
    const discussion = createExportFragment({
      type: "root",
      children: [
        {
          ...original,
          children: omitReferences(copy) as ContainerDirective["children"],
        },
      ],
    });
    set.discussionMarkdown = discussion.markdown;
    set.discussionTree = discussion.tree;
  }
  for (const q of targets.values()) {
    q.markdown = stringifyExportedTree(q.markdownTree);
    q.discussionMarkdown = stringifyExportedTree(q.discussionTree);
    q.revision = createHash("sha256")
      .update(JSON.stringify({ markdown: q.markdown, inputs: q.inputs }))
      .digest("hex")
      .slice(0, 16);
  }
  const prepareQuestion = ({
    discussionMarkdown,
    discussionTree,
    markdownTree,
    parts,
    answers,
    ...question
  }: QuestionData): PreparedQuestion => ({
    ...question,
    text: markdownPlainText(markdownTree),
    discussion: renderMarkdownValue(
      { markdown: discussionMarkdown, tree: discussionTree },
      { mode: "block" },
    ),
    answers: answers.map(({ tree, ...answer }) => ({
      ...answer,
      text: markdownPlainText(tree),
    })),
    parts: parts.map(prepareQuestion),
  });
  return sets.map(
    ({
      discussionMarkdown,
      discussionTree,
      markdownTree,
      source,
      questions,
      ...set
    }) => ({
      ...set,
      ...renderMarkdownValue(
        { markdown: set.markdown, tree: markdownTree },
        { mode: "block" },
      ),
      source: renderMarkdownSource(source, {
        mode: "single-line",
        linkPolicy: "plain",
      }),
      discussion: renderMarkdownValue(
        { markdown: discussionMarkdown, tree: discussionTree },
        { mode: "block" },
      ),
      questions: questions.map(prepareQuestion),
    }),
  );
}
