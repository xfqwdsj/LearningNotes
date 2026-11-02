"use client";
import { useTranslations } from "next-intl";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { RichContent } from "./rich-content";
const COLLAPSED_HEIGHT = 128;
const OVERFLOW_THRESHOLD = COLLAPSED_HEIGHT + 1;

export function SummaryPreview({
  html,
  lang,
}: {
  html: string;
  lang?: string;
}) {
  const t = useTranslations();

  const [expanded, setExpanded] = useState(false);
  const [height, setHeight] = useState<number | null>(null);
  const content = useRef<HTMLDivElement>(null);
  const overflow = height !== null && height > OVERFLOW_THRESHOLD;
  const targetHeight =
    height === null
      ? null
      : expanded
        ? height
        : Math.min(height, COLLAPSED_HEIGHT);
  const renderedContent = useMemo(
    () => (
      <RichContent html={html} renderDemos={false} renderDisclosures={false} />
    ),
    [html],
  );

  useEffect(() => {
    const element = content.current;
    if (!element) return;
    let initialized = false;
    const updateHeight = () => {
      const images = [...element.querySelectorAll<HTMLImageElement>("img")];
      if (initialized && images.some((image) => !image.complete)) return;
      initialized = true;
      setHeight(element.scrollHeight);
    };
    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);
    const images = [...element.querySelectorAll<HTMLImageElement>("img")];
    for (const image of images) {
      image.addEventListener("load", updateHeight);
      image.addEventListener("error", updateHeight);
    }
    updateHeight();
    return () => {
      observer.disconnect();
      for (const image of images) {
        image.removeEventListener("load", updateHeight);
        image.removeEventListener("error", updateHeight);
      }
    };
  }, [html]);

  if (!html) return null;
  return (
    <Collapsible
      open={expanded}
      onOpenChange={setExpanded}
      className="summary-preview"
      lang={lang}
      style={
        { "--summary-preview-height": `${COLLAPSED_HEIGHT}px` } as CSSProperties
      }
    >
      <div
        className="summary-preview-viewport"
        data-measured={height !== null}
        data-folded={overflow && !expanded}
        data-overflow={overflow}
        data-expanded={expanded}
        style={targetHeight === null ? undefined : { height: targetHeight }}
      >
        <CollapsibleContent forceMount>
          <div
            ref={content}
            className="summary-preview-content summary-math entry-secondary"
            onFocusCapture={() => {
              if (overflow && !expanded) setExpanded(true);
            }}
          >
            {renderedContent}
          </div>
        </CollapsibleContent>
      </div>
      {overflow && (
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="xs" className="summary-toggle">
            {expanded ? t("summary.collapse") : t("summary.expand")}
            <ChevronDown
              className="size-3"
              style={{ transform: expanded ? "rotate(180deg)" : "none" }}
            />
          </Button>
        </CollapsibleTrigger>
      )}
    </Collapsible>
  );
}
