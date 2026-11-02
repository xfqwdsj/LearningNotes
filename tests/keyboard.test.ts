import { describe, expect, it } from "vitest";
import { keyboardPlatform, resolveShortcut } from "@/lib/keyboard";
describe("shared keyboard platform and shortcut definitions", () => {
  it.each([
    ["Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", "apple"],
    ["Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)", "apple"],
    ["Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X)", "apple"],
    ["Mozilla/5.0 (Windows NT 10.0; Win64; x64)", "other"],
    ["Mozilla/5.0 (X11; Linux x86_64)", "other"],
    ["Mozilla/5.0 (Linux; Android 15)", "other"],
    ["", "other"],
  ] as const)(
    "resolves %s without relying on the build host",
    (ua, expected) => {
      expect(keyboardPlatform(ua)).toBe(expected);
    },
  );
  it("prefers UA Client Hints and falls back when hints are empty", () => {
    expect(keyboardPlatform("Windows", "macOS")).toBe("apple");
    expect(keyboardPlatform("Macintosh", "Windows")).toBe("other");
    expect(keyboardPlatform("iPad", "")).toBe("apple");
  });
  it("derives labels and recognized modifiers from the same chord", () => {
    expect(resolveShortcut("search", "apple")).toEqual({
      keys: ["Meta", "K"],
      binding: "Meta+K",
    });
    expect(resolveShortcut("search", "other")).toEqual({
      keys: ["Control", "K"],
      binding: "Control+K",
    });
    expect(resolveShortcut("notifications", "apple")).toEqual({
      keys: ["Alt", "T"],
      binding: "Alt+T",
    });
    for (const platform of ["apple", "other"] as const)
      expect(resolveShortcut("dismiss", platform)).toEqual({
        keys: ["Escape"],
        binding: "Escape",
      });
  });
});
