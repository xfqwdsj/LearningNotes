"use client";

import { usePathname } from "next/navigation";
import type { ComponentProps, ReactNode } from "react";
import { normalizePathname, stripBasePath } from "@/lib/site-path";
import { ReadingSidebar } from "./reading-sidebar";

export type ReadingGroup = Omit<
  ComponentProps<typeof ReadingSidebar>,
  "items"
> & {
  items: ComponentProps<typeof ReadingSidebar>["items"];
};

export function ReadingShell({
  basePath,
  groups,
  children,
}: {
  basePath: string;
  groups: ReadingGroup[];
  children: ReactNode;
}) {
  const pathname = normalizePathname(usePathname(), basePath);
  const group = groups.find((group) =>
    group.items.some(
      (item) => normalizePathname(item.href, basePath) === pathname,
    ),
  );
  return (
    <div className={group ? "reading-shell" : undefined}>
      {group && (
        <ReadingSidebar
          key={group.items.map((item) => item.key).join("|")}
          {...group}
          items={group.items.map((item) => ({
            ...item,
            href: stripBasePath(item.href, basePath),
            current: normalizePathname(item.href, basePath) === pathname,
          }))}
        />
      )}
      {children}
    </div>
  );
}
