function normalizedBasePath(basePath: string) {
  return basePath.replace(/\/+$/, "");
}

export function hasBasePath(path: string, basePath: string) {
  const base = normalizedBasePath(basePath);
  return Boolean(base) && (path === base || path.startsWith(base + "/"));
}

export function stripBasePath(path: string, basePath: string) {
  const base = normalizedBasePath(basePath);
  if (!base || !hasBasePath(path, base)) return path;
  return path.slice(base.length) || "/";
}

export function normalizePathname(pathname: string, basePath: string) {
  const local = stripBasePath(pathname, basePath).split(/[?#]/, 1)[0] || "/";
  const absolute = local.startsWith("/") ? local : "/" + local;
  const withoutTrailingSlash = absolute.replace(/\/+$/, "");
  return withoutTrailingSlash ? withoutTrailingSlash + "/" : "/";
}
