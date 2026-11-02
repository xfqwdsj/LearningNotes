import type { ComponentProps, ReactNode } from "react";
import { FileCheck2 } from "lucide-react";
import { ContentDisclosure } from "./content-disclosure";

/** Fixed semantic proof presentation with an optional Markdown subtitle. */
export function ProofDisclosure({
  title,
  children,
  ...props
}: Omit<ComponentProps<"details">, "title" | "children"> & {
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <ContentDisclosure
      {...props}
      className={[
        "mdx-proof",
        ...(props.className?.split(/\s+/).filter(Boolean) ?? []).filter(
          (className) => className !== "mdx-proof",
        ),
      ].join(" ")}
      title={title}
      icon={<FileCheck2 />}
    >
      {children}
    </ContentDisclosure>
  );
}
