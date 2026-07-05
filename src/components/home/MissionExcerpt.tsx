import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/ui/Reveal";

export async function MissionExcerpt() {
  const t = await getTranslations("home");

  return (
    <section className="bg-ink px-6 py-24 md:py-32">
      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <p className="text-[10px] uppercase tracking-[0.35em] text-gold-muted">
            {t("missionLabel")}
          </p>
        </Reveal>
        <Reveal delay={100}>
          <blockquote className="mt-8 font-serif text-2xl leading-relaxed text-gold md:text-3xl">
            {t("missionStatement")}
          </blockquote>
        </Reveal>
        <Reveal delay={200}>
          <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-8">
            <Link
              href="/mission"
              className="link-underline text-[11px] uppercase tracking-[0.25em] text-gold transition-colors duration-500 hover:text-stone"
            >
              {t("philosophyLink")}
            </Link>
            <Link
              href="/artists"
              className="link-underline text-[11px] uppercase tracking-[0.25em] text-stone/60 transition-colors duration-500 hover:text-gold"
            >
              {t("meetArtistsLink")}
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
