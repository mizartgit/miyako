"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import type { Artist } from "@/lib/types";
import { ImageCarousel } from "./ImageCarousel";

type ArtistCardProps = {
  artist: Artist;
};

export function ArtistCard({ artist }: ArtistCardProps) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (window.matchMedia("(hover: none)").matches) {
        if (!expanded) {
          e.preventDefault();
          setExpanded(true);
          return;
        }
      }
      router.push(`/artists/${artist.slug}`);
    },
    [artist.slug, expanded, router],
  );

  const showIntro = hovered || expanded;

  return (
    <article
      className="group relative cursor-pointer overflow-hidden bg-ink"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
    >
      <div className="relative aspect-[3/4]">
        <ImageCarousel
          images={artist.carouselImages}
          alt={artist.name}
          paused={hovered || expanded}
        />

        <div
          className={`absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent transition-opacity duration-500 ${
            showIntro ? "opacity-90" : "opacity-60"
          }`}
        />

        <div className="absolute inset-x-0 bottom-0 p-6">
          <p className="text-[10px] uppercase tracking-[0.3em] text-gold-muted">
            {artist.craft} · {artist.region}
          </p>
          <h2
            className={`mt-2 font-serif text-2xl text-gold transition-all ${
              showIntro ? "underline decoration-gold/50 underline-offset-4" : ""
            }`}
          >
            {artist.name}
          </h2>

          <div
            className={`overflow-hidden transition-all duration-500 ${
              showIntro ? "mt-4 max-h-32 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <p className="text-sm leading-relaxed text-stone/80">
              {artist.introShort}
            </p>
            <Link
              href={`/artists/${artist.slug}`}
              className="mt-3 inline-block text-[10px] uppercase tracking-[0.25em] text-gold hover:text-stone"
              onClick={(e) => e.stopPropagation()}
            >
              View profile
            </Link>
          </div>
        </div>

        {showIntro && (
          <div className="pointer-events-none absolute inset-0 border border-gold/30" />
        )}
      </div>
    </article>
  );
}
