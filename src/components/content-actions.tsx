"use client";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import {
  Copy,
  Download,
  Ellipsis,
  ExternalLink,
  Link2,
  MessageCircle,
} from "lucide-react";
import { CopyButton, CopyLinkButton } from "./copy-button";
import { ReferenceItems, ReferenceMenu } from "./reference-menu";
import { copyWithFeedback } from "@/lib/clipboard";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import {
  discussionProviders,
  discussionUrl,
  type DiscussionProvider,
} from "@/lib/discussion-providers";
import type { ReferenceLocation } from "@/lib/content/types";
import type { QuestionResource } from "@/lib/content/learning-types";
import {
  findProblemSet,
  findQuestion,
  problemSetDiscussion,
  questionDiscussion,
} from "@/lib/content/learning-discussion";
type Mode = "link" | "source" | "both";
export type ActionScope =
  "page" | "section" | "set" | "question" | "questionGroup" | "part";
export type QuestionResourceSelector =
  { type: "set"; id: string } | { type: "question"; target: string };
export interface ActionResourceContext {
  answer: string;
  hasReferences: boolean;
  resourceUrl: string;
  selector: QuestionResourceSelector;
}
async function loadQuestionResource(
  url: string,
  privateContent: boolean,
): Promise<QuestionResource> {
  const response = await fetch(url, {
    cache: privateContent ? "no-store" : "default",
    redirect: "error",
  });
  if (
    !response.ok ||
    response.headers.get("content-type")?.includes("text/html")
  )
    throw new Error("Question resource is unavailable");
  const value = (await response.json()) as Partial<QuestionResource>;
  if (value.version !== 2 || !Array.isArray(value.problemSets))
    throw new Error("Unsupported question resource");
  return value as QuestionResource;
}
const labels = {
  page: {
    link: "copy.page",
    markdown: "copy.markdownPage",
    discussion: "discussion.page",
    open: "actions.page",
  },
  section: {
    link: "copy.heading",
    markdown: "copy.markdownSection",
    discussion: "discussion.section",
    open: "actions.section",
  },
  set: {
    link: "copy.set",
    markdown: "copy.markdownSet",
    discussion: "discussion.set",
    open: "actions.set",
  },
  question: {
    link: "copy.question",
    markdown: "copy.markdownQuestion",
    discussion: "discussion.question",
    open: "actions.question",
  },
  questionGroup: {
    link: "copy.questionGroup",
    markdown: "copy.markdownQuestionGroup",
    discussion: "discussion.questionGroup",
    open: "actions.questionGroup",
  },
  part: {
    link: "copy.part",
    markdown: "copy.markdownPart",
    discussion: "discussion.part",
    open: "actions.part",
  },
} as const;
export function ContentActions({
  title,
  href,
  markdownUrl,
  privateContent,
  compact = false,
  resourceContext,
  references,
  scope = "page",
}: {
  title: string;
  href: string;
  markdownUrl: string;
  privateContent: boolean;
  compact?: boolean;
  resourceContext?: ActionResourceContext;
  references?: ReferenceLocation[];
  scope?: ActionScope;
}) {
  const t = useTranslations();
  const text = labels[scope];

  const [includeReference, setIncludeReference] = useState(false);
  const [mode, setMode] = useState<Mode>(privateContent ? "source" : "link");
  const readText = async (url: string) => {
    const response = await fetch(url, {
      cache: privateContent ? "no-store" : "default",
      redirect: "error",
    });
    if (
      !response.ok ||
      response.headers.get("content-type")?.includes("text/html")
    )
      throw new Error(t("discussion.readError"));
    return response.text();
  };
  const source = async () => {
    if (!resourceContext) return readText(markdownUrl);
    const resource = await loadQuestionResource(
      resourceContext.resourceUrl,
      privateContent,
    );
    const selected =
      resourceContext.selector.type === "set"
        ? findProblemSet(resource, resourceContext.selector.id)
        : findQuestion(resource, resourceContext.selector.target);
    if (!selected) throw new Error(t("discussion.readError"));
    return selected.markdown;
  };
  const discussion = async () => {
    if (!resourceContext) return undefined;
    const resource = await loadQuestionResource(
      resourceContext.resourceUrl,
      privateContent,
    );
    if (resourceContext.selector.type === "set") {
      const set = findProblemSet(resource, resourceContext.selector.id);
      return set ? problemSetDiscussion(set) : undefined;
    }
    const question = findQuestion(resource, resourceContext.selector.target);
    return question ? questionDiscussion(question) : undefined;
  };
  const context = async () => {
    const url = new URL(href, location.origin).href;
    const md = new URL(markdownUrl, location.origin).href;
    const includeSource = mode !== "link";
    const includeReferences =
      includeReference && resourceContext?.hasReferences;
    const details =
      resourceContext && (includeSource || includeReferences)
        ? await discussion()
        : undefined;
    if (resourceContext && (includeSource || includeReferences) && !details)
      throw new Error(t("discussion.readError"));
    return t("discussion.prompt", {
      title,
      links:
        mode !== "source" ? t("discussion.links", { url, markdown: md }) : "",
      source: [
        includeSource ? (details?.source ?? (await source())) : "",
        resourceContext?.answer ?? "",
        includeReferences && details?.references
          ? t("learning.referenceContext", {
              answer: details.references,
            })
          : "",
      ]
        .filter(Boolean)
        .join("\n\n"),
    });
  };
  const copy = (raw = false) => copyWithFeedback(raw ? source : context, t);
  const copyMarkdown = () => copyWithFeedback(source, t);
  const copyLink = () =>
    copyWithFeedback(() => new URL(href, location.origin).href, t);
  const launch = async (provider: DiscussionProvider) => {
    // Reserve the tab during the user gesture before fetching Markdown.
    const target = provider.online
      ? window.open("about:blank", "_blank")
      : null;
    if (provider.online && !target) {
      toast.error(t("discussion.openFailed"), {
        description: t("discussion.allowTabs"),
      });
      return;
    }
    if (target) target.opener = null;
    try {
      const prompt = await context();
      const url = discussionUrl(provider, prompt);
      if (
        (provider.id === "claude-code" && prompt.length > 5000) ||
        url.length > 10000
      ) {
        target?.close();
        await copy();
        toast.message(t("common.copied"), {
          id: "clipboard",
          description: t("discussion.longContent"),
        });
        return;
      }
      if (target) {
        target.opener = null;
        target.location.href = url;
      } else window.location.assign(url);
    } catch {
      target?.close();
      toast.error(t("discussion.prepareFailed"), {
        description: t("discussion.checkAccess"),
      });
    }
  };
  const discussionItems = (
    <>
      <DropdownMenuLabel>{t("discussion.attach")}</DropdownMenuLabel>
      <DropdownMenuRadioGroup
        value={mode}
        onValueChange={(value) => setMode(value as Mode)}
      >
        <DropdownMenuRadioItem
          value="link"
          onSelect={(event) => event.preventDefault()}
        >
          {t("discussion.link")}
        </DropdownMenuRadioItem>
        <DropdownMenuRadioItem
          value="source"
          onSelect={(event) => event.preventDefault()}
        >
          {t("discussion.source")}
        </DropdownMenuRadioItem>
        <DropdownMenuRadioItem
          value="both"
          onSelect={(event) => event.preventDefault()}
        >
          {t("discussion.both")}
        </DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
      {resourceContext?.hasReferences && (
        <DropdownMenuCheckboxItem
          checked={includeReference}
          onCheckedChange={setIncludeReference}
          onSelect={(event) => event.preventDefault()}
        >
          {t("learning.discussReference")}
        </DropdownMenuCheckboxItem>
      )}
      <DropdownMenuSeparator />
      <DropdownMenuGroup aria-label={t("discussion.methods")}>
        <DropdownMenuLabel>{t("discussion.online")}</DropdownMenuLabel>
        {discussionProviders
          .filter((provider) => provider.online)
          .map((provider) => (
            <DropdownMenuItem
              key={provider.id}
              onSelect={() => {
                void launch(provider);
              }}
            >
              <ExternalLink />
              {t("discussion.provider", { provider: t(provider.labelKey) })}
            </DropdownMenuItem>
          ))}
        <DropdownMenuLabel>{t("discussion.app")}</DropdownMenuLabel>
        {discussionProviders
          .filter((provider) => !provider.online)
          .map((provider) => (
            <DropdownMenuItem
              key={provider.id}
              onSelect={() => {
                void launch(provider);
              }}
            >
              {t("discussion.provider", { provider: t(provider.labelKey) })}
            </DropdownMenuItem>
          ))}
        <DropdownMenuItem
          onSelect={() => {
            void copy();
          }}
        >
          <Copy />
          {t("discussion.copyPrompt")}
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuLabel>{t("common.markdown")}</DropdownMenuLabel>
      <DropdownMenuItem asChild>
        <a href={markdownUrl} download>
          <Download />
          {t("discussion.download")}
        </a>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <a href={markdownUrl} target="_blank" rel="noreferrer">
          {t("discussion.view")}
        </a>
      </DropdownMenuItem>
    </>
  );
  return (
    <div
      className={
        compact ? "content-actions content-actions-compact" : "content-actions"
      }
    >
      <div className="content-actions-inline">
        {compact && <CopyLinkButton href={href} label={t(text.link)} />}
        <CopyButton label={t(text.markdown)} getText={source}>
          {!compact ? t(text.markdown) : undefined}
        </CopyButton>
        <ReferenceMenu references={references ?? []} />
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size={compact ? "icon-sm" : "sm"}
                  aria-label={t(text.discussion)}
                >
                  <MessageCircle className="size-4" />
                  {!compact && t(text.discussion)}
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent sideOffset={5}>{t(text.discussion)}</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end" className="w-60">
            {discussionItems}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {compact && (
        <div className="content-actions-menu">
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={t(text.open)}
                  >
                    <Ellipsis className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent sideOffset={5}>{t(text.open)}</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuItem onSelect={() => void copyLink()}>
                <Link2 />
                {t(text.link)}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => void copyMarkdown()}>
                <Copy />
                {t(text.markdown)}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>{t(text.discussion)}</DropdownMenuLabel>
              {discussionItems}
              {references?.length ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>{t("references.title")}</DropdownMenuLabel>
                  <ReferenceItems references={references} />
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
