import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, Copy, Link2, type LucideIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { copyWithFeedback } from "@/lib/clipboard";
import { cn } from "@/lib/utils";

export function CopyButton({
  label,
  getText,
  icon: Icon = Copy,
  className,
  surface = "flat",
  children,
}: {
  label: string;
  getText: () => string | Promise<string>;
  icon?: LucideIcon;
  className?: string;
  surface?: "flat" | "floating";
  children?: ReactNode;
}) {
  const t = useTranslations();

  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size={children ? "sm" : "icon-sm"}
          className={cn(
            "reading-copy-button",
            surface === "floating" && "floating-surface reading-copy-floating",
            className,
          )}
          aria-label={label}
          data-copy-state={copied ? "copied" : "idle"}
          onClick={async () => {
            const success = await copyWithFeedback(getText, t);
            clearTimeout(timer.current);
            setCopied(success);
            if (success)
              timer.current = setTimeout(() => setCopied(false), 1600);
          }}
        >
          {copied ? <Check className="size-4" /> : <Icon className="size-4" />}
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent sideOffset={5}>
        {copied ? t("common.copied") : label}
      </TooltipContent>
    </Tooltip>
  );
}

export function CopyLinkButton({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <CopyButton
      label={label}
      icon={Link2}
      getText={() => new URL(href, location.origin).href}
    />
  );
}
