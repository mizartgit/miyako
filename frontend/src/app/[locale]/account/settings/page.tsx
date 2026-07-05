import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { AccountNav } from "@/components/account/AccountNav";
import { SettingsForm } from "@/components/account/SettingsForm";
import { Reveal } from "@/components/ui/Reveal";
import { isDbConfigured, prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });
  return { title: t("settings") };
}

export default async function SettingsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("account");

  const session = await auth();
  if (!session?.user?.id) redirect(`/${locale}/sign-in`);

  if (!isDbConfigured()) {
    return (
      <div className="bg-stone pt-[var(--header-height)]">
        <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
          <p className="text-sm text-charcoal/60">{t("dbRequired")}</p>
        </div>
      </div>
    );
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    include: { notificationPrefs: true },
  });

  return (
    <div className="bg-stone pt-[var(--header-height)]">
      <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <Reveal>
          <h1 className="font-serif text-4xl text-charcoal">{t("settings")}</h1>
        </Reveal>

        <Reveal delay={60}>
          <div className="mt-10">
            <AccountNav />
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-16">
            <SettingsForm
              user={{
                id: user.id,
                name: user.name,
                email: user.email,
                locale: user.locale,
                currency: user.currency,
              }}
              hasPassword={Boolean(user.passwordHash)}
              prefs={user.notificationPrefs}
            />
          </div>
        </Reveal>
      </div>
    </div>
  );
}
