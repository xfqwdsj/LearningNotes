import path from "node:path";

export const siteModes = ["public", "private"] as const;
export type SiteMode = (typeof siteModes)[number];

export interface SiteTarget {
  artifact: string;
  basePath: string;
  deploymentConfig: string;
  mode: SiteMode;
}

export const siteTargets: Record<SiteMode, SiteTarget> = {
  public: {
    artifact: "dist/public",
    basePath: "",
    deploymentConfig: "wrangler.public.jsonc",
    mode: "public",
  },
  private: {
    artifact: "dist/private",
    basePath: "/private",
    deploymentConfig: "wrangler.private.jsonc",
    mode: "private",
  },
};

export const orderedSiteTargets = siteModes.map((mode) => siteTargets[mode]);
export const buildOutputDir = "out";
export const buildTransactionDir = ".dev/build-artifacts";
export const typegenDistDir = ".next";
export const nextBuildCacheDir = path.join(".next", "cache");

export function buildCacheDir(mode: SiteMode): string {
  return path.join(".dev", "next", mode, "cache");
}

export function parseSiteMode(value: string | undefined): SiteMode {
  if (value === undefined || value === "public") return "public";
  if (value === "private") return "private";
  throw new Error(
    `CONTENT_MODE must be "public" or "private", received ${JSON.stringify(value)}`,
  );
}

export function devInstanceRoot(instance: string): string {
  if (!/^[A-Za-z0-9_-]+$/.test(instance))
    throw new Error(
      `Invalid development instance: ${JSON.stringify(instance)}`,
    );
  return path.join(".dev", "instances", instance);
}

export function devPublicDistDir(instance: string): string {
  return path.join(devInstanceRoot(instance), "public", "next");
}

export function devPrivateAppRoot(instance: string): string {
  return path.join(devInstanceRoot(instance), "private", "app");
}

export function devPrivateDistDir(instance: string): string {
  return path.join(devPrivateAppRoot(instance), "next");
}

export function devGeneratedRoot(instance: string): string {
  return path.join(devInstanceRoot(instance), "generated");
}

export function deploymentHeaders(mode: SiteMode): string {
  const markdown = `/*.md
  Content-Type: text/markdown; charset=utf-8
`;
  if (mode === "public") return markdown;
  return `/private
  Cache-Control: private, no-store
  X-Robots-Tag: noindex, nofollow
/private/*
  Cache-Control: private, no-store
  X-Robots-Tag: noindex, nofollow
${markdown}`;
}
