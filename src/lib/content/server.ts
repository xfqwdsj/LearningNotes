import "server-only";
import generation from "../../../.generated/revision.json";
import { readFileSync } from "node:fs";
import path from "node:path";
import { cache } from "react";
import { mergeHomeCatalogs } from "./home-catalog";
import type { DemoManifest } from "@/demos/types";
import type { Catalog } from "./types";
export const privateMode = process.env["CONTENT_MODE"] === "private";
export const basePath = privateMode ? "/private" : "";
const generatedRoot = path.resolve(
  process.env["LEARNING_GENERATED_DIR"] ??
    path.join(process.cwd(), ".generated"),
);
export const getCatalog = cache((): Catalog => {
  if (generation.version !== 2 || !generation.revision)
    throw new Error("Unsupported generated content revision");
  return JSON.parse(
    readFileSync(
      path.join(
        generatedRoot,
        privateMode ? "private" : "public",
        "catalog.json",
      ),
      "utf8",
    ),
  ) as Catalog;
});
export const siteUrl = process.env["SITE_URL"] ?? "https://learning.ltfan.top";

export const getHomeCatalog = cache((): Catalog =>
  privateMode
    ? mergeHomeCatalogs(
        JSON.parse(
          readFileSync(path.join(generatedRoot, "public/catalog.json"), "utf8"),
        ) as Catalog,
        getCatalog(),
      )
    : getCatalog(),
);
export const getDemoManifest = cache(
  (): DemoManifest =>
    JSON.parse(
      readFileSync(
        path.join(
          generatedRoot,
          privateMode ? "private" : "public",
          "demo-manifest.json",
        ),
        "utf8",
      ),
    ) as DemoManifest,
);
