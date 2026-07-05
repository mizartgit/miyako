import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/ui/Reveal";
import { DualTitle } from "@/components/ui/DualTitle";
import { InquiryButton } from "@/components/work/InquiryButton";
import type { Artist, Work } from "@/lib/types";

type ArtistProfileProps = {
  artist: Artist;
  works: Work[];
};

export async function ArtistProfile({ artist, works }: ArtistProfileProps) {
  const t = await getTranslations("artists");

  return (
    <article>
      <section className="relative flex min-h-[60vh] items-end overflow-hidden">
        <Image
          src={artist.portrait}
          alt={artist.nameJa ?? artist.name}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
        <div className="relative z-10 w-full px-6 pb-16 pt-32">
          <div className="mx-auto max-w-7xl">
            <Reveal>
              <p className="text-[10px] uppercase tracking-[0.35em] text-gold-muted">
                {artist.craft} · {artist.region}
              </p>
              <h1 className="mt-4 font-serif text-5xl text-gold md:text-7xl">
                <DualTitle nameJa={artist.nameJa} nameEn={artist.name} />
              </h1>
              {artist.yearsOfPractice && (
                <p className="mt-4 text-sm text-stone/60">
                  {artist.yearsOfPractice}
                </p>
              )}
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-stone px-6 py-20 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[1fr_2fr]">
          <Reveal variant="left">
            {artist.pullQuote && (
              <blockquote className="font-serif text-2xl leading-relaxed text-gold md:text-3xl">
                &ldquo;{artist.pullQuote}&rdquo;
              </blockquote>
            )}
          </Reveal>
          <div className="space-y-6 text-sm leading-relaxed text-charcoal/80 md:text-base">
            {artist.introFull.split("\n\n").map((paragraph, i) => (
              <Reveal key={paragraph.slice(0, 40)} delay={i * 80}>
                <p>{paragraph}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink px-6 py-20 md:py-28">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <p className="text-[10px] uppercase tracking-[0.35em] text-gold-muted">
              {t("worksLabel")}
            </p>
            <h2 className="mt-4 font-serif text-3xl text-gold md:text-4xl">
              <DualTitle nameJa={artist.nameJa} nameEn={artist.name} />
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {works.map((work, i) => (
              <Reveal key={work.slug} delay={i * 90} variant="scale">
                <Link href={`/works/${work.slug}`} className="group block">
                  <div className="image-zoom relative aspect-[3/4] overflow-hidden">
                    <Image
                      src={work.images[0]}
                      alt={work.titleJa ?? work.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <div className="mt-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1">
                    <p className="font-serif text-xl text-stone transition-colors duration-500 group-hover:text-gold">
                      <DualTitle
                        nameJa={work.titleJa}
                        nameEn={work.title}
                        subClassName="mt-0.5 block text-sm font-normal opacity-70"
                      />
                    </p>
                    <p className="mt-1 text-xs text-stone/50">{work.material}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>

          <Reveal delay={200}>
            <div className="mt-16 flex justify-center">
              <InquiryButton
                href={`/contact?artist=${artist.slug}`}
                label={t("inquireAboutArtist")}
              />
            </div>
          </Reveal>
        </div>
      </section>
    </article>
  );
}
