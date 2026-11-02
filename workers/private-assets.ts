const privatePath = "/private";

interface AssetsBinding {
  fetch(request: Request): Promise<Response>;
}

interface Env {
  ASSETS: AssetsBinding;
}

export function privateAssetPathname(pathname: string): string | undefined {
  if (pathname === privatePath) return "/";
  if (!pathname.startsWith(`${privatePath}/`)) return undefined;
  return pathname.slice(privatePath.length);
}

function withPrivateUrl(location: string, requestUrl: string): string {
  const target = new URL(location, requestUrl);
  const origin = new URL(requestUrl).origin;
  if (
    target.origin === origin &&
    target.pathname !== privatePath &&
    !target.pathname.startsWith(`${privatePath}/`)
  ) {
    target.pathname = `${privatePath}${target.pathname}`;
  }
  return target.toString();
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response(null, {
        status: 405,
        headers: { Allow: "GET, HEAD" },
      });
    }

    const requestUrl = new URL(request.url);
    const assetPathname = privateAssetPathname(requestUrl.pathname);
    if (assetPathname === undefined) {
      return new Response("Not Found", { status: 404 });
    }

    const assetUrl = new URL(requestUrl);
    assetUrl.pathname = assetPathname;
    const assetResponse = await env.ASSETS.fetch(
      new Request(assetUrl, {
        method: request.method,
        headers: request.headers,
        redirect: "manual",
      }),
    );
    const headers = new Headers(assetResponse.headers);
    headers.set("Cache-Control", "private, no-store");
    headers.set("X-Robots-Tag", "noindex, nofollow");
    const location = headers.get("Location");
    if (location !== null) {
      headers.set("Location", withPrivateUrl(location, request.url));
    }
    return new Response(assetResponse.body, {
      status: assetResponse.status,
      statusText: assetResponse.statusText,
      headers,
    });
  },
} satisfies {
  fetch(request: Request, env: Env): Promise<Response>;
};
