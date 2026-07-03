import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Mission",
  description:
    "Miyako exists to preserve and celebrate traditional craftsmanship by giving exceptional independent artisans across Asia a carefully curated platform.",
};

const philosophy = [
  "We see you.",
  "Behind every handcrafted piece is a lifetime of dedication, generations of knowledge, and a story that deserves to be remembered. Yet many remarkable artisans remain undiscovered outside their local communities.",
  "Miyako was created to change that.",
  "We work with a carefully selected group of independent artists and craftspeople across Asia to preserve traditional craftsmanship and introduce it to audiences who genuinely value handmade work.",
  "Rather than simply selling products, we celebrate the people behind them, their heritage, their techniques, and the cultures they represent.",
  "Every artisan featured on Miyako is thoughtfully curated for the quality of their work, authenticity of their practice, and the story they carry forward.",
];

const steps = [
  {
    step: "01",
    title: "Discover",
    text: "Explore a carefully curated collection of independent artisans. Learn about their craft, heritage, and the stories behind every piece.",
  },
  {
    step: "02",
    title: "Connect",
    text: "When a piece resonates with you, send an inquiry directly through Miyako. We'll connect you with the artisan.",
  },
  {
    step: "03",
    title: "Collect",
    text: "The artisan carefully prepares and ships your piece, arriving with its story and provenance.",
  },
];

export default function MissionPage() {
  return (
    <div className="pt-[var(--header-height)]">
      <section className="bg-ink px-6 py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="text-[10px] uppercase tracking-[0.35em] text-gold-muted">
              Our Mission
            </p>
            <p className="mt-8 font-serif text-2xl leading-relaxed text-gold md:text-3xl">
              Miyako exists to preserve and celebrate traditional craftsmanship
              by giving exceptional independent artisans across Asia a carefully
              curated platform to share their work, their stories, and their
              heritage with audiences around the world.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-stone px-6 py-20 md:py-28">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <p className="text-[10px] uppercase tracking-[0.35em] text-gold-muted">
              Our Philosophy
            </p>
          </Reveal>
          <div className="mt-10 space-y-6 text-sm leading-relaxed text-charcoal/80 md:text-base">
            {philosophy.map((paragraph, i) => (
              <Reveal key={paragraph.slice(0, 30)} delay={i * 60}>
                <p
                  className={
                    paragraph === "We see you."
                      ? "font-serif text-2xl text-charcoal md:text-3xl"
                      : undefined
                  }
                >
                  {paragraph}
                </p>
              </Reveal>
            ))}
            <Reveal delay={philosophy.length * 60}>
              <p className="pt-4 font-serif text-xl leading-relaxed text-charcoal md:text-2xl">
                Our mission is simple:
                <br />
                <span className="text-gold-muted">
                  To ensure exceptional craftsmanship is not only preserved, but
                  appreciated by future generations around the world.
                </span>
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-ink px-6 py-20 md:py-28">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <p className="text-[10px] uppercase tracking-[0.35em] text-gold-muted">
              How it works
            </p>
          </Reveal>
          <div className="mt-12 space-y-12">
            {steps.map(({ step, title, text }, i) => (
              <Reveal key={step} delay={i * 100} variant="left">
                <div className="flex gap-8">
                  <span className="font-serif text-3xl text-gold/40">
                    {step} —
                  </span>
                  <div>
                    <h2 className="font-serif text-2xl text-gold">{title}</h2>
                    <p className="mt-3 text-sm leading-relaxed text-stone/60">
                      {text}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={300}>
            <div className="mt-16 text-center">
              <Link
                href="/artists"
                className="link-underline text-[11px] uppercase tracking-[0.25em] text-gold transition-colors duration-500 hover:text-stone"
              >
                Meet our artists
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
