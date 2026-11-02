import { describe, expect, it } from "vitest";
import { measureReadingPosition } from "@/lib/reading-position";

function element(top: number, height = 40) {
  return { getBoundingClientRect: () => ({ top, height }) };
}

describe("reading position", () => {
  it("selects the last heading at or above the reading offset", () => {
    const headings = new Map([
      ["intro", element(-200)],
      ["details", element(80)],
      ["summary", element(600)],
    ]);
    expect(
      measureReadingPosition({
        sections: [...headings.keys()].map((id) => ({ id })),
        content: {
          ...element(0, 2000),
          contains: (heading) => [...headings.values()].includes(heading),
        },
        offset: 100,
        viewportHeight: 900,
        resolveHeading: (id) => headings.get(id) ?? null,
      }),
    ).toEqual({ active: "details", progress: 8 });
  });

  it("skips detached headings instead of treating them as the page start", () => {
    const attached = element(60);
    const detached = element(0);
    const headings = new Map([
      ["intro", attached],
      ["replaced", detached],
      ["summary", element(800)],
    ]);
    expect(
      measureReadingPosition({
        sections: [...headings.keys()].map((id) => ({ id })),
        content: {
          ...element(0, 2000),
          contains: (heading) => heading === attached,
        },
        offset: 100,
        viewportHeight: 900,
        resolveHeading: (id) => headings.get(id) ?? null,
      }).active,
    ).toBe("intro");
  });

  it("selects the last attached heading at the page bottom", () => {
    const headings: [string, ReturnType<typeof element>][] = [
      ["intro", element(-600)],
      ["details", element(-300)],
      ["summary", element(500)],
    ];
    const resolved = new Map(headings);
    expect(
      measureReadingPosition({
        sections: [...resolved.keys()].map((id) => ({ id })),
        content: {
          ...element(0, 2000),
          contains: (heading) =>
            [...resolved.values()].some((value) => value === heading),
        },
        offset: 100,
        viewportHeight: 900,
        atBottom: true,
        resolveHeading: (id) => resolved.get(id) ?? null,
      }),
    ).toEqual({ active: "summary", progress: 100 });
  });
});
