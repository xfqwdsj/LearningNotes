import { useTranslations } from "next-intl";
import { Badge } from "../ui/badge";

/** Optional textbook number, rendered as a quiet scope tag rather than a second heading. */
export function OriginalNumber({ value }: { value: string }) {
  const t = useTranslations();
  const label = t("learning.originalNumberTitle", { number: value });
  return (
    <Badge
      variant="outline"
      className="original-number"
      title={label}
      aria-label={label}
    >
      <span className="original-number-prefix" aria-hidden="true">
        {t("learning.originalNumberShort")}
      </span>
      <span className="original-number-value">{value}</span>
    </Badge>
  );
}
