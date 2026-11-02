"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ImgHTMLAttributes,
  type ReactNode,
} from "react";
import { useTranslations } from "next-intl";
import {
  Controlled as ControlledZoom,
  type ControlledProps,
} from "react-medium-image-zoom";

type ZoomContentProps = Parameters<
  NonNullable<ControlledProps["ZoomContent"]>
>[0];

const ZoomFocusContext = createContext<{
  alt: string;
  restoreFocus: () => void;
} | null>(null);

function ZoomModalContent({ img }: ZoomContentProps) {
  const focus = useContext(ZoomFocusContext);
  const content = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dialog = content.current?.closest<HTMLDialogElement>(
      "dialog[data-rmiz-modal]",
    );
    if (!dialog) return;

    const labelId = dialog.getAttribute("aria-labelledby");
    if (labelId && !dialog.ownerDocument.getElementById(labelId)) {
      const image = dialog.querySelector<HTMLElement>("[data-rmiz-modal-img]");
      if (image) {
        // The library's SVG path creates a wrapper without the label ID used by its dialog.
        image.id = labelId;
        image.setAttribute("role", "img");
        image.setAttribute("aria-label", focus?.alt ?? "");
      } else {
        dialog.removeAttribute("aria-labelledby");
        dialog.setAttribute("aria-label", focus?.alt ?? "");
      }
    }

    const onClose = () => focus?.restoreFocus();
    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, [focus]);

  return (
    <div ref={content} className="image-zoom-modal-content">
      {/* Escape, clicking the image, and scroll gestures close the viewer without a corner control. */}
      {img}
    </div>
  );
}

export function ImageZoom({
  alt,
  children,
}: {
  alt: string;
  children: ReactNode;
}) {
  const t = useTranslations();
  const [zoomed, setZoomed] = useState(false);
  const focusTarget = useRef<HTMLButtonElement | null>(null);
  const openedAt = useRef<string | null>(null);
  const pendingFocus = useRef(false);

  const restoreFocus = useCallback(() => {
    if (!pendingFocus.current) return;
    pendingFocus.current = false;
    const target = focusTarget.current;
    focusTarget.current = null;
    if (openedAt.current === window.location.href && target?.isConnected)
      target.focus({ preventScroll: true });
    openedAt.current = null;
  }, []);

  const handleZoomChange = useCallback<
    NonNullable<ControlledProps["onZoomChange"]>
  >((next, { event }) => {
    if (next) {
      const target = event.target;
      const root =
        target instanceof Element
          ? target.closest<HTMLElement>("[data-rmiz]")
          : null;
      focusTarget.current =
        root?.querySelector<HTMLButtonElement>("[data-rmiz-btn-zoom]") ?? null;
      openedAt.current = window.location.href;
      pendingFocus.current = focusTarget.current !== null;
    }
    setZoomed(next);
  }, []);

  const focusContext = useMemo(
    () => ({ alt, restoreFocus }),
    [alt, restoreFocus],
  );

  return (
    <ZoomFocusContext.Provider value={focusContext}>
      <ControlledZoom
        isZoomed={zoomed}
        onZoomChange={handleZoomChange}
        a11yNameButtonZoom={t("images.zoom")}
        a11yNameButtonUnzoom={t("images.unzoom")}
        classDialog="image-zoom-dialog"
        ZoomContent={ZoomModalContent}
        wrapElement="span"
        zoomMargin={24}
      >
        {children}
      </ControlledZoom>
    </ZoomFocusContext.Provider>
  );
}

export function ZoomableImage(props: ImgHTMLAttributes<HTMLImageElement>) {
  const { alt = "", ...image } = props;
  return (
    <ImageZoom alt={alt}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt={alt} {...image} />
    </ImageZoom>
  );
}
