import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { typegenDistDir } from "./site-targets";

const nextCli = fileURLToPath(import.meta.resolve("next/dist/bin/next"));
const result = spawnSync(process.execPath, [nextCli, "typegen"], {
  stdio: "inherit",
  env: {
    ...process.env,
    CONTENT_MODE: "public",
    LEARNING_DIST_DIR: typegenDistDir,
  },
});
if (result.error) throw result.error;
process.exit(result.status ?? 1);
