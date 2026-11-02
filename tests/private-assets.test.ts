import { describe, expect, it, vi } from "vitest";
import worker, { privateAssetPathname } from "../workers/private-assets";

function environment(response = new Response("asset")) {
  const fetch = vi.fn(async (request: Request) => {
    void request;
    return response;
  });
  return { env: { ASSETS: { fetch } }, fetch };
}

describe("private asset worker", () => {
  it("maps the private URL space onto the root asset directory", async () => {
    const { env, fetch } = environment();
    const response = await worker.fetch(
      new Request("https://learning.ltfan.top/private/tasks/?view=all"),
      env,
    );

    const forwarded = fetch.mock.calls[0]?.[0];
    if (!forwarded) throw new Error("asset request was not forwarded");
    expect(forwarded.url).toBe("https://learning.ltfan.top/tasks/?view=all");
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(response.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
  });

  it("maps both private home URLs to the asset root", () => {
    expect(privateAssetPathname("/private")).toBe("/");
    expect(privateAssetPathname("/private/")).toBe("/");
  });

  it("restores the private prefix on asset redirects", async () => {
    const { env } = environment(
      new Response(null, {
        status: 301,
        headers: { Location: "/tasks/" },
      }),
    );
    const response = await worker.fetch(
      new Request("https://learning.ltfan.top/private/tasks"),
      env,
    );

    expect(response.headers.get("Location")).toBe(
      "https://learning.ltfan.top/private/tasks/",
    );
  });

  it("rejects paths outside /private", async () => {
    const { env, fetch } = environment();
    const response = await worker.fetch(
      new Request("https://learning.ltfan.top/privateer"),
      env,
    );

    expect(response.status).toBe(404);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("rejects non-read methods", async () => {
    const { env, fetch } = environment();
    const response = await worker.fetch(
      new Request("https://learning.ltfan.top/private/tasks/", {
        method: "POST",
      }),
      env,
    );

    expect(response.status).toBe(405);
    expect(response.headers.get("Allow")).toBe("GET, HEAD");
    expect(fetch).not.toHaveBeenCalled();
  });
});
