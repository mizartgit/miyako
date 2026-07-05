"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

type EnhancedWorkGalleryProps = {
  images: string[];
  title: string;
};

export function EnhancedWorkGallery({
  images,
  title,
}: EnhancedWorkGalleryProps) {
  const t = useTranslations("works");
  const [active, setActive] = useState(0);
  const [prev, setPrev] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  function selectImage(i: number) {
    if (i === active) return;
    setPrev(active);
    setActive(i);
  }

  const closeFullscreen = useCallback(() => setFullscreen(false), []);

  useEffect(() => {
    if (!fullscreen) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeFullscreen();
      if (e.key === "ArrowRight")
        setActive((i) => {
          setPrev(i);
          return (i + 1) % images.length;
        });
      if (e.key === "ArrowLeft")
        setActive((i) => {
          setPrev(i);
          return (i - 1 + images.length) % images.length;
        });
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [fullscreen, images.length, closeFullscreen]);

  return (
    <>
      <div>
        <button
          type="button"
          onClick={() => setFullscreen(true)}
          aria-label={t("openFullscreen")}
          className="image-zoom group relative block aspect-[4/5] w-full overflow-hidden bg-ink/5"
        >
          {images.map((src, i) => (
            <Image
              key={src}
              src={src}
              alt={title}
              fill
              priority={i === 0}
              className={`object-cover transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                i === active
                  ? "scale-100 opacity-100 group-hover:scale-[1.06]"
                  : i === prev
                    ? "scale-105 opacity-0"
                    : "scale-100 opacity-0"
              }`}
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          ))}
          <span className="pointer-events-none absolute bottom-4 right-4 border border-gold/30 bg-stone/80 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-charcoal/70 opacity-0 backdrop-blur-sm transition-opacity duration-500 group-hover:opacity-100">
            {t("zoomHint")}
          </span>
        </button>

        {images.length > 1 && (
          <div className="mt-4 flex gap-3">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                aria-label={t("viewImage", { index: i + 1 })}
                onClick={() => selectImage(i)}
                className={`relative h-16 w-16 overflow-hidden border-2 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  i === active
                    ? "border-gold opacity-100"
                    : "border-transparent opacity-50 hover:opacity-80"
                }`}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {fullscreen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t("fullscreenGallery")}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/95 p-6"
        >
          <button
            type="button"
            onClick={closeFullscreen}
            aria-label={t("closeFullscreen")}
            className="absolute right-6 top-6 text-[11px] uppercase tracking-[0.25em] text-stone/70 transition-colors hover:text-gold"
          >
            {t("closeFullscreen")}
          </button>

          <div className="relative h-full max-h-[85vh] w-full max-w-5xl">
            <Image
              src={images[active]}
              alt={title}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          {images.length > 1 && (
            <div className="absolute bottom-8 flex gap-4">
              <button
                type="button"
                aria-label={t("previousImage")}
                onClick={() =>
                  selectImage((active - 1 + images.length) % images.length)
                }
                className="border border-gold/30 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-stone/70 hover:text-gold"
              >
                ←
              </button>
              <span className="self-center text-[10px] tracking-[0.2em] text-stone/50">
                {active + 1} / {images.length}
              </span>
              <button
                type="button"
                aria-label={t("nextImage")}
                onClick={() => selectImage((active + 1) % images.length)}
                className="border border-gold/30 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-stone/70 hover:text-gold"
              >
                →
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
