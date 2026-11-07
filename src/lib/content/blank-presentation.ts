export interface BlankReferenceValues {
  [key: string]: string;
  marker: string;
  id: string;
}

interface BlankReferenceFormats {
  withHint: (values: BlankReferenceValues & { hint: string }) => string;
  withoutHint: (values: BlankReferenceValues) => string;
}

export function formatBlankReference(
  marker: string,
  id: string,
  hint: string | null | undefined,
  formats: BlankReferenceFormats,
): string {
  const value = hint?.trim();
  return value
    ? formats.withHint({ marker, id, hint: value })
    : formats.withoutHint({ marker, id });
}
