"use client";

import Image from "next/image";
import { useState } from "react";

type WorkGalleryProps = {
  images: string[];
  title: string;
};

export function WorkGallery({ images, title }: WorkGalleryProps) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="relative aspect-[4/5] overflow-hidden bg-ink/5">
        <Image
          src={images[active]}
          alt={title}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>
      {images.length > 1 && (
        <div className="mt-4 flex gap-3">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              className={`relative h-16 w-16 overflow-hidden border-2 transition-colors ${
                i === active ? "border-gold" : "border-transparent opacity-60"
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
