import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Reveal } from "@/components/ui/Reveal";
import { SignInForm } from "@/components/account/SignInForm";
import { GoogleSignInButton } from "@/components/account/GoogleSignInButton";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ callbackUrl?: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: t("signInTitle") };
}

export default async function SignInPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { callbackUrl } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("auth");

  const googleEnabled = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
  );

  return (
    <div className="bg-stone pt-[var(--header-height)]">
      <div className="mx-auto max-w-md px-6 py-16 md:py-24">
        <Reveal>
          <p className="text-[10px] uppercase tracking-[0.35em] text-gold-muted">
            {t("accountLabel")}
          </p>
          <h1 className="mt-4 font-serif text-4xl text-charcoal">{t("signInTitle")}</h1>
        </Reveal>

        <Reveal delay={100}>
          <div className="mt-12">
            <SignInForm callbackUrl={callbackUrl} />
          </div>
        </Reveal>

        {googleEnabled && (
          <Reveal delay={160}>
            <div className="mt-8">
              <div className="relative py-4 text-center">
                <span className="bg-stone px-4 text-[10px] uppercase tracking-[0.2em] text-charcoal/40">
                  {t("orContinueWith")}
                </span>
                <div className="absolute inset-x-0 top-1/2 -z-10 h-px bg-charcoal/10" />
              </div>
              <GoogleSignInButton />
            </div>
          </Reveal>
        )}

        <Reveal delay={200}>
      <p className="mt-10 text-center text-sm text-charcoal/60">
        {t("noAccount")}{" "}
        <Link href="/register" className="link-underline text-gold">
          {t("createAccount")}
        </Link>
      </p>
      <p className="mt-4 text-center text-sm text-charcoal/60">
        <Link href="/forgot-password" className="link-underline text-gold-muted hover:text-gold">
          {t("forgotPasswordLink")}
        </Link>
      </p>
        </Reveal>
      </div>
    </div>
  );
}
