"use client";
import { useEffect, useEffectEvent, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { tinykeys } from "tinykeys";
import {
  browserKeyboardPlatform,
  resolveShortcut,
  type ShortcutId,
} from "@/lib/keyboard";
const subscribe = () => () => {};
const serverPlatform = () => null;
/** Static HTML has no user UA. Resolve once in the browser without a hydration mismatch. */
export function useKeyboardPlatform() {
  return useSyncExternalStore(
    subscribe,
    browserKeyboardPlatform,
    serverPlatform,
  );
}
export function useShortcutDescription(id: ShortcutId) {
  const platform = useKeyboardPlatform();
  const t = useTranslations();
  if (!platform) return null;
  const resolved = resolveShortcut(id, platform);
  const label = resolved.keys
    .map((key) =>
      t(
        `keyboard.keys.${key === "Alt" && platform === "apple" ? "Option" : key}`,
      ),
    )
    .join("+");
  return {
    ...resolved,
    platform,
    label,
    ariaLabel: t("keyboard.shortcut", { keys: label }),
  };
}
export function useKeyboardShortcut(id: ShortcutId, callback: () => void) {
  const platform = useKeyboardPlatform();
  const action = useEffectEvent(callback);
  useEffect(() => {
    if (!platform) return;
    const { binding } = resolveShortcut(id, platform);
    return tinykeys(
      document,
      {
        [binding]: (event) => {
          event.preventDefault();
          action();
        },
      },
      {
        // Global command shortcuts remain available in search and answer fields.
        ignore: (event) =>
          event.defaultPrevented || event.repeat || event.isComposing,
      },
    );
  }, [id, platform]);
}
