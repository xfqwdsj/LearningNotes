import { realpathSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
export interface GitDates {
  createdAt?: string;
  updatedAt?: string;
}
export function gitDates(file: string): GitDates {
  try {
    const resolved = realpathSync(file);
    const cwd = path.dirname(resolved);
    const top = execFileSync("git", ["rev-parse", "--show-toplevel"], {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    const shallow = execFileSync(
      "git",
      ["rev-parse", "--is-shallow-repository"],
      { cwd: top, encoding: "utf8" },
    ).trim();
    if (shallow === "true") return {};
    const output = execFileSync(
      "git",
      ["log", "--follow", "--format=%aI", "--", path.relative(top, resolved)],
      { cwd: top, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    ).trim();
    const dates = output ? output.split("\n") : [];
    const updatedAt = dates[0];
    const createdAt = dates.at(-1);
    return {
      ...(createdAt ? { createdAt } : {}),
      ...(updatedAt ? { updatedAt } : {}),
    };
  } catch {
    return {};
  }
}
