import { spawn } from "node:child_process";
import path from "node:path";
import { prepareFixtureSuite } from "../tests/fixtures/corpus";
import { createTestAppRoot } from "./test-app";

const port = process.env["DEV_TEST_PORT"] ?? "4300";
const fixture = await prepareFixtureSuite("dev");
const appRoot = path.join(fixture.suiteRoot, "app");
await createTestAppRoot(appRoot, fixture.generatedRoot);

const child = spawn(
  process.execPath,
  ["--import", "tsx", "scripts/dev.ts", ...process.argv.slice(2)],
  {
    cwd: appRoot,
    stdio: "inherit",
    env: {
      ...process.env,
      CONTENT_MODE: "public",
      DEV_TEST_PORT: port,
      LEARNING_CONTENT_DIR: fixture.publicContentDirectory,
      LEARNING_GENERATED_DIR: fixture.generatedRoot,
      PRIVATE_CONTENT_DIR: path.join(fixture.sourceRoot, "private"),
      LEARNING_PROJECT_ROOT: process.cwd(),
      PORT: port,
    },
  },
);

let stopping = false;
function stop(signal: NodeJS.Signals) {
  if (stopping) return;
  stopping = true;
  child.kill(signal);
}
process.on("SIGINT", () => stop("SIGINT"));
process.on("SIGTERM", () => stop("SIGTERM"));
child.once("error", (error) => {
  console.error(error);
  process.exitCode = 1;
});
child.once("exit", (code, signal) => {
  process.exitCode = code ?? (signal ? 1 : 0);
});
