"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";

type WorkGalleryProps = {
  images: string[];
  title: string;
};

export function WorkGallery({ images, title }: WorkGalleryProps) {
  const t = useTranslations("works");
  const [active, setActive] = useState(0);
  const [prev, setPrev] = useState(0);

  function selectImage(i: number) {
    if (i === active) return;
    setPrev(active);
    setActive(i);
  }

  return (
    <div>
      <div className="relative aspect-[4/5] overflow-hidden bg-ink/5">
        {images.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt={title}
            fill
            priority={i === 0}
            className={`object-cover transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              i === active
                ? "scale-100 opacity-100"
                : i === prev
                  ? "scale-105 opacity-0"
                  : "scale-100 opacity-0"
            }`}
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        ))}
      </div>
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
  );
}
