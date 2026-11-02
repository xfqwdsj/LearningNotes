import { spawnSync } from "node:child_process";
import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { prepareFixtureSuite } from "../tests/fixtures/corpus";
import { createPreviewServer } from "./preview";
import { createTestAppRoot } from "./test-app";

const portIndex = process.argv.findIndex((argument) => argument === "--port");
const port = Number(
  portIndex >= 0 ? process.argv[portIndex + 1] : (process.env["PORT"] ?? 4180),
);
if (!Number.isInteger(port) || port <= 0 || port > 65_535)
  throw new Error(`Invalid browser-test port: ${port}`);

const fixture = await prepareFixtureSuite("browser");
const appRoot = path.join(fixture.suiteRoot, "app");
const artifactRoot = path.join(fixture.suiteRoot, "artifacts");
await createTestAppRoot(appRoot, fixture.generatedRoot);
await rm(artifactRoot, { recursive: true, force: true });
await mkdir(artifactRoot, { recursive: true });

const nextBin = fileURLToPath(import.meta.resolve("next/dist/bin/next"));
for (const mode of ["public", "private"] as const) {
  const publicRoot = path.join(appRoot, "public");
  const outputRoot = path.join(appRoot, "out");
  await rm(publicRoot, { recursive: true, force: true });
  await rm(outputRoot, { recursive: true, force: true });
  await mkdir(publicRoot, { recursive: true });
  await cp(path.join(fixture.generatedRoot, mode, "assets"), publicRoot, {
    recursive: true,
  });
  const result = spawnSync(process.execPath, [nextBin, "build"], {
    cwd: appRoot,
    stdio: "inherit",
    env: {
      ...process.env,
      CONTENT_MODE: mode,
      LEARNING_FIXTURE_BUILD: "true",
      LEARNING_CONTENT_DIR: fixture.publicContentDirectory,
      LEARNING_DIST_DIR: ".next",
      LEARNING_GENERATED_DIR: fixture.generatedRoot,
      PRIVATE_CONTENT_DIR: path.join(fixture.sourceRoot, "private"),
      LEARNING_PROJECT_ROOT: process.cwd(),
    },
  });
  if (result.status !== 0)
    throw new Error(
      `Static ${mode} test build failed (${result.status ?? result.signal})`,
    );
  await cp(outputRoot, path.join(artifactRoot, mode), { recursive: true });
}

const server = createPreviewServer(artifactRoot);
server.listen(port, "127.0.0.1", () => {
  console.info(`Fixture preview: http://127.0.0.1:${port}`);
});
process.on("SIGINT", () => server.close(() => process.exit(0)));
process.on("SIGTERM", () => server.close(() => process.exit(0)));
