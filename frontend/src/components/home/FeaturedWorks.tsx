import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/ui/Reveal";
import { DualTitle } from "@/components/ui/DualTitle";
import {
  getArtistForWork,
  getPrimaryFeaturedWork,
  getWorkStory,
} from "@/lib/content";

export async function FeaturedWorks() {
  const t = await getTranslations("home");
  const locale = await getLocale();
  const work = getPrimaryFeaturedWork();
  if (!work) return null;

  const artist = getArtistForWork(work);
  const story = getWorkStory(work, locale);

  return (
    <section className="bg-stone px-6 py-24 md:py-32">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <p className="text-[10px] uppercase tracking-[0.35em] text-gold-muted">
            {t("selectedWorkLabel")}
          </p>
        </Reveal>

        <Reveal delay={100}>
          <Link href={`/works/${work.slug}`} className="group mt-10 block">
            <div className="image-zoom relative aspect-[16/10] overflow-hidden bg-ink/5 md:aspect-[2/1]">
              <Image
                src={work.images[0]}
                alt={work.titleJa ?? work.title}
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
              <div className="text-[10px] tracking-[0.25em] text-gold-muted">
                <DualTitle
                  nameJa={artist.nameJa}
                  nameEn={artist.name}
                  subClassName="mt-0.5 block text-[10px] font-normal tracking-[0.25em] opacity-80"
                />
              </div>
            )}
            <Link
              href={`/works/${work.slug}`}
              className="mt-2 inline-block font-serif text-2xl text-charcoal transition-colors duration-500 hover:text-gold md:text-3xl"
            >
              <DualTitle nameJa={work.titleJa} nameEn={work.title} />
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-charcoal/70 md:text-base">
              {story}
            </p>
            <Link
              href={`/works/${work.slug}`}
              className="link-underline mt-6 inline-block text-[11px] uppercase tracking-[0.25em] text-gold-muted transition-colors duration-500 hover:text-gold"
            >
              {t("viewPieceLink")}
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
