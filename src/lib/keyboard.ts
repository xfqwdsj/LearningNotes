export type KeyboardPlatform = "apple" | "other";
const shortcuts = {
  search: ["primary", "K"],
  dismiss: ["Escape"],
  notifications: ["Alt", "T"],
} as const;
export type ShortcutId = keyof typeof shortcuts;
export type ShortcutKey = "Meta" | "Control" | "Escape" | "K" | "Alt" | "T";

/** UA Client Hints take priority; the UA string also covers iPad desktop mode. */
export function keyboardPlatform(
  userAgent: string,
  platformHint?: string,
): KeyboardPlatform {
  const identity = platformHint?.trim() || userAgent;
  return /Mac|iPhone|iPad|iPod|iOS/i.test(identity) ? "apple" : "other";
}
export function browserKeyboardPlatform(): KeyboardPlatform {
  const browser = navigator as Navigator & {
    userAgentData?: { platform?: string };
  };
  return keyboardPlatform(browser.userAgent, browser.userAgentData?.platform);
}
export function resolveShortcut(id: ShortcutId, platform: KeyboardPlatform) {
  const keys: ShortcutKey[] = shortcuts[id].map((key) =>
    key === "primary" ? (platform === "apple" ? "Meta" : "Control") : key,
  );
  return { keys, binding: keys.join("+") };
}
