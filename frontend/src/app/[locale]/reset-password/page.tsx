import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/ui/Reveal";
import { ResetPasswordForm } from "@/components/account/ResetPasswordForm";
import { routing } from "@/i18n/routing";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string; email?: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: t("resetPasswordTitle") };
}

export default async function ResetPasswordPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { token, email } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("auth");

  if (!token || !email) notFound();

  return (
    <div className="bg-stone pt-[var(--header-height)]">
      <div className="mx-auto max-w-md px-6 py-16 md:py-24">
        <Reveal>
          <h1 className="font-serif text-4xl text-charcoal">{t("resetPasswordTitle")}</h1>
        </Reveal>
        <Reveal delay={100}>
          <div className="mt-12">
            <ResetPasswordForm token={token} email={email} />
          </div>
        </Reveal>
      </div>
    </div>
  );
}
