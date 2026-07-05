import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Reveal } from "@/components/ui/Reveal";
import { ForgotPasswordForm } from "@/components/account/ForgotPasswordForm";
import { routing } from "@/i18n/routing";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: t("forgotPasswordTitle") };
}

export default async function ForgotPasswordPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth");

  return (
    <div className="bg-stone pt-[var(--header-height)]">
      <div className="mx-auto max-w-md px-6 py-16 md:py-24">
        <Reveal>
          <h1 className="font-serif text-4xl text-charcoal">{t("forgotPasswordTitle")}</h1>
        </Reveal>
        <Reveal delay={100}>
          <div className="mt-12">
            <ForgotPasswordForm />
          </div>
        </Reveal>
      </div>
    </div>
  );
}
