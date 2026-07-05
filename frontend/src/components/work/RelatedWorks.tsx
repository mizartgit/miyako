import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/ui/Reveal";
import { DualTitle } from "@/components/ui/DualTitle";
import { Link } from "@/i18n/navigation";
import {
  getArtistForWork,
  getWorksByArtist,
} from "@/lib/content";
import type { Work } from "@/lib/types";

type RelatedWorksProps = {
  work: Work;
  locale: string;
};

export async function RelatedWorks({ work, locale }: RelatedWorksProps) {
  const t = await getTranslations({ locale, namespace: "works" });
  const related = getWorksByArtist(work.artistSlug)
    .filter((w) => w.slug !== work.slug)
    .slice(0, 3);

  if (related.length === 0) return null;

  return (
    <section className="border-t border-charcoal/10 pt-16">
      <Reveal>
        <h2 className="text-[10px] uppercase tracking-[0.3em] text-gold-muted">
          {t("relatedWorks")}
        </h2>
      </Reveal>

      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((item, i) => {
          const artist = getArtistForWork(item);
          return (
            <Reveal key={item.slug} delay={80 + i * 60}>
              <Link
                href={`/works/${item.slug}`}
                className="group card-lift block"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-ink/5">
                  <Image
                    src={item.images[0]}
                    alt={item.titleJa ?? item.title}
                    fill
                    className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="mt-4">
                  {artist && (
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gold-muted">
                      {artist.nameJa ? (
                        <DualTitle
                          nameJa={artist.nameJa}
                          nameEn={artist.name}
                          subClassName="mt-0.5 block text-[10px] font-normal normal-case tracking-[0.15em] opacity-80"
                        />
                      ) : (
                        artist.name
                      )}
                    </p>
                  )}
                  <h3 className="mt-2 font-serif text-xl text-charcoal">
                    <DualTitle nameJa={item.titleJa} nameEn={item.title} />
                  </h3>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
