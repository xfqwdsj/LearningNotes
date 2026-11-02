import type { AnchorHTMLAttributes, ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { ScopedLink } from "./scoped-link";
import { cn } from "@/lib/utils";
/** Native title link stretches across its entry card; independent controls sit above the hit area. */
export function EntryLink({
  href,
  base,
  className,
  children,
  ...props
}: { href: string; base: string; children: ReactNode } & Pick<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "className" | "lang" | "onClick" | "aria-label"
>) {
  return (
    <ScopedLink
      {...props}
      href={href}
      base={base}
      className={cn("entry-link", className)}
    >
      <span className="link-label entry-link-label">{children}</span>
      <ArrowUpRight className="row-arrow size-4 shrink-0" />
    </ScopedLink>
  );
}
