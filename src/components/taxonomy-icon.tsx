import { FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
/** SVG is generated from an installed Lucide module during content preparation. */
export function TaxonomyIcon({
  svg,
  className,
}: {
  svg?: string | undefined;
  className?: string;
}) {
  return svg ? (
    <span
      aria-hidden="true"
      className={cn("taxonomy-icon", className)}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  ) : (
    <FolderOpen aria-hidden="true" className={className} />
  );
}
