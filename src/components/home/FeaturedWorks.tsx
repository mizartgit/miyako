import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { getArtistForWork, getPrimaryFeaturedWork } from "@/lib/content";

export function FeaturedWorks() {
  const work = getPrimaryFeaturedWork();
  if (!work) return null;

  const artist = getArtistForWork(work);

  return (
    <section className="bg-stone px-6 py-24 md:py-32">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <p className="text-[10px] uppercase tracking-[0.35em] text-gold-muted">
            Selected Work
          </p>
        </Reveal>

        <Reveal delay={100}>
          <Link
            href={`/works/${work.slug}`}
            className="group mt-10 block"
          >
            <div className="image-zoom relative aspect-[16/10] overflow-hidden bg-ink/5 md:aspect-[2/1]">
              <Image
                src={work.images[0]}
                alt={work.title}
                fill
                className="object-cover"
                sizes="100vw"
                priority
              />
            </div>
          </Link>
        </Reveal>

        <Reveal delay={180}>
          <div className="mt-8 max-w-xl">
            {artist && (
              <p className="text-[10px] uppercase tracking-[0.25em] text-gold-muted">
                {artist.name}
              </p>
            )}
            <Link
              href={`/works/${work.slug}`}
              className="mt-2 inline-block font-serif text-2xl text-charcoal transition-colors duration-500 hover:text-gold md:text-3xl"
            >
              {work.title}
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-charcoal/70 md:text-base">
              {work.story}
            </p>
            <Link
              href={`/works/${work.slug}`}
              className="link-underline mt-6 inline-block text-[11px] uppercase tracking-[0.25em] text-gold-muted transition-colors duration-500 hover:text-gold"
            >
              View piece
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
