import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/ui/Reveal";
import { InquiryButton } from "@/components/work/InquiryButton";
import { WorkGallery } from "@/components/work/WorkGallery";
import {
  getArtistForWork,
  getWorkBySlug,
  getWorkSlugs,
} from "@/lib/content";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getWorkSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const work = getWorkBySlug(slug);
  if (!work) return { title: "Work Not Found" };

  return {
    title: work.title,
    description: work.story,
  };
}

export default async function WorkPage({ params }: Props) {
  const { slug } = await params;
  const work = getWorkBySlug(slug);
  if (!work) notFound();

  const artist = getArtistForWork(work);

  return (
    <div className="bg-stone pt-[var(--header-height)]">
      <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <div className="grid gap-16 lg:grid-cols-2">
          <Reveal variant="scale">
            <WorkGallery images={work.images} title={work.title} />
          </Reveal>

          <div>
            <Reveal delay={100}>
              {artist && (
                <Link
                  href={`/artists/${artist.slug}`}
                  className="link-underline inline-block text-[10px] uppercase tracking-[0.3em] text-gold-muted transition-colors duration-500 hover:text-gold"
                >
                  {artist.name} · {artist.region}
                </Link>
              )}
              <h1 className="mt-4 font-serif text-4xl text-charcoal md:text-5xl">
                {work.title}
              </h1>
            </Reveal>

            <Reveal delay={180}>
              <dl className="mt-10 space-y-4 border-t border-charcoal/10 pt-10 text-sm">
                <div className="flex gap-4">
                  <dt className="w-24 shrink-0 text-[10px] uppercase tracking-[0.2em] text-gold-muted">
                    Material
                  </dt>
                  <dd className="text-charcoal/80">{work.material}</dd>
                </div>
                <div className="flex gap-4">
                  <dt className="w-24 shrink-0 text-[10px] uppercase tracking-[0.2em] text-gold-muted">
                    Dimensions
                  </dt>
                  <dd className="text-charcoal/80">{work.dimensions}</dd>
                </div>
              </dl>
            </Reveal>

            <Reveal delay={260}>
              <div className="mt-10 space-y-4 text-sm leading-relaxed text-charcoal/80 md:text-base">
                <p>{work.story}</p>
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
