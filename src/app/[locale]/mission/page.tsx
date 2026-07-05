import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/ui/Reveal";
import { routing } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "mission" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function MissionPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("mission");

  const philosophyKeys = [
    "philosophyLead",
    "philosophyP1",
    "philosophyP1b",
    "philosophyP2",
    "philosophyP3",
    "philosophyP4",
    "philosophyP5",
  ] as const;

  const steps = [
    { step: "01", title: t("step1Title"), text: t("step1Text") },
    { step: "02", title: t("step2Title"), text: t("step2Text") },
    { step: "03", title: t("step3Title"), text: t("step3Text") },
  ];

  return (
    <div className="pt-[var(--header-height)]">
      <section className="bg-ink px-6 py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="text-[10px] uppercase tracking-[0.35em] text-gold-muted">
              {t("label")}
            </p>
            <p className="mt-8 font-serif text-2xl leading-relaxed text-gold md:text-3xl">
              {t("statement")}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-stone px-6 py-20 md:py-28">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <p className="text-[10px] uppercase tracking-[0.35em] text-gold-muted">
              {t("philosophyLabel")}
            </p>
          </Reveal>
          <div className="mt-10 space-y-6 text-sm leading-relaxed text-charcoal/80 md:text-base">
            {philosophyKeys.map((key, i) => (
              <Reveal key={key} delay={i * 60}>
                <p
                  className={
                    key === "philosophyLead"
                      ? "font-serif text-2xl text-charcoal md:text-3xl"
                      : undefined
                  }
                >
                  {t(key)}
                </p>
              </Reveal>
            ))}
            <Reveal delay={philosophyKeys.length * 60}>
              <p className="pt-4 font-serif text-xl leading-relaxed text-charcoal md:text-2xl">
                {t("philosophyClosingLead")}
                <br />
                <span className="text-gold-muted">{t("philosophyClosing")}</span>
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-ink px-6 py-20 md:py-28">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <p className="text-[10px] uppercase tracking-[0.35em] text-gold-muted">
              {t("howItWorksLabel")}
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
                {t("meetArtistsLink")}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
