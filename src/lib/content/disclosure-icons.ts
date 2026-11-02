import dynamicIconImports from "lucide-react/dynamicIconImports";

export type DisclosureIconName = keyof typeof dynamicIconImports;

export function isDisclosureIconName(
  value: string,
): value is DisclosureIconName {
  return Object.hasOwn(dynamicIconImports, value);
}

export function requireDisclosureIcon(
  value: string | null | undefined,
): DisclosureIconName {
  const icon = value?.trim();
  if (!icon) throw new Error("disclosure requires an icon");
  if (!isDisclosureIconName(icon))
    throw new Error(`Unsupported Lucide icon: ${icon}`);
  return icon;
}
