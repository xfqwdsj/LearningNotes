"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  type ReactNode,
  type Ref,
  type RefObject,
} from "react";
import { useComposedRefs } from "@radix-ui/react-compose-refs";

const OverlayTriggerContext =
  createContext<RefObject<HTMLButtonElement | null> | null>(null);

// Each Radix root owns its trigger, including roots nested inside other overlays.
export function OverlayFocusScope({ children }: { children: ReactNode }) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  return (
    <OverlayTriggerContext value={triggerRef}>{children}</OverlayTriggerContext>
  );
}

export function useOverlayTriggerRef(ref: Ref<HTMLButtonElement> | undefined) {
  return useComposedRefs(ref, useContext(OverlayTriggerContext));
}

export function useOverlayFocusReturn(
  ref: Ref<HTMLDivElement> | undefined,
  preferTrigger = false,
) {
  const triggerRef = useContext(OverlayTriggerContext);
  const originRef = useRef<{
    element: HTMLElement | null;
    href: string;
  } | null>(null);
  const outsideRef = useRef(false);
  const capture = useCallback(
    (content: HTMLDivElement | null) => {
      if (!content) return;
      const active = document.activeElement;
      originRef.current = {
        element:
          !preferTrigger &&
          active instanceof HTMLElement &&
          active !== document.body &&
          !content.contains(active)
            ? active
            : (triggerRef?.current ?? null),
        href: location.href,
      };
      outsideRef.current = false;
    },
    [triggerRef, preferTrigger],
  );
  const contentRef = useComposedRefs(ref, capture);
  const onCloseAutoFocus = (event: Event) => {
    if (event.defaultPrevented) return;
    event.preventDefault();
    const origin = originRef.current;
    // Navigation owns focus on the destination; outside interaction owns its new target.
    if (
      !origin ||
      origin.href !== location.href ||
      outsideRef.current ||
      !origin.element?.isConnected
    )
      return;
    origin.element.focus({ preventScroll: true });
  };
  const onInteractOutside = (event: Event) => {
    if (!event.defaultPrevented) outsideRef.current = true;
  };
  return {
    contentRef,
    restoreFocus: onCloseAutoFocus,
    markOutside: onInteractOutside,
  };
}
