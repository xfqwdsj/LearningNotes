import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { siteTargets, type SiteMode } from "./site-targets";

const contentTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

export function previewModeForPath(pathname: string): SiteMode {
  return pathname === "/private" || pathname.startsWith("/private/")
    ? "private"
    : "public";
}

function safeRelativePath(pathname: string): string | undefined {
  const normalized = path.posix.normalize(pathname);
  if (
    normalized.includes("\0") ||
    normalized === ".." ||
    normalized.startsWith("../")
  )
    return undefined;
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}

async function fileExists(filename: string): Promise<boolean> {
  try {
    return (await stat(filename)).isFile();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

function previewArtifact(mode: SiteMode, root?: string): string {
  return path.resolve(
    root ? path.join(root, mode) : siteTargets[mode].artifact,
  );
}

export async function resolvePreviewFile(
  mode: SiteMode,
  rawPathname: string,
  artifactRoot?: string,
): Promise<{ file: string; mode: SiteMode } | undefined> {
  const privatePrefix = siteTargets.private.basePath;
  const relative =
    mode === "private"
      ? rawPathname.slice(privatePrefix.length) || "/"
      : rawPathname;
  const pathname = safeRelativePath(decodeURIComponent(relative));
  if (!pathname) return undefined;
  const artifact = previewArtifact(mode, artifactRoot);
  const candidates = [
    path.resolve(artifact, `.${pathname}`),
    path.resolve(artifact, `.${pathname}`, "index.html"),
  ];
  for (const candidate of candidates) {
    const relativeToArtifact = path.relative(artifact, candidate);
    if (
      relativeToArtifact === ".." ||
      relativeToArtifact.startsWith(`..${path.sep}`) ||
      path.isAbsolute(relativeToArtifact)
    )
      continue;
    if (await fileExists(candidate)) return { file: candidate, mode };
  }
  for (const fallbackMode of [mode, "public"] as const) {
    const fallback = path.join(
      previewArtifact(fallbackMode, artifactRoot),
      "404.html",
    );
    if (await fileExists(fallback))
      return { file: fallback, mode: fallbackMode };
  }
  return undefined;
}

export function createPreviewServer(artifactRoot?: string) {
  return createServer(async (request, response) => {
    try {
      const url = new URL(request.url ?? "/", "http://127.0.0.1");
      const mode = previewModeForPath(url.pathname);
      const resolved = await resolvePreviewFile(
        mode,
        url.pathname,
        artifactRoot,
      );
      if (!resolved) {
        response.writeHead(404, {
          "Content-Type": "text/plain; charset=utf-8",
        });
        response.end("Not found. Run `pnpm build` first.");
        return;
      }
      if (resolved.mode === "private") {
        response.setHeader("Cache-Control", "private, no-store");
        response.setHeader("X-Robots-Tag", "noindex, nofollow");
      }
      response.setHeader(
        "Content-Type",
        contentTypes[path.extname(resolved.file).toLowerCase()] ??
          "application/octet-stream",
      );
      response.statusCode = resolved.file.endsWith("404.html") ? 404 : 200;
      if (request.method === "HEAD") {
        response.end();
        return;
      }
      if (request.method !== "GET") {
        response.writeHead(405, { Allow: "GET, HEAD" });
        response.end();
        return;
      }
      createReadStream(resolved.file).pipe(response);
    } catch (error) {
      console.error(error);
      response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Preview failed.");
    }
  });
}

const portIndex = process.argv.findIndex(
  (argument) => argument === "--port" || argument === "-p",
);
const port = Number(
  portIndex >= 0 ? process.argv[portIndex + 1] : (process.env["PORT"] ?? 4180),
);
const hostname = process.env["PREVIEW_HOSTNAME"] ?? "127.0.0.1";
const server = createPreviewServer(process.env["LEARNING_ARTIFACT_ROOT"]);

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  if (!Number.isInteger(port) || port <= 0 || port > 65_535)
    throw new Error(`Invalid preview port: ${port}`);
  server.listen(port, hostname, () => {
    console.info(`Preview: http://${hostname}:${port}`);
  });
  process.on("SIGINT", () => server.close(() => process.exit(0)));
  process.on("SIGTERM", () => server.close(() => process.exit(0)));
}
