import { readdir, rm } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const developmentDirectories = new Set([
  ".dev",
  ".next",
  ".wrangler",
  "out",
  "playwright-report",
  "public",
  "test-results",
]);
const artifactDirectories = new Set([".generated", "dist"]);
const generatedFiles = new Set(["tsconfig.tsbuildinfo"]);
const developmentOnly = process.argv.includes("--dev");

async function targets(): Promise<string[]> {
  const entries = await readdir(root, { withFileTypes: true });
  return entries
    .filter(
      (entry) =>
        developmentDirectories.has(entry.name) ||
        (!developmentOnly && artifactDirectories.has(entry.name)) ||
        generatedFiles.has(entry.name) ||
        entry.name.startsWith(".next-dev-") ||
        entry.name.startsWith(".next-build-"),
    )
    .map((entry) => path.join(root, entry.name));
}

const selected = await targets();
for (const target of selected) {
  console.info(`[clean] ${path.relative(root, target) || "."}`);
  await rm(target, { recursive: true, force: true });
}
if (selected.length === 0) console.info("[clean] Nothing to remove.");
