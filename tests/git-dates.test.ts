import { afterEach, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, renameSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { gitDates } from "@/lib/content/git-dates";
const directories: string[] = [];
afterEach(() => {
  directories
    .splice(0)
    .forEach((dir) => rmSync(dir, { recursive: true, force: true }));
});
it("uses Git history, follows renames and leaves uncommitted files undated", () => {
  const cwd = mkdtempSync(path.join(tmpdir(), "learning-dates-"));
  directories.push(cwd);
  const git = (...args: string[]) =>
    execFileSync("git", args, { cwd, stdio: "pipe" });
  git("init", "-q");
  writeFileSync(path.join(cwd, "article.md"), "first");
  expect(gitDates(path.join(cwd, "article.md"))).toEqual({});
  git("add", ".");
  git(
    "-c",
    "user.name=Fixture",
    "-c",
    "user.email=fixture@example.invalid",
    "commit",
    "-qm",
    "first",
    "--date=2025-01-01T00:00:00Z",
  );
  renameSync(path.join(cwd, "article.md"), path.join(cwd, "renamed.md"));
  git("add", "-A");
  git(
    "-c",
    "user.name=Fixture",
    "-c",
    "user.email=fixture@example.invalid",
    "commit",
    "-qm",
    "rename",
    "--date=2025-02-01T00:00:00Z",
  );
  const dates = gitDates(path.join(cwd, "renamed.md"));
  expect(dates.createdAt).toContain("2025-01-01");
  expect(dates.updatedAt).toContain("2025-02-01");
});
