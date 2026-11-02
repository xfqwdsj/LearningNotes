import path from "node:path";
import { describe, expect, it } from "vitest";
import { previewModeForPath } from "../scripts/preview";
import {
  buildCacheDir,
  buildOutputDir,
  deploymentHeaders,
  devGeneratedRoot,
  devPrivateAppRoot,
  devPublicDistDir,
  orderedSiteTargets,
  parseSiteMode,
  siteTargets,
} from "../scripts/site-targets";

describe("site targets", () => {
  it("keeps public and private artifacts separate", () => {
    expect(orderedSiteTargets.map((target) => target.artifact)).toEqual([
      "dist/public",
      "dist/private",
    ]);
    expect(siteTargets.public.basePath).toBe("");
    expect(siteTargets.private.basePath).toBe("/private");
    expect(buildOutputDir).toBe("out");
    expect(buildCacheDir("public")).toBe(
      path.join(".dev", "next", "public", "cache"),
    );
    expect(buildCacheDir("private")).toBe(
      path.join(".dev", "next", "private", "cache"),
    );
  });

  it("uses stable per-port development directories", () => {
    expect(devPublicDistDir("3000")).toBe(
      path.join(".dev", "instances", "3000", "public", "next"),
    );
    expect(devPrivateAppRoot("3000")).toBe(
      path.join(".dev", "instances", "3000", "private", "app"),
    );
    expect(devGeneratedRoot("3000")).toBe(
      path.join(".dev", "instances", "3000", "generated"),
    );
    expect(() => devPublicDistDir("../3000")).toThrow("Invalid");
  });

  it("rejects unknown modes and scopes private deployment headers", () => {
    expect(parseSiteMode(undefined)).toBe("public");
    expect(parseSiteMode("private")).toBe("private");
    expect(() => parseSiteMode("combined")).toThrow("CONTENT_MODE");
    expect(deploymentHeaders("private")).toContain(
      "Cache-Control: private, no-store",
    );
    expect(deploymentHeaders("public")).not.toContain(
      "Cache-Control: private, no-store",
    );
  });

  it("routes private paths to the private preview target", () => {
    expect(previewModeForPath("/")).toBe("public");
    expect(previewModeForPath("/private")).toBe("private");
    expect(previewModeForPath("/private/tasks/")).toBe("private");
    expect(previewModeForPath("/private-missing/")).toBe("public");
  });
});
