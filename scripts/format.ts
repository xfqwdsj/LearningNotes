import { spawnSync } from "node:child_process";
import { stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spacingPreservationHint } from "./cjk-spacing";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function parseMode(value: string | undefined): "--write" | "--check" {
  if (value === "--write" || value === "--check") return value;
  throw new Error("Expected --write or --check.");
}

const mode = parseMode(process.argv[2]);
const prettierCli = path.join(root, "node_modules/prettier/bin/prettier.cjs");
const tsxCli = path.join(root, "node_modules/tsx/dist/cli.mjs");
const spacingScript = path.join(root, "scripts/cjk-spacing.ts");
const config = path.join(root, ".prettierrc.json");

function runPrettier(
  directory: string,
  target: string,
  ignorePath?: string,
): number {
  const args = [prettierCli, mode, "--config", config];
  if (ignorePath) args.push("--ignore-path", ignorePath);
  args.push(target);

  const result = spawnSync(process.execPath, args, {
    cwd: directory,
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  return result.status ?? 1;
}

function runSpacing(spacingMode: "--check" | "--scan" | "--write"): number {
  const result = spawnSync(
    process.execPath,
    [tsxCli, spacingScript, spacingMode],
    {
      cwd: root,
      env: { ...process.env, CJK_SPACING_HINT: "0" },
      stdio: "inherit",
    },
  );
  if (result.error) throw result.error;
  return result.status ?? 1;
}

const mainStatus = runPrettier(root, ".");
const privateRoot = path.resolve(
  process.env["PRIVATE_CONTENT_DIR"] ??
    path.resolve(root, "../LearningNotes-Private"),
);
const privateContent = path.join(privateRoot, "content");

let privateContentAvailable = true;
try {
  const contentDirectory = await stat(privateContent);
  if (!contentDirectory.isDirectory()) {
    throw new Error("The private content path is not a directory.");
  }
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  privateContentAvailable = false;
}

if (!privateContentAvailable) {
  console.info("[format] Private content checkout unavailable; skipping.");
}

const privateStatus = privateContentAvailable
  ? runPrettier(root, privateContent, path.join(root, ".prettierignore"))
  : 0;
const spacingStatus = runSpacing(mode);
const scanStatus = runSpacing("--scan");
process.exitCode = Math.max(
  mainStatus,
  privateStatus,
  spacingStatus,
  scanStatus,
);
console.info(spacingPreservationHint);
