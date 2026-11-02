"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { ExternalLink } from "lucide-react";
import type { ImageRegionData } from "@/lib/content/learning-types";
import { ImageZoom } from "./image-zoom";

const dimensions = new Map<string, { width: number; height: number }>();

export function ImageRegion({ region }: { region: ImageRegionData }) {
  const t = useTranslations();
  const [measured, setMeasured] = useState<{
    src: string;
    width: number;
    height: number;
  } | null>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const size =
    measured?.src === region.src
      ? measured
      : (dimensions.get(region.src) ?? null);
  const measure = useCallback(
    (image: HTMLImageElement | null) => {
      if (!image?.naturalWidth || !image.naturalHeight) return;
      const known = dimensions.get(region.src) ?? {
        width: image.naturalWidth,
        height: image.naturalHeight,
      };
      dimensions.set(region.src, known);
      setMeasured({ src: region.src, ...known });
      setFailedSrc(null);
    },
    [region.src],
  );

  const alt = region.alt || t("learning.imageRegion");
  const ratio = size
    ? (size.width * region.width) / (size.height * region.height)
    : region.width / region.height;
  const cropWidth = size ? (size.width * region.width) / 100 : 0;
  const cropHeight = size ? (size.height * region.height) / 100 : 0;

  const crop = size ? (
    <svg
      className="image-region-crop"
      role="img"
      aria-label={alt}
      viewBox={`${(size.width * region.x) / 100} ${(size.height * region.y) / 100} ${cropWidth} ${cropHeight}`}
      width={cropWidth}
      height={cropHeight}
      style={{ aspectRatio: ratio }}
    >
      <image
        href={region.src}
        width={size.width}
        height={size.height}
        onError={() => setFailedSrc(region.src)}
      />
    </svg>
  ) : (
    <span className="image-region-preview" style={{ aspectRatio: ratio }}>
      {/* Measure the source with a native image before using it in the SVG crop. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={measure}
        src={region.src}
        alt={alt}
        decoding="async"
        loading="lazy"
        style={{
          width: `${10000 / region.width}%`,
          maxWidth: "none",
          left: `${(-100 * region.x) / region.width}%`,
          top: `${(-100 * region.y) / region.height}%`,
        }}
        onLoad={(event) => measure(event.currentTarget)}
        onError={() => setFailedSrc(region.src)}
      />
    </span>
  );

  return (
    <figure
      className="image-region"
      style={{ width: region.displayWidth, maxWidth: "100%" }}
    >
      {size ? <ImageZoom alt={alt}>{crop}</ImageZoom> : crop}
      {failedSrc === region.src && (
        <p role="status" className="text-muted-foreground text-sm">
          {t("learning.imageError")}
        </p>
      )}
      <figcaption>
        <a href={region.src} target="_blank" rel="noreferrer">
          <span className="link-label">{t("learning.viewOriginal")}</span>
          <ExternalLink className="size-3" />
        </a>
      </figcaption>
    </figure>
  );
}
