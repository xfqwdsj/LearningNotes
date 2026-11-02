import { afterEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { regenerationQueue, syncGenerated } from "../scripts/dev-content";
afterEach(() => vi.useRealTimers());
describe("development content generation", () => {
  it("debounces saves, serializes regeneration, and retries after a failed batch", async () => {
    vi.useFakeTimers();
    let finish: (() => void) | undefined;
    const errors: unknown[] = [];
    const run = vi
      .fn<() => Promise<void>>()
      .mockImplementationOnce(
        () =>
          new Promise<void>((resolve) => {
            finish = resolve;
          }),
      )
      .mockRejectedValueOnce(new Error("invalid metadata"))
      .mockResolvedValue(undefined);
    const queue = regenerationQueue(run, (error) => errors.push(error), 10);
    queue.invalidate();
    queue.invalidate();
    await vi.advanceTimersByTimeAsync(10);
    expect(run).toHaveBeenCalledTimes(1);
    queue.invalidate();
    queue.invalidate();
    await vi.advanceTimersByTimeAsync(100);
    expect(run).toHaveBeenCalledTimes(1);
    finish!();
    await vi.advanceTimersByTimeAsync(10);
    expect(run).toHaveBeenCalledTimes(2);
    expect(errors).toHaveLength(1);
    queue.invalidate();
    await vi.advanceTimersByTimeAsync(10);
    expect(run).toHaveBeenCalledTimes(3);
    queue.invalidate();
    queue.close();
    await vi.advanceTimersByTimeAsync(100);
    expect(run).toHaveBeenCalledTimes(3);
  });
  it("publishes changed assets, removes only owned stale files, and defers revision notification", async () => {
    const fixture = await mkdtemp(path.join(tmpdir(), "learning-dev-assets-"));
    try {
      const source = path.join(fixture, "staged"),
        destination = path.join(fixture, "served");
      await mkdir(source);
      await mkdir(destination);
      await writeFile(path.join(source, "index.json"), '{"fresh":true}');
      await writeFile(path.join(source, "revision.json"), '{"revision":"new"}');
      await writeFile(path.join(destination, "index.json"), '{"fresh":false}');
      await writeFile(path.join(destination, "obsolete.md"), "old");
      await writeFile(path.join(destination, "unowned.svg"), "keep");
      await writeFile(
        path.join(destination, "revision.json"),
        '{"revision":"old"}',
      );
      const owned = await syncGenerated(source, destination, [
        "index.json",
        "obsolete.md",
        "revision.json",
      ]);
      expect(await readFile(path.join(destination, "index.json"), "utf8")).toBe(
        '{"fresh":true}',
      );
      expect(
        await readFile(path.join(destination, "unowned.svg"), "utf8"),
      ).toBe("keep");
      await expect(
        readFile(path.join(destination, "obsolete.md")),
      ).rejects.toMatchObject({ code: "ENOENT" });
      expect(
        await readFile(path.join(destination, "revision.json"), "utf8"),
      ).toBe('{"revision":"old"}');
      expect(owned.sort()).toEqual(["index.json", "revision.json"]);
    } finally {
      await rm(fixture, { recursive: true, force: true });
    }
  });
});
