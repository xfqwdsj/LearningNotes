"use client";
import { MarkdownText } from "@/components/markdown-text";
import { useTranslations } from "next-intl";
import { CornerUpLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ReferenceLocation } from "@/lib/content/types";

export function ReferenceItems({
  references,
}: {
  references: ReferenceLocation[];
}) {
  return (
    <>
      {references.map((reference) => (
        <DropdownMenuItem key={reference.href} asChild>
          <a href={reference.href} className="flex min-w-0 items-start gap-2">
            <CornerUpLeft className="mt-0.5 size-3.5 shrink-0" />
            <span className="min-w-0">
              <span className="block truncate">
                <MarkdownText value={reference.title} />
              </span>
              {reference.section && (
                <span className="text-muted-foreground block truncate text-xs">
                  <MarkdownText value={reference.section} />
                </span>
              )}
            </span>
          </a>
        </DropdownMenuItem>
      ))}
    </>
  );
}

export function ReferenceMenu({
  references,
}: {
  references: ReferenceLocation[];
}) {
  const t = useTranslations();
  if (!references.length) return null;
  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="reference-menu-trigger"
              aria-label={t("references.open", { count: references.length })}
            >
              <CornerUpLeft className="size-4" />
              <span className="reference-menu-count">{references.length}</span>
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent sideOffset={5}>{t("references.title")}</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>{t("references.title")}</DropdownMenuLabel>
        <DropdownMenuGroup>
          <ReferenceItems references={references} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
