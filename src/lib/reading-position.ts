export interface ReadingPositionSection {
  id: string;
}

export interface ReadingPositionElement {
  getBoundingClientRect(): {
    height: number;
    top: number;
  };
}

export interface ReadingPositionContent<
  Element extends ReadingPositionElement,
> extends ReadingPositionElement {
  contains(element: Element): boolean;
}

export function measureReadingPosition<Element extends ReadingPositionElement>({
  sections,
  content,
  offset,
  viewportHeight,
  atBottom = false,
  resolveHeading,
}: {
  sections: readonly ReadingPositionSection[];
  content: ReadingPositionContent<Element>;
  offset: number;
  viewportHeight: number;
  atBottom?: boolean;
  resolveHeading: (id: string) => Element | null;
}) {
  let active = "";
  for (const section of sections) {
    const heading = resolveHeading(section.id);
    if (!heading || !content.contains(heading)) continue;
    if (!active) active = section.id;
    if (atBottom) {
      active = section.id;
      continue;
    }
    if (heading.getBoundingClientRect().top > offset + 1) break;
    active = section.id;
  }
  const rect = content.getBoundingClientRect();
  const available = Math.max(1, rect.height - (viewportHeight - offset));
  const progress = atBottom
    ? 1
    : Math.min(1, Math.max(0, (offset - rect.top) / available));
  return { active, progress: Math.round(progress * 100) };
}
