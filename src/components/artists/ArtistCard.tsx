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
      className="group relative cursor-pointer overflow-hidden bg-ink card-lift"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setExpanded(false);
      }}
      onClick={handleClick}
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <div
          className="absolute inset-0 transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ transform: showIntro ? "scale(1.04)" : "scale(1)" }}
        >
          <ImageCarousel
            images={artist.carouselImages}
            alt={artist.name}
            paused={hovered || expanded}
          />
        </div>

        <div
          className={`absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            showIntro ? "opacity-95" : "opacity-55"
          }`}
        />

        <div className="absolute inset-x-0 bottom-0 p-6">
          <p
            className={`text-[10px] uppercase tracking-[0.3em] text-gold-muted transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              showIntro ? "-translate-y-1" : ""
            }`}
          >
            {artist.craft} · {artist.region}
          </p>
          <h2
            className={`mt-2 font-serif text-2xl text-gold transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              showIntro
                ? "underline decoration-gold/60 underline-offset-[6px]"
                : ""
            }`}
          >
            {artist.name}
          </h2>

          <div
            className={`grid transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              showIntro
                ? "mt-4 grid-rows-[1fr] opacity-100"
                : "mt-0 grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <p className="text-sm leading-relaxed text-stone/85">
                {artist.introShort}
              </p>
              <Link
                href={`/artists/${artist.slug}`}
                className="link-underline mt-4 inline-block text-[10px] uppercase tracking-[0.25em] text-gold transition-colors duration-500 hover:text-stone"
                onClick={(e) => e.stopPropagation()}
              >
                View profile
              </Link>
            </div>
          </div>
        </div>

        <div
          className={`pointer-events-none absolute inset-0 border transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            showIntro
              ? "border-gold/40 opacity-100"
              : "border-transparent opacity-0"
          }`}
        />
      </div>
    </article>
  );
}
