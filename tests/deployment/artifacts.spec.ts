import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { test, expect, type APIRequestContext } from "@playwright/test";

interface SearchEntry {
  href: string;
  private: boolean;
}

interface DirectoryIndex {
  version: number;
  entries?: {
    entry?: string;
  }[];
}

interface EntryResource {
  version: number;
  sections?: unknown[];
  problemSets?: unknown[];
}

function searchEntries(mode: "public" | "private"): SearchEntry[] {
  return JSON.parse(
    readFileSync(`dist/${mode}/search.json`, "utf8"),
  ) as SearchEntry[];
}

function findQuestionsResource(root: string): string | undefined {
  if (!existsSync(root)) return undefined;
  for (const relative of readdirSync(root, {
    recursive: true,
    encoding: "utf8",
  })) {
    if (path.basename(relative) === "questions.json") return relative;
  }
  return undefined;
}

function findDirectoryIndex(root: string): string | undefined {
  const indexRoot = path.join(root, "index");
  if (!existsSync(indexRoot)) return undefined;
  for (const relative of readdirSync(indexRoot, {
    recursive: true,
    encoding: "utf8",
  })) {
    if (!relative.endsWith(".json")) continue;
    const file = path.join(indexRoot, relative);
    const value = JSON.parse(readFileSync(file, "utf8")) as DirectoryIndex;
    if (value.version === 3 && value.entries?.some((entry) => entry.entry))
      return path.join("index", relative);
  }
  return undefined;
}

async function expectDirectoryEntryResource(
  request: APIRequestContext,
  root: string,
) {
  const indexFile = findDirectoryIndex(root);
  expect(indexFile).toBeDefined();
  if (!indexFile) return;
  const index = JSON.parse(
    readFileSync(path.join(root, indexFile), "utf8"),
  ) as DirectoryIndex;
  const entry = index.entries?.find((item) => item.entry)?.entry;
  expect(entry).toBeDefined();
  if (!entry) return;
  const detail = await request.get(entry);
  expect(detail.ok()).toBe(true);
  const resource = (await detail.json()) as EntryResource;
  expect(resource.version).toBe(3);
  expect(Array.isArray(resource.sections)).toBe(true);
  expect(Array.isArray(resource.problemSets)).toBe(true);
}

test("actual public artifact serves catalog-selected routes and resources", async ({
  page,
  request,
}) => {
  const document = searchEntries("public").find((entry) => !entry.private);
  expect(document).toBeDefined();
  if (!document) return;

  const response = await page.goto(document.href);
  expect(response?.ok()).toBe(true);
  await expect(page.locator("#main-content")).toBeVisible();

  const questions = findQuestionsResource("dist/public");
  if (questions) {
    const response = await request.get(
      `/${questions.replaceAll(path.sep, "/")}`,
    );
    expect(response.ok()).toBe(true);
    const resource = (await response.json()) as {
      version: number;
      problemSets: unknown[];
    };
    expect(resource.version).toBe(2);
    expect(Array.isArray(resource.problemSets)).toBe(true);
  }

  await expectDirectoryEntryResource(request, "dist/public");
});

test("actual private artifact serves catalog-selected routes and resources", async ({
  page,
  request,
}) => {
  const document = searchEntries("private").find((entry) => entry.private);
  test.skip(!document, "private artifact is unavailable in this checkout");
  if (!document) return;

  const response = await page.goto(document.href);
  expect(response?.ok()).toBe(true);
  await expect(page.locator("#main-content")).toBeVisible();

  const questions = findQuestionsResource("dist/private");
  if (questions) {
    const response = await request.get(
      `/private/${questions.replaceAll(path.sep, "/")}`,
    );
    expect(response.ok()).toBe(true);
    const resource = (await response.json()) as {
      version: number;
      problemSets: unknown[];
    };
    expect(resource.version).toBe(2);
    expect(Array.isArray(resource.problemSets)).toBe(true);
  }

  const headers = readFileSync("dist/private/_headers", "utf8");
  expect(headers).toContain("/private");
  expect(headers).toContain("Cache-Control: private, no-store");

  await expectDirectoryEntryResource(request, "dist/private");
});
