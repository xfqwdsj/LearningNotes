import { spawn } from "node:child_process";
import { watch, type FSWatcher } from "node:fs";
import {
  mkdir,
  readdir,
  readFile,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { devGeneratedRoot, type SiteMode } from "./site-targets";

export function regenerationQueue(
  run: () => Promise<void>,
  onError: (error: unknown) => void,
  delay = 250,
) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let running = false,
    pending = false,
    closed = false;
  const execute = async () => {
    if (closed || running) return;
    running = true;
    pending = false;
    try {
      await run();
    } catch (error) {
      onError(error);
    } finally {
      running = false;
      if (pending && !closed) timer = setTimeout(() => void execute(), delay);
    }
  };
  return {
    invalidate() {
      if (closed) return;
      pending = true;
      clearTimeout(timer);
      if (!running) timer = setTimeout(() => void execute(), delay);
    },
    close() {
      closed = true;
      clearTimeout(timer);
    },
  };
}
export async function files(root: string): Promise<string[]> {
  try {
    return (await readdir(root, { recursive: true, withFileTypes: true }))
      .filter((entry) => entry.isFile())
      .map((entry) =>
        path.relative(root, path.join(entry.parentPath, entry.name)),
      );
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}
// Publish changed files individually; readers keep the last valid output while preparation runs.
export async function syncGenerated(
  source: string,
  destination: string,
  previous: readonly string[],
) {
  const entries = await files(source);
  const next = new Set(entries);
  for (const relative of entries.filter((entry) => entry !== "revision.json")) {
    const target = path.join(destination, relative);
    const content = await readFile(path.join(source, relative));
    let same = false;
    try {
      same = content.equals(await readFile(target));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
    if (same) continue;
    await mkdir(path.dirname(target), { recursive: true });
    const temporary = `${target}.pending-${process.pid}`;
    await writeFile(temporary, content);
    await rename(temporary, target);
  }
  for (const relative of previous) {
    if (!next.has(relative))
      await rm(path.join(destination, relative), { force: true });
  }
  return entries;
}

export async function syncDirectory(
  source: string,
  destination: string,
): Promise<string[]> {
  return syncGenerated(source, destination, await files(destination));
}
export async function runPreparation(
  root: string,
  output?: string,
  signal?: AbortSignal,
) {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [
        "--import",
        "tsx",
        "scripts/prepare.ts",
        ...(output ? ["--output", output] : []),
      ],
      {
        cwd: root,
        stdio: "inherit",
        ...(signal ? { signal } : {}),
      },
    );
    child.once("error", reject);
    child.once("exit", (code, exitSignal) =>
      code === 0
        ? resolve()
        : reject(
            new Error(`Content preparation failed (${exitSignal ?? code})`),
          ),
    );
  });
}
export async function watchGeneratedContent({
  root,
  instance,
  assetTargets,
}: {
  root: string;
  instance: string;
  assetTargets: { mode: SiteMode; destination: string }[];
}) {
  const staging = path.resolve(root, devGeneratedRoot(instance));
  const generated = path.resolve(
    process.env["LEARNING_GENERATED_DIR"] ?? path.join(root, ".generated"),
  );
  const publicContentDirectory = path.resolve(
    process.env["LEARNING_CONTENT_DIR"] ?? path.join(root, "content"),
  );
  const watchers: FSWatcher[] = [];
  const controller = new AbortController();
  let owned = await files(generated);
  const assets = await Promise.all(
    assetTargets.map(async (target) => ({
      ...target,
      owned: await files(target.destination),
    })),
  );
  const queue = regenerationQueue(
    async () => {
      console.info("[content] Regenerating content and resources…");
      await runPreparation(root, staging, controller.signal);
      for (const target of assets)
        target.owned = await syncGenerated(
          path.join(staging, target.mode, "assets"),
          target.destination,
          target.owned,
        );
      owned = await syncGenerated(staging, generated, owned);
      // A statically imported revision lets Next's normal module graph refresh server pages.
      const revision = await readFile(path.join(staging, "revision.json"));
      const current = await readFile(path.join(generated, "revision.json"));
      if (!revision.equals(current)) {
        const pending = path.join(generated, "revision.pending.json");
        await writeFile(pending, revision);
        await rename(pending, path.join(generated, "revision.json"));
      }
      console.info("[content] Content and resources updated.");
    },
    (error) => {
      if (!controller.signal.aborted)
        console.error(
          "[content] Generation failed; keeping the last successful output. Fix the source to retry.",
          error,
        );
    },
  );
  const attach = async (
    directory: string,
    accept: (filename: string) => boolean = () => true,
  ) => {
    try {
      await stat(directory);
      const watcher = watch(
        directory,
        { recursive: true },
        (_event, filename) => {
          if (!filename || accept(filename.replaceAll(path.sep, "/")))
            queue.invalidate();
        },
      );
      watcher.on("error", (error) =>
        console.error("[content] Watcher failed:", error),
      );
      watchers.push(watcher);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  };
  const privateRoot = path.resolve(
    process.env["PRIVATE_CONTENT_DIR"] ??
      path.resolve(root, "../LearningNotes-Private"),
  );
  await attach(publicContentDirectory);
  await attach(
    privateRoot,
    (filename) => filename === "content" || filename.startsWith("content/"),
  );
  await attach(path.join(root, "messages"));
  await attach(path.join(root, "src/lib/content"));
  await attach(path.join(root, "src/i18n"));
  await attach(
    path.join(root, "src/demos"),
    (filename) =>
      filename.startsWith("metadata/") ||
      filename === "metadata" ||
      filename === "catalog.ts" ||
      filename === "definition.ts" ||
      filename === "types.ts",
  );
  await attach(path.join(root, "scripts"), (filename) =>
    ["prepare.ts", "taxonomy.ts", "demo-assets.ts"].includes(filename),
  );
  console.info(
    "[content] Watching content, demo metadata and generation inputs.",
  );
  return {
    close() {
      queue.close();
      controller.abort();
      for (const watcher of watchers) watcher.close();
    },
  };
}
