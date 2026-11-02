import createNextIntlPlugin from "next-intl/plugin";
import { hostname, networkInterfaces } from "node:os";
import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";
import { parseSiteMode, siteTargets } from "./scripts/site-targets";
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");
export default function config(phase: string): NextConfig {
  const development = phase === PHASE_DEVELOPMENT_SERVER;
  const fixtureBuild = process.env["LEARNING_FIXTURE_BUILD"] === "true";
  const mode = parseSiteMode(process.env["CONTENT_MODE"]);
  const instance = development
    ? process.env["LEARNING_DEV_INSTANCE"]
    : undefined;
  const distDir =
    process.env["LEARNING_DIST_DIR"] ??
    (development
      ? `.next-dev-${mode}${instance ? `-${instance}` : ""}`
      : ".next");
  return withNextIntl({
    ...(development ? {} : { output: "export" }),
    distDir,
    basePath: siteTargets[mode].basePath,
    trailingSlash: true,
    // HMR upgrades must reach their zone without a trailing-slash redirect.
    skipTrailingSlashRedirect: development,
    images: { unoptimized: true },
    poweredByHeader: false,
    ...(process.env["LEARNING_PROJECT_ROOT"]
      ? { turbopack: { root: process.env["LEARNING_PROJECT_ROOT"] } }
      : {}),
    experimental: {
      ...(fixtureBuild ? { turbopackFileSystemCacheForBuild: false } : {}),
      ...(development ? { proxyTimeout: 120_000 } : {}),
    },
    ...(development
      ? {
          allowedDevOrigins: [
            ...new Set([
              hostname().toLowerCase(),
              ...Object.values(networkInterfaces()).flatMap((addresses) =>
                (addresses ?? []).map((address) => address.address),
              ),
              ...(process.env["DEV_ALLOWED_ORIGINS"] ?? "")
                .split(",")
                .map((host) => host.trim().toLowerCase())
                .filter(Boolean),
            ]),
          ],
          async rewrites() {
            const privateOrigin = process.env["PRIVATE_DEV_ORIGIN"];
            if (!development || mode === "private" || !privateOrigin) return [];
            return [
              {
                source: "/private/:path*",
                destination: `${privateOrigin}/private/:path*`,
              },
            ];
          },
        }
      : {}),
  });
}
