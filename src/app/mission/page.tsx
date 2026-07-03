import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mission",
  description:
    "MIYAKO introduces exceptional traditional artisans from across Asia while preserving cultural heritage.",
};

export default function MissionPage() {
  return (
    <div className="pt-[var(--header-height)]">
      <section className="bg-ink px-6 py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[10px] uppercase tracking-[0.35em] text-gold-muted">
            Our Mission
          </p>
          <h1 className="mt-6 font-serif text-4xl leading-tight text-gold md:text-6xl">
            Preserving craft. Introducing masters.
          </h1>
        </div>
      </section>

      <section className="bg-stone px-6 py-20 md:py-28">
        <div className="mx-auto max-w-3xl space-y-8 text-sm leading-relaxed text-charcoal/80 md:text-base">
          <p>
            MIYAKO is a curated platform introducing exceptional traditional
            artisans from across Asia to a global audience. We exist to preserve
            the stories, techniques, and cultural heritage behind every piece —
            not to flood the market with mass-produced goods, but to introduce a
            few masters, deeply.
          </p>
          <p>
            We are not Amazon. We are not Etsy. We are closer to a digital
            museum that also happens to sell artwork — a place where each object
            carries the weight of lineage, labour, and intention.
          </p>
          <p>
            Our artists are selected for mastery, integrity, and the continuity
            of their craft traditions. Many work in small family workshops, some
            for only a handful of clients each year. We give them a wider
            national and global platform while they continue to handle their
            own shipping and fulfilment.
          </p>
        </div>
      </section>

      <section className="bg-ink px-6 py-20 md:py-28">
        <div className="mx-auto max-w-3xl">
          <p className="text-[10px] uppercase tracking-[0.35em] text-gold-muted">
            How it works
          </p>
          <div className="mt-12 space-y-12">
            {[
              {
                step: "01",
                title: "Discover",
                text: "Browse our curated roster of artisans and their works. Each profile tells the story of technique, region, and lineage.",
              },
              {
                step: "02",
                title: "Inquire",
                text: "When a piece speaks to you, send an inquiry. We connect you directly with the artist or studio — no anonymous checkout.",
              },
              {
                step: "03",
                title: "Receive",
                text: "The artist handles shipping and fulfilment. You receive a piece with provenance, story, and the knowledge of who made it.",
              },
            ].map(({ step, title, text }) => (
              <div key={step} className="flex gap-8">
                <span className="font-serif text-3xl text-gold/40">{step}</span>
                <div>
                  <h2 className="font-serif text-2xl text-gold">{title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-stone/60">
                    {text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link
              href="/artists"
              className="text-[11px] uppercase tracking-[0.25em] text-gold hover:text-stone transition-colors border-b border-gold/40 pb-1"
            >
              Meet our artists
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
