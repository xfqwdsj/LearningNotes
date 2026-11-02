"use client";
import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
export function ThemeToggle() {
  const t = useTranslations();

  const { setTheme } = useTheme();
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(
    () => () => {
      clearTimeout(timer.current);
      delete document.documentElement.dataset["themeChanging"];
    },
    [],
  );
  const changeTheme = (value: string) => {
    clearTimeout(timer.current);
    const root = document.documentElement;
    root.dataset["themeChanging"] = "true";
    // Commit transition rules before next-themes updates the root class.
    void getComputedStyle(root).backgroundColor;
    setTheme(value);
    timer.current = setTimeout(() => {
      delete root.dataset["themeChanging"];
    }, 400);
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t("theme.switch")}>
          <Sun className="size-4 dark:hidden" />
          <Moon className="hidden size-4 dark:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {[
          ["system", t("theme.system"), Monitor],
          ["light", t("theme.light"), Sun],
          ["dark", t("theme.dark"), Moon],
        ].map(([value, label, Icon]) => {
          const Glyph = Icon as typeof Monitor;
          return (
            <DropdownMenuItem
              key={String(value)}
              onSelect={() => changeTheme(String(value))}
            >
              <Glyph className="size-4" />
              {String(label)}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
