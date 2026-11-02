import { spawn, type ChildProcess } from "node:child_process";
import { cp, rm, mkdir, symlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { watch } from "node:fs";
import { createServer } from "node:net";
import {
  runPreparation,
  syncDirectory,
  watchGeneratedContent,
} from "./dev-content";
import {
  devInstanceRoot,
  devPrivateAppRoot,
  devPrivateDistDir,
  devPublicDistDir,
  parseSiteMode,
  type SiteMode,
} from "./site-targets";

await runPreparation(process.cwd());
const initialMode = parseSiteMode(process.env["CONTENT_MODE"]);
const privateOnly = initialMode === "private";
const children: ChildProcess[] = [];
const portIndex = process.argv.findIndex(
  (arg) => arg === "--port" || arg === "-p",
);
const instance =
  portIndex >= 0
    ? process.argv[portIndex + 1]
    : (process.env["PORT"] ?? "3000");
if (!instance) throw new Error("A development port is required");
const instanceRoot = path.resolve(devInstanceRoot(instance));
const generatedRoot = path.resolve(
  process.env["LEARNING_GENERATED_DIR"] ?? ".generated",
);
await mkdir(instanceRoot, { recursive: true });
const publicAssets = path.join(process.cwd(), "public");
await syncDirectory(
  path.join(generatedRoot, privateOnly ? "private/assets" : "public/assets"),
  publicAssets,
);
const watchers: { close(): void }[] = [];
const assetTargets: { mode: SiteMode; destination: string }[] = [
  {
    mode: privateOnly ? "private" : "public",
    destination: publicAssets,
  },
];
let stopping = false;
function stop(code: number) {
  if (stopping) return;
  stopping = true;
  for (const watcher of watchers) watcher.close();
  for (const child of children) {
    try {
      if (process.platform !== "win32" && child.pid)
        process.kill(-child.pid, "SIGTERM");
      else child.kill("SIGTERM");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ESRCH")
        console.error(error);
    }
  }
  const exits = children.map(
    (child) =>
      new Promise<void>((resolve) => {
        if (child.exitCode !== null || child.signalCode !== null) resolve();
        else child.once("exit", () => resolve());
      }),
  );
  void Promise.all(exits).then(() => process.exit(code));
}
function start(args: string[], env: NodeJS.ProcessEnv, cwd = process.cwd()) {
  const nextCli = fileURLToPath(import.meta.resolve("next/dist/bin/next"));
  const child = spawn(process.execPath, [nextCli, "dev", ...args], {
    stdio: "inherit",
    detached: process.platform !== "win32",
    cwd,
    env: { ...env, LEARNING_DEV_INSTANCE: instance },
  });
  children.push(child);
  child.on("error", (error) => {
    console.error(error);
    stop(1);
  });
  child.on("exit", (code, signal) => {
    if (!stopping) stop(code ?? (signal ? 1 : 0));
  });
}
process.on("SIGINT", () => stop(0));
process.on("SIGTERM", () => stop(0));
if (privateOnly) {
  start(process.argv.slice(2), {
    ...process.env,
    CONTENT_MODE: "private",
    LEARNING_DIST_DIR: path.relative(
      process.cwd(),
      path.resolve(devPrivateDistDir(instance)),
    ),
  });
} else {
  // The private zone needs its own Next process and cache, matching production's two builds.
  const reservation = createServer();
  await new Promise<void>((resolve, reject) => {
    reservation.once("error", reject);
    reservation.listen(0, "127.0.0.1", resolve);
  });
  const address = reservation.address();
  if (!address || typeof address === "string")
    throw new Error("Unable to reserve a private dev port");
  const privatePort = address.port;
  await new Promise<void>((resolve, reject) =>
    reservation.close((error) => (error ? reject(error) : resolve())),
  );
  const root = process.cwd();
  const privateRoot = path.resolve(devPrivateAppRoot(instance));
  await mkdir(privateRoot, { recursive: true });
  for (const entry of ["node_modules", ".generated", "scripts"]) {
    const target = path.join(privateRoot, entry);
    await rm(target, { recursive: true, force: true });
    const source =
      entry === ".generated" ? generatedRoot : path.join(root, entry);
    await symlink(path.relative(privateRoot, source), target, "dir");
  }
  let syncing = Promise.resolve();
  for (const folder of ["src", "messages"]) {
    await syncDirectory(folder, path.join(privateRoot, folder));
    watchers.push(
      watch(folder, { recursive: true }, (_event, filename) => {
        if (!filename) return;
        syncing = syncing
          .then(async () => {
            const source = path.join(root, folder, filename);
            const destination = path.join(privateRoot, folder, filename);
            try {
              await cp(source, destination, { recursive: true });
            } catch (error) {
              if ((error as NodeJS.ErrnoException).code === "ENOENT")
                await rm(destination, { recursive: true, force: true });
              else throw error;
            }
          })
          .catch((error: unknown) => {
            console.error(error);
            stop(1);
          });
      }),
    );
  }
  for (const file of [
    "next.config.ts",
    "tsconfig.json",
    "package.json",
    "postcss.config.mjs",
  ])
    await cp(file, path.join(privateRoot, file));
  const environmentFiles = [".env", ".env.development"];
  const mirrorConfig = async (file: string) => {
    try {
      await cp(path.join(root, file), path.join(privateRoot, file));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT")
        await rm(path.join(privateRoot, file), { force: true });
      else throw error;
    }
  };
  await Promise.all(environmentFiles.map(mirrorConfig));
  const watchedConfig = new Set([
    "next.config.ts",
    "postcss.config.mjs",
    ...environmentFiles,
  ]);
  watchers.push(
    watch(root, (_event, filename) => {
      if (!filename || !watchedConfig.has(filename)) return;
      syncing = syncing
        .then(() => mirrorConfig(filename))
        .catch((error: unknown) => {
          console.error(error);
          stop(1);
        });
    }),
  );
  const privateAssets = path.join(privateRoot, "public");
  await syncDirectory(
    path.join(generatedRoot, "private/assets"),
    privateAssets,
  );
  assetTargets.push({
    mode: "private",
    destination: privateAssets,
  });
  start(
    ["--hostname", "127.0.0.1", "--port", String(privatePort)],
    {
      ...process.env,
      CONTENT_MODE: "private",
      LEARNING_DIST_DIR: path.relative(
        privateRoot,
        path.resolve(devPrivateDistDir(instance)),
      ),
      PRIVATE_DEV_ORIGIN: "",
      LEARNING_PROJECT_ROOT: process.env["LEARNING_PROJECT_ROOT"] ?? root,
    },
    privateRoot,
  );
  start(process.argv.slice(2), {
    ...process.env,
    CONTENT_MODE: "public",
    LEARNING_DIST_DIR: path.relative(
      process.cwd(),
      path.resolve(devPublicDistDir(instance)),
    ),
    PRIVATE_DEV_ORIGIN: `http://127.0.0.1:${privatePort}`,
  });
  console.info(
    "Private content is available at /private/ on the main development URL.",
  );
}

watchers.push(
  await watchGeneratedContent({
    root: process.cwd(),
    instance,
    assetTargets,
  }),
);
