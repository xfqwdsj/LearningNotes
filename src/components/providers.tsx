"use client";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { useShortcutDescription } from "./use-keyboard-shortcut";
import type { ShortcutKey } from "@/lib/keyboard";
import { MathClipboard } from "./math-clipboard";
import { Toaster } from "sonner";
import { ThemeProvider, useTheme } from "next-themes";
import { MotionConfig } from "motion/react";
import { TooltipProvider } from "@/components/ui/tooltip";
function CopyNotifications() {
  const t = useTranslations();
  const { resolvedTheme } = useTheme();
  const shortcut = useShortcutDescription("notifications");
  const eventModifiers: Partial<Record<ShortcutKey, string>> = {
    Meta: "metaKey",
    Control: "ctrlKey",
    Alt: "altKey",
  };

  return (
    <Toaster
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      position="bottom-right"
      containerAriaLabel={t("notifications.label")}
      customAriaLabel={
        shortcut
          ? t("notifications.withShortcut", {
              label: t("notifications.label"),
              shortcut: shortcut.ariaLabel,
            })
          : t("notifications.label")
      }
      hotkey={
        shortcut
          ? shortcut.keys.map((key) => eventModifiers[key] ?? `Key${key}`)
          : []
      }
      toastOptions={{
        className: "floating-surface floating-toast",
        closeButtonAriaLabel: t("common.close"),
      }}
    />
  );
}
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <MotionConfig reducedMotion="user">
        <TooltipProvider>
          {children}
          <CopyNotifications />
          <MathClipboard />
        </TooltipProvider>
      </MotionConfig>
    </ThemeProvider>
  );
}
