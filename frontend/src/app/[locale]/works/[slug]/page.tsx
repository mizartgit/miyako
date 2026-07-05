import Image from "next/image";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/ui/Reveal";
import { DualTitle } from "@/components/ui/DualTitle";
import { EnhancedWorkGallery } from "@/components/work/EnhancedWorkGallery";
import { ProductCommerce } from "@/components/work/ProductCommerce";
import { RelatedWorks } from "@/components/work/RelatedWorks";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getResolvedWorkDisplay } from "@/lib/commerce/medusa/product";
import {
  getArtistForWork,
  getWorkBySlug,
  getWorkSlugs,
  getWorkStory,
} from "@/lib/content";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getWorkSlugs().map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "works" });
  const work = getWorkBySlug(slug);
  if (!work) return { title: t("notFound") };

  const title = work.titleJa
    ? `${work.titleJa} · ${work.title}`
    : work.title;

  return {
    title,
    description: getWorkStory(work, locale),
  };
}

export default async function WorkPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("works");

  const work = getWorkBySlug(slug);
  if (!work) notFound();

  const artist = getArtistForWork(work);
  const { display, commerce } = await getResolvedWorkDisplay(work, locale);
  const story = display.story;

  const headersList = await headers();
  const host = headersList.get("host") ?? "miyako.com";
  const protocol = headersList.get("x-forwarded-proto") ?? "https";
  const shareUrl = `${protocol}://${host}/${locale}/works/${work.slug}`;

  const region = display.region ?? artist?.region;
  const technique = display.technique ?? artist?.craft;

  return (
    <div className="bg-stone pt-[var(--header-height)]">
      <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        {/* ── Product hero ── */}
        <div className="grid gap-16 lg:grid-cols-2">
          <Reveal variant="scale">
            <EnhancedWorkGallery
              images={display.images}
              title={display.titleJa ?? display.title}
            />
          </Reveal>

          <div>
            <Reveal delay={100}>
              {artist && (
                <Link
                  href={`/artists/${artist.slug}`}
                  className="link-underline inline-block text-[10px] uppercase tracking-[0.3em] text-gold-muted transition-colors duration-500 hover:text-gold"
                >
                  <DualTitle
                    nameJa={artist.nameJa}
                    nameEn={`${artist.name} · ${artist.region}`}
                    subClassName="mt-0.5 block text-[10px] font-normal normal-case tracking-[0.3em] opacity-80"
                  />
                </Link>
              )}
              <h1 className="mt-4 font-serif text-4xl text-charcoal md:text-5xl">
                <DualTitle nameJa={display.titleJa ?? undefined} nameEn={display.title} />
              </h1>
            </Reveal>

            <Reveal delay={180}>
              <dl className="mt-10 space-y-4 border-t border-charcoal/10 pt-10 text-sm">
                {region && (
                  <div className="flex gap-4">
                    <dt className="w-28 shrink-0 text-[10px] uppercase tracking-[0.2em] text-gold-muted">
                      {t("region")}
                    </dt>
                    <dd className="text-charcoal/80">{region}</dd>
                  </div>
                )}
                {technique && (
                  <div className="flex gap-4">
                    <dt className="w-28 shrink-0 text-[10px] uppercase tracking-[0.2em] text-gold-muted">
                      {t("technique")}
                    </dt>
                    <dd className="text-charcoal/80">{technique}</dd>
                  </div>
                )}
                <div className="flex gap-4">
                  <dt className="w-28 shrink-0 text-[10px] uppercase tracking-[0.2em] text-gold-muted">
                    {t("material")}
                  </dt>
                  <dd className="text-charcoal/80">{display.material}</dd>
                </div>
                <div className="flex gap-4">
                  <dt className="w-28 shrink-0 text-[10px] uppercase tracking-[0.2em] text-gold-muted">
                    {t("dimensions")}
                  </dt>
                  <dd className="text-charcoal/80">{display.dimensions}</dd>
                </div>
              </dl>
            </Reveal>

            <Reveal delay={260}>
              <div className="mt-10 border-t border-charcoal/10 pt-10">
                <ProductCommerce
                  commerce={commerce}
                  workSlug={work.slug}
                  workTitle={display.title}
                  workTitleJa={display.titleJa}
                  workImage={display.images[0] ?? ""}
                  workMaterial={display.material}
                  workDimensions={display.dimensions}
                  shareUrl={shareUrl}
                />
              </div>
            </Reveal>
          </div>
        </div>

        {/* ── Story ── */}
        <section className="mt-24 border-t border-charcoal/10 pt-16">
          <Reveal>
            <h2 className="text-[10px] uppercase tracking-[0.3em] text-gold-muted">
              {t("story")}
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <div className="mt-8 max-w-3xl space-y-4 text-sm leading-relaxed text-charcoal/80 md:text-base">
              <p>{story}</p>
            </div>
          </Reveal>
        </section>

        {/* ── About the artist ── */}
        {artist && (
          <section className="mt-24 border-t border-charcoal/10 pt-16">
            <Reveal>
              <h2 className="text-[10px] uppercase tracking-[0.3em] text-gold-muted">
                {t("aboutArtist")}
              </h2>
            </Reveal>
            <Reveal delay={80}>
              <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_2fr]">
                <div className="relative aspect-[3/4] max-w-xs overflow-hidden bg-ink/5">
                  <Image
                    src={artist.portrait}
                    alt={artist.name}
                    fill
                    className="object-cover"
                    sizes="320px"
                  />
                </div>
                <div>
                  <h3 className="font-serif text-3xl text-charcoal">
                    <DualTitle nameJa={artist.nameJa} nameEn={artist.name} />
                  </h3>
                  <p className="mt-6 text-sm leading-relaxed text-charcoal/80 md:text-base">
                    {artist.introShort}
                  </p>
                  <Link
                    href={`/artists/${artist.slug}`}
                    className="link-underline mt-8 inline-block text-[10px] uppercase tracking-[0.25em] text-gold transition-colors hover:text-gold-muted"
                  >
                    {t("viewArtistProfile")}
                  </Link>
                </div>
              </div>
            </Reveal>
          </section>
        )}

        {/* ── Care instructions ── */}
        {display.careInstructions && (
          <section className="mt-24 border-t border-charcoal/10 pt-16">
            <Reveal>
              <h2 className="text-[10px] uppercase tracking-[0.3em] text-gold-muted">
                {t("careInstructions")}
              </h2>
            </Reveal>
            <Reveal delay={80}>
              <p className="mt-8 max-w-3xl text-sm leading-relaxed text-charcoal/80 md:text-base">
                {display.careInstructions}
              </p>
            </Reveal>
          </section>
        )}

        {/* ── Related works ── */}
        <div className="mt-24">
          <RelatedWorks work={work} locale={locale} />
        </div>
      </div>
    </div>
  );
}
