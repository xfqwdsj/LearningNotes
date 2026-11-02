import type { ComponentPropsWithRef } from "react";
import { cn } from "@/lib/utils";
export function HomeSection({
  className,
  children,
  ...props
}: ComponentPropsWithRef<"section">) {
  return (
    <section {...props} className={cn("home-section home-reveal", className)}>
      {children}
    </section>
  );
}
