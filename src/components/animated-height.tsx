"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
/** Animate actual content height without scaling text or holding an obsolete minimum. */
export function AnimatedHeight({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  const content = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>();
  const reduced = useReducedMotion();
  useEffect(() => {
    const element = content.current;
    if (!element) return;
    const observer = new ResizeObserver(() =>
      setHeight(element.getBoundingClientRect().height),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return (
    <motion.div
      id={id}
      className={className}
      initial={false}
      animate={height === undefined ? {} : { height }}
      transition={{
        height: { duration: reduced ? 0 : 0.34, ease: [0.22, 1, 0.36, 1] },
      }}
      style={{ overflow: "hidden" }}
    >
      <div ref={content} className="animated-height-content">
        {children}
      </div>
    </motion.div>
  );
}
