import type { ComponentProps, ReactNode } from "react";
import { useTranslations } from "next-intl";
import { BookOpenCheck, NotebookPen } from "lucide-react";
import { ContentDisclosure } from "../content-disclosure";
import { cn } from "@/lib/utils";

export function AnswerDisclosure({
  kind,
  children,
  className,
  ...props
}: {
  kind: "work" | "reference";
  children: ReactNode;
} & Omit<ComponentProps<"details">, "title" | "children">) {
  const t = useTranslations();
  const reference = kind === "reference";
  return (
    <ContentDisclosure
      {...props}
      className={cn("answer-disclosure", kind, className)}
      title={t(reference ? "learning.reference" : "learning.work")}
      icon={reference ? <BookOpenCheck /> : <NotebookPen />}
    >
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        {children}
      </div>
    </ContentDisclosure>
  );
}
