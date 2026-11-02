import Link from "next/link";
import type { AnchorHTMLAttributes } from "react";
import { hasBasePath, stripBasePath } from "@/lib/site-path";
/** Separate static sites require a full navigation when crossing their base paths. */
export function ScopedLink({
  href,
  base = "",
  children,
  onClick,
  ...props
}: Pick<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  | "className"
  | "lang"
  | "title"
  | "aria-label"
  | "target"
  | "rel"
  | "children"
  | "onClick"
> & {
  href: string;
  base?: string;
}) {
  const local = base ? hasBasePath(href, base) : !hasBasePath(href, "/private");
  return local ? (
    <Link
      {...props}
      {...(onClick ? { onClick } : {})}
      transitionTypes={["nav-forward"]}
      href={base ? stripBasePath(href, base) : href}
    >
      {children}
    </Link>
  ) : (
    <a {...props} {...(onClick ? { onClick } : {})} href={href}>
      {children}
    </a>
  );
}
