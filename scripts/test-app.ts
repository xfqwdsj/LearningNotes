import { cp, mkdir, readFile, rm, symlink, writeFile } from "node:fs/promises";
import path from "node:path";

export async function createTestAppRoot(
  appRoot: string,
  generatedRoot: string,
): Promise<void> {
  const projectRoot = process.cwd();
  await rm(appRoot, { recursive: true, force: true });
  await mkdir(appRoot, { recursive: true });
  for (const directory of ["node_modules", "messages", "scripts"])
    await symlink(
      path.relative(appRoot, path.join(projectRoot, directory)),
      path.join(appRoot, directory),
      "dir",
    );
  await cp(path.join(projectRoot, "src"), path.join(appRoot, "src"), {
    recursive: true,
  });
  for (const file of ["next.config.ts", "package.json", "postcss.config.mjs"])
    await cp(path.join(projectRoot, file), path.join(appRoot, file));
  const tsconfig = JSON.parse(
    await readFile(path.join(projectRoot, "tsconfig.json"), "utf8"),
  ) as { exclude?: string[] };
  tsconfig.exclude = [
    ...new Set([...(tsconfig.exclude ?? []), "scripts", "tests"]),
  ];
  await writeFile(
    path.join(appRoot, "tsconfig.json"),
    `${JSON.stringify(tsconfig, null, 2)}\n`,
  );
  await symlink(
    path.relative(appRoot, generatedRoot),
    path.join(appRoot, ".generated"),
    "dir",
  );
}
