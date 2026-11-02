import { useLocale, useTranslations } from "next-intl";
import {
  BookOpenCheck,
  BookMarked,
  ClipboardList,
  Compass,
  FileWarning,
  Lightbulb,
  ListChecks,
  ListFilter,
  MessageSquareText,
  NotebookPen,
  Paperclip,
  PencilLine,
  Sigma,
} from "lucide-react";
import type { ReactNode } from "react";
import type {
  ProblemHeading,
  QuestionContext,
} from "@/lib/content/learning-types";
import { isSemanticSlot, type SemanticSlot } from "@/lib/content/semantic";
import { RichContent } from "./rich-content";
import {
  ContentActions,
  type ActionResourceContext,
  type ActionScope,
} from "./content-actions";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

const slotIcons = {
  "knowledge.definition": BookMarked,
  "knowledge.properties": ListChecks,
  "knowledge.proof": Sigma,
  "knowledge.examples": Lightbulb,
  "knowledge.exploration": Compass,
  "task.problems": ClipboardList,
  "task.constraints": ListFilter,
  "task.work": NotebookPen,
  "task.reference": BookOpenCheck,
  "task.feedback": MessageSquareText,
  "task.correction": PencilLine,
  "task.errata": FileWarning,
  "task.attachments": Paperclip,
} satisfies Record<SemanticSlot, typeof BookMarked>;
const slotLabelKeys = {
  "knowledge.definition": "semantic.definition",
  "knowledge.properties": "semantic.properties",
  "knowledge.proof": "semantic.proof",
  "knowledge.examples": "semantic.examples",
  "knowledge.exploration": "semantic.exploration",
  "task.problems": "semantic.problems",
  "task.constraints": "semantic.constraints",
  "task.work": "semantic.work",
  "task.reference": "semantic.reference",
  "task.feedback": "semantic.feedback",
  "task.correction": "semantic.correction",
  "task.errata": "semantic.errata",
  "task.attachments": "semantic.attachments",
} as const satisfies Record<SemanticSlot, string>;

function SectionSlotBadge({
  slot,
  className,
  children,
  ariaHidden = false,
}: {
  slot: SemanticSlot | undefined;
  className: string;
  children?: ReactNode;
  ariaHidden?: boolean;
}) {
  const t = useTranslations();
  if (!slot)
    return (
      <Badge variant="outline" className={className}>
        {children}
      </Badge>
    );
  const Icon = slotIcons[slot];
  const label = t(slotLabelKeys[slot]);
  return (
    <Badge
      variant="outline"
      className={className}
      data-slot={slot}
      title={label}
      aria-label={label}
      {...(ariaHidden ? { "aria-hidden": "true" } : {})}
    >
      <Icon aria-hidden="true" />
      {children}
    </Badge>
  );
}

/** Shared heading layout for content sections and problem-set titles. */
export function SectionHeading({
  heading,
  context,
  markdownUrl,
  resourceContext,
  className,
  scope = "section",
}: {
  heading: ProblemHeading;
  context: QuestionContext;
  markdownUrl?: string;
  resourceContext?: ActionResourceContext;
  className?: string;
  scope?: Extract<ActionScope, "section" | "set">;
}) {
  const locale = useLocale();
  const t = useTranslations();
  const section = context.sections?.find(
    (section) => section.id === heading.id,
  );
  const slot = isSemanticSlot(section?.slot) ? section.slot : undefined;
  return (
    <div
      className={cn(
        "inline-section-heading",
        `heading-level-${heading.depth}`,
        slot && "has-slot-badge",
        className,
      )}
      {...(slot ? { "data-slot": section?.slot } : {})}
    >
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        {scope === "set" ? (
          <div className="section-heading-line">
            <SectionSlotBadge slot={slot} className="section-kind-badge">
              <span>{t("learning.setBadge")}</span>
            </SectionSlotBadge>
            <RichContent html={heading.html} />
          </div>
        ) : (
          <RichContent
            html={heading.html}
            headingPrefix={
              slot ? (
                <SectionSlotBadge
                  slot={slot}
                  className="section-slot-badge"
                  ariaHidden
                />
              ) : undefined
            }
          />
        )}
      </div>
      <div className="inline-section-actions" lang={locale}>
        <ContentActions
          compact
          scope={scope}
          title={`${context.title} · ${heading.title.text}`}
          href={`${context.href}#${heading.id}`}
          markdownUrl={
            markdownUrl ??
            section?.markdownUrl ??
            `${context.href}sections/${heading.id}.md`
          }
          privateContent={context.privateContent}
          {...(section?.references ? { references: section.references } : {})}
          {...(resourceContext ? { resourceContext } : {})}
        />
      </div>
    </div>
  );
}
