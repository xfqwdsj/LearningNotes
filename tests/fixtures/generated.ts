import { readFileSync } from "node:fs";
import path from "node:path";
import type { Catalog } from "@/lib/content/types";

export type FixtureSuite = "vitest" | "browser" | "dev";

export function generatedRoot(suite: FixtureSuite): string {
  return path.resolve(".dev", "test-fixtures", suite, "generated");
}

export function generatedPath(
  suite: FixtureSuite,
  ...segments: string[]
): string {
  return path.join(generatedRoot(suite), ...segments);
}

export function readFixtureJson<T>(
  suite: FixtureSuite,
  ...segments: string[]
): T {
  return JSON.parse(
    readFileSync(generatedPath(suite, ...segments), "utf8"),
  ) as T;
}

export function readFixtureCatalog(
  suite: FixtureSuite,
  scope: "public" | "private",
): Catalog {
  return readFixtureJson<Catalog>(suite, scope, "catalog.json");
}
