import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/ui/Reveal";
import { DualTitle } from "@/components/ui/DualTitle";
import { InquiryButton } from "@/components/work/InquiryButton";
import { WorkGallery } from "@/components/work/WorkGallery";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
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
  const story = getWorkStory(work, locale);

  return (
    <div className="bg-stone pt-[var(--header-height)]">
      <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <div className="grid gap-16 lg:grid-cols-2">
          <Reveal variant="scale">
            <WorkGallery
              images={work.images}
              title={work.titleJa ?? work.title}
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
                <DualTitle nameJa={work.titleJa} nameEn={work.title} />
              </h1>
            </Reveal>

            <Reveal delay={180}>
              <dl className="mt-10 space-y-4 border-t border-charcoal/10 pt-10 text-sm">
                <div className="flex gap-4">
                  <dt className="w-24 shrink-0 text-[10px] uppercase tracking-[0.2em] text-gold-muted">
                    {t("material")}
                  </dt>
                  <dd className="text-charcoal/80">{work.material}</dd>
                </div>
                <div className="flex gap-4">
                  <dt className="w-24 shrink-0 text-[10px] uppercase tracking-[0.2em] text-gold-muted">
                    {t("dimensions")}
                  </dt>
                  <dd className="text-charcoal/80">{work.dimensions}</dd>
                </div>
              </dl>
            </Reveal>

            <Reveal delay={260}>
              <div className="mt-10 space-y-4 text-sm leading-relaxed text-charcoal/80 md:text-base">
                <p>{story}</p>
              </div>
            </Reveal>

            <Reveal delay={340}>
              <div className="mt-12">
                <InquiryButton href={`/contact?work=${work.slug}`} />
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  );
}
