import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import {
  cp,
  mkdir,
  readdir,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { prepare } from "./prepare";
import {
  buildCacheDir,
  buildOutputDir,
  buildTransactionDir,
  deploymentHeaders,
  nextBuildCacheDir,
  orderedSiteTargets,
  type SiteMode,
} from "./site-targets";

await prepare();

await rm(buildTransactionDir, { recursive: true, force: true });
await mkdir(buildTransactionDir, { recursive: true });

async function activateBuildCache(mode: SiteMode) {
  const saved = buildCacheDir(mode);
  await mkdir(path.dirname(saved), { recursive: true });
  if (!existsSync(saved)) return;
  if (existsSync(nextBuildCacheDir))
    throw new Error(
      `Both ${nextBuildCacheDir} and ${saved} exist; refusing to mix build caches.`,
    );
  await rename(saved, nextBuildCacheDir);
}

async function preserveBuildCache(mode: SiteMode) {
  if (!existsSync(nextBuildCacheDir)) return;
  const saved = buildCacheDir(mode);
  await mkdir(path.dirname(saved), { recursive: true });
  if (existsSync(saved))
    throw new Error(`Build cache destination already exists: ${saved}`);
  await rename(nextBuildCacheDir, saved);
}

for (const target of orderedSiteTargets) {
  await activateBuildCache(target.mode);
  try {
    await rm(buildOutputDir, { recursive: true, force: true });
    const result = spawnSync("pnpm", ["exec", "next", "build"], {
      stdio: "inherit",
      env: {
        ...process.env,
        CONTENT_MODE: target.mode,
      },
    });
    if (result.error) throw result.error;
    if (result.status !== 0)
      throw new Error(
        `Static ${target.mode} build failed (${result.status ?? result.signal})`,
      );
    await stat(path.join(buildOutputDir, "index.html"));
    const publicEntries = await readdir("public", {
      recursive: true,
      withFileTypes: true,
    }).catch((error: NodeJS.ErrnoException) => {
      if (error.code === "ENOENT") return [];
      throw error;
    });
    for (const entry of publicEntries) {
      if (entry.isFile())
        await rm(
          path.join(
            entry.parentPath.replace(/^public/, buildOutputDir),
            entry.name,
          ),
          { force: true },
        );
    }
    await cp(`.generated/${target.mode}/assets`, buildOutputDir, {
      recursive: true,
    });
    await writeFile(
      path.join(buildOutputDir, "_headers"),
      deploymentHeaders(target.mode),
    );
    await rename(buildOutputDir, path.join(buildTransactionDir, target.mode));
  } finally {
    await preserveBuildCache(target.mode);
  }
}

await rm("dist", { recursive: true, force: true });
await rename(buildTransactionDir, "dist");
console.info(
  "Static exports: dist/public and dist/private. Deploy each target separately; protect dist/private before publishing.",
);
