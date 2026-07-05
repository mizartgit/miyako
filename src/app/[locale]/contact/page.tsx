import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { InquiryForm } from "@/components/contact/InquiryForm";
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
  const t = await getTranslations({ locale, namespace: "contact" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

function InquiryFormFallback() {
  return (
    <div className="h-96 animate-pulse border border-charcoal/10 bg-charcoal/5" />
  );
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");

  return (
    <div className="bg-stone pt-[var(--header-height)]">
      <section className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-2xl">
          <Reveal>
            <p className="text-[10px] uppercase tracking-[0.35em] text-gold-muted">
              {t("label")}
            </p>
            <h1 className="mt-6 font-serif text-4xl text-charcoal md:text-5xl">
              {t("title")}
            </h1>
          </Reveal>
          <Reveal delay={100}>
            <p className="mt-6 text-sm leading-relaxed text-charcoal/70 md:text-base">
              {t("intro")}
            </p>
          </Reveal>

          <Reveal delay={200}>
            <div className="mt-12">
              <Suspense fallback={<InquiryFormFallback />}>
                <InquiryForm />
              </Suspense>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
