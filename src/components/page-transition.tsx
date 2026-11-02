import { ViewTransition, type ReactNode } from "react";

export function PageTransition({
  identity,
  children,
}: {
  identity: string;
  children: ReactNode;
}) {
  return (
    <ViewTransition
      key={identity}
      name="page-content"
      default="none"
      share={{
        "nav-forward": "page-forward",
        "nav-back": "page-back",
        default: "page-crossfade",
      }}
      enter="page-crossfade"
      exit="page-crossfade"
    >
      {children}
    </ViewTransition>
  );
}
