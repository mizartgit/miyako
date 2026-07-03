import Image from "next/image";
import Link from "next/link";
import type { Artist, Work } from "@/lib/types";
import { InquiryButton } from "@/components/work/InquiryButton";

type ArtistProfileProps = {
  artist: Artist;
  works: Work[];
};

export function ArtistProfile({ artist, works }: ArtistProfileProps) {
  return (
    <article>
      <section className="relative flex min-h-[60vh] items-end overflow-hidden">
        <Image
          src={artist.portrait}
          alt={artist.name}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
        <div className="relative z-10 w-full px-6 pb-16 pt-32">
          <div className="mx-auto max-w-7xl">
            <p className="text-[10px] uppercase tracking-[0.35em] text-gold-muted">
              {artist.craft} · {artist.region}
            </p>
            <h1 className="mt-4 font-serif text-5xl text-gold md:text-7xl">
              {artist.name}
            </h1>
            {artist.yearsOfPractice && (
              <p className="mt-4 text-sm text-stone/60">
                {artist.yearsOfPractice}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="bg-stone px-6 py-20 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[1fr_2fr]">
          <div>
            {artist.pullQuote && (
              <blockquote className="font-serif text-2xl leading-relaxed text-gold md:text-3xl">
                &ldquo;{artist.pullQuote}&rdquo;
              </blockquote>
            )}
          </div>
          <div className="space-y-6 text-sm leading-relaxed text-charcoal/80 md:text-base">
            {artist.introFull.split("\n\n").map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink px-6 py-20 md:py-28">
        <div className="mx-auto max-w-7xl">
          <p className="text-[10px] uppercase tracking-[0.35em] text-gold-muted">
            Works
          </p>
          <h2 className="mt-4 font-serif text-3xl text-gold md:text-4xl">
            By {artist.name}
          </h2>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {works.map((work) => (
              <Link
                key={work.slug}
                href={`/works/${work.slug}`}
                className="group"
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image
                    src={work.images[0]}
                    alt={work.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="mt-4">
                  <p className="font-serif text-xl text-stone group-hover:text-gold transition-colors">
                    {work.title}
                  </p>
                  <p className="mt-1 text-xs text-stone/50">{work.material}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-16 flex justify-center">
            <InquiryButton
              href={`/contact?artist=${artist.slug}`}
              label="Inquire about this artist"
            />
          </div>
        </div>
      </section>
    </article>
  );
}
