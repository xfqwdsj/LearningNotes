"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

const REVEAL_PADDING = 12;

function revealItem(
  scroller: HTMLElement,
  item: HTMLElement,
  behavior: ScrollBehavior,
  onlyWhenHidden: boolean,
) {
  const scrollerRect = scroller.getBoundingClientRect();
  const itemRect = item.getBoundingClientRect();
  const isVisible =
    itemRect.top >= scrollerRect.top + REVEAL_PADDING &&
    itemRect.bottom <= scrollerRect.bottom - REVEAL_PADDING;
  if (onlyWhenHidden && isVisible) return;

  const top =
    scroller.scrollTop +
    itemRect.top -
    scrollerRect.top -
    (scroller.clientHeight - itemRect.height) / 2;
  scroller.scrollTo({ top, behavior });
}

/**
 * Keeps a desktop reading rail inside its initial viewport and reveals the
 * current document or heading without moving the article itself.
 */
export function useReadingRail(
  activeKey: string,
  itemSelector: string,
  followActive = true,
) {
  const railRef = useRef<HTMLElement>(null);
  const scrollerRef = useRef<HTMLElement>(null);
  const hasRevealed = useRef(false);

  useLayoutEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const stickyTop = Number.parseFloat(getComputedStyle(rail).top) || 0;
      const shell = rail.closest(".reading-shell");
      const navigation = shell?.querySelector(".page-navigation");
      // Use the normal-flow row above the rail: a sticky rail's current rect
      // depends on scroll restoration and cannot describe the initial viewport.
      const initialTop =
        navigation && shell
          ? navigation.getBoundingClientRect().bottom +
            window.scrollY +
            (Number.parseFloat(getComputedStyle(shell).rowGap) || 0)
          : rail.getBoundingClientRect().top + window.scrollY;
      rail.style.setProperty(
        "--reading-rail-offset",
        `${Math.max(stickyTop, initialTop)}px`,
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const observer = new ResizeObserver(schedule);
    const layout = rail.closest(".reading-layout");
    if (layout) observer.observe(layout);
    const pageNavigation = document.querySelector(".page-navigation");
    if (pageNavigation) observer.observe(pageNavigation);
    window.addEventListener("resize", schedule);
    update();
    void document.fonts.ready.then(schedule);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", schedule);
    };
  }, []);

  useEffect(() => {
    if (hasRevealed.current && !followActive) return;
    let frame = 0;
    const reveal = () => {
      frame = 0;
      const scroller = scrollerRef.current;
      const item = scroller?.querySelector<HTMLElement>(itemSelector);
      if (!scroller || !item) return;
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      revealItem(
        scroller,
        item,
        !hasRevealed.current || reduceMotion ? "instant" : "smooth",
        true,
      );
      hasRevealed.current = true;
    };
    const schedule = () => {
      if (!frame)
        frame = requestAnimationFrame(() => {
          frame = requestAnimationFrame(reveal);
        });
    };
    const observer = new ResizeObserver(schedule);
    if (scrollerRef.current) observer.observe(scrollerRef.current);
    const item = scrollerRef.current?.querySelector(itemSelector);
    if (item) observer.observe(item);
    void document.fonts.ready.then(schedule);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [activeKey, itemSelector, followActive]);

  return { railRef, scrollerRef };
}
