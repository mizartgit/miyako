import Image from "next/image";
import Link from "next/link";
import { getArtistForWork, getFeaturedWorks } from "@/lib/content";

export function FeaturedWorks() {
  const works = getFeaturedWorks();

  return (
    <section className="bg-stone px-6 py-24 md:py-32">
      <div className="mx-auto max-w-7xl">
        <p className="text-[10px] uppercase tracking-[0.35em] text-gold-muted">
          Selected Works
        </p>
        <h2 className="mt-4 font-serif text-4xl text-charcoal md:text-5xl">
          Pieces of quiet mastery
        </h2>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {works.map((work) => {
            const artist = getArtistForWork(work);
            return (
              <Link
                key={work.slug}
                href={`/works/${work.slug}`}
                className="group"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-ink/5">
                  <Image
                    src={work.images[0]}
                    alt={work.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <div className="mt-4">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-gold-muted">
                    {artist?.name}
                  </p>
                  <p className="mt-1 font-serif text-xl text-charcoal group-hover:text-gold transition-colors">
                    {work.title}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
