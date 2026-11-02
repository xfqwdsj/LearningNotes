import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import type { Catalog } from "@/lib/content/types";
import { orderedSiteTargets, type SiteTarget } from "./site-targets";

async function entries(root: string): Promise<string[]> {
  return (await readdir(root, { recursive: true, withFileTypes: true }))
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(entry.parentPath, entry.name));
}

async function catalog(mode: SiteTarget["mode"]): Promise<Catalog> {
  return JSON.parse(
    await readFile(path.join(".generated", mode, "catalog.json"), "utf8"),
  ) as Catalog;
}

const publicCatalog = await catalog("public");
const privateCatalog = await catalog("private");
if (publicCatalog.documents.some((document) => document.private))
  throw new Error("Public catalog contains private documents.");
if (privateCatalog.documents.some((document) => !document.private))
  throw new Error("Private catalog contains public documents.");
if (
  publicCatalog.documents.some((document) =>
    document.href.startsWith("/private/"),
  )
)
  throw new Error("Public catalog contains a private route.");

for (const target of orderedSiteTargets) {
  const files = await entries(target.artifact);
  if (
    !files.some((file) => path.relative(target.artifact, file) === "index.html")
  )
    throw new Error(`Missing ${target.artifact}/index.html`);
  if (
    !files.some((file) => path.relative(target.artifact, file) === "_headers")
  )
    throw new Error(`Missing ${target.artifact}/_headers`);
}

const publicFiles = await entries("dist/public");
const privatePaths = privateCatalog.documents.map((document) =>
  document.href.replace(/^\/private(?=\/)/, ""),
);
for (const file of publicFiles.filter((file) =>
  /\.(?:css|html|js|json|md|txt)$/.test(file),
)) {
  const content = await readFile(file, "utf8");
  const leaked = privatePaths.find(
    (privatePath) => privatePath.length > 1 && content.includes(privatePath),
  );
  if (leaked)
    throw new Error(
      `Public artifact ${path.relative("dist/public", file)} contains private route ${leaked}`,
    );
}

console.info(
  `[verify] ${publicCatalog.documents.length} public and ${privateCatalog.documents.length} private documents are isolated.`,
);
