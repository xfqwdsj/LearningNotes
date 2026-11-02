"use client";
import { Fragment, type ComponentProps } from "react";
import { Command, Option } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ShortcutId } from "@/lib/keyboard";
import { useShortcutDescription } from "./use-keyboard-shortcut";
import { cn } from "@/lib/utils";
export function KeyboardShortcut({
  shortcut,
  className,
  ...props
}: Omit<ComponentProps<"kbd">, "children" | "aria-label"> & {
  shortcut: ShortcutId;
}) {
  const t = useTranslations();
  const description = useShortcutDescription(shortcut);
  if (!description) return null;
  const { keys, platform } = description;
  return (
    <kbd
      {...props}
      className={cn("keyboard-shortcut", className)}
      aria-label={description.ariaLabel}
    >
      {keys.map((key, index) => (
        <Fragment key={key}>
          {index > 0 && platform !== "apple" && (
            <span aria-hidden="true">+</span>
          )}
          {key === "Meta" ? (
            <Command className="size-3" aria-hidden="true" />
          ) : key === "Alt" && platform === "apple" ? (
            <Option className="size-3" aria-hidden="true" />
          ) : (
            <span aria-hidden="true">{t(`keyboard.keys.${key}`)}</span>
          )}
        </Fragment>
      ))}
    </kbd>
  );
}
