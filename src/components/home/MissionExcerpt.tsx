import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";

export function MissionExcerpt() {
  return (
    <section className="bg-ink px-6 py-24 md:py-32">
      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <p className="text-[10px] uppercase tracking-[0.35em] text-gold-muted">
            Our Mission
          </p>
        </Reveal>
        <Reveal delay={100}>
          <blockquote className="mt-8 font-serif text-2xl leading-relaxed text-gold md:text-3xl">
            Miyako exists to preserve and celebrate traditional craftsmanship by
            giving exceptional independent artisans across Asia a carefully
            curated platform to share their work, their stories, and their
            heritage with audiences around the world.
          </blockquote>
        </Reveal>
        <Reveal delay={200}>
          <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-8">
            <Link
              href="/mission"
              className="link-underline text-[11px] uppercase tracking-[0.25em] text-gold transition-colors duration-500 hover:text-stone"
            >
              Our philosophy
            </Link>
            <Link
              href="/artists"
              className="link-underline text-[11px] uppercase tracking-[0.25em] text-stone/60 transition-colors duration-500 hover:text-gold"
            >
              Meet the artists
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
