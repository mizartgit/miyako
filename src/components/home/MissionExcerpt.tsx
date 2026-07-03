import Link from "next/link";

export function MissionExcerpt() {
  return (
    <section className="bg-ink px-6 py-24 md:py-32">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-[10px] uppercase tracking-[0.35em] text-gold-muted">
          Our Mission
        </p>
        <blockquote className="mt-8 font-serif text-2xl leading-relaxed text-gold md:text-3xl">
          A curated platform introducing exceptional traditional artisans from
          across Asia to a global audience — preserving the stories, techniques,
          and cultural heritage behind every piece.
        </blockquote>
        <p className="mt-8 text-sm leading-relaxed text-stone/60">
          Not Amazon. Not Etsy. More like a digital museum that also happens to
          sell artwork.
        </p>
        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-8">
          <Link
            href="/mission"
            className="text-[11px] uppercase tracking-[0.25em] text-gold transition-colors border-b border-gold/40 pb-1 hover:text-stone"
          >
            Read our mission
          </Link>
          <Link
            href="/artists"
            className="text-[11px] uppercase tracking-[0.25em] text-stone/60 hover:text-gold transition-colors"
          >
            Meet the artists
          </Link>
        </div>
      </div>
    </section>
  );
}
