import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { AccountNav } from "@/components/account/AccountNav";
import { SignOutButton } from "@/components/account/SignOutButton";
import { Reveal } from "@/components/ui/Reveal";
import { Link } from "@/i18n/navigation";
import { isDbConfigured, prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });
  return { title: t("profile") };
}

export default async function AccountPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("account");

  const session = await auth();
  if (!session?.user?.id) redirect(`/${locale}/sign-in`);

  let selectionsCount = 0;
  let hasPassword = false;

  if (isDbConfigured()) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { passwordHash: true },
    });
    hasPassword = Boolean(user?.passwordHash);

    const agg = await prisma.selection.aggregate({
      where: { userId: session.user.id },
      _sum: { quantity: true },
    });
    selectionsCount = agg._sum.quantity ?? 0;
  }

  return (
    <div className="bg-stone pt-[var(--header-height)]">
      <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <Reveal>
          <p className="text-[10px] uppercase tracking-[0.35em] text-gold-muted">
            {t("accountLabel")}
          </p>
          <h1 className="mt-4 font-serif text-4xl text-charcoal">
            {session.user.name ?? session.user.email}
          </h1>
        </Reveal>

        <Reveal delay={80}>
          <div className="mt-12">
            <AccountNav />
          </div>
        </Reveal>

        <Reveal delay={140}>
          <dl className="mt-12 space-y-6 text-sm">
            <div>
              <dt className="text-[10px] uppercase tracking-[0.2em] text-gold-muted">
                {t("emailLabel")}
              </dt>
              <dd className="mt-2 text-charcoal/80">{session.user.email}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.2em] text-gold-muted">
                {t("selections")}
              </dt>
              <dd className="mt-2">
                <Link href="/selections" className="link-underline text-gold">
                  {t("selectionsCount", { count: selectionsCount })}
                </Link>
              </dd>
            </div>
          </dl>
        </Reveal>

        <Reveal delay={200}>
          <div className="mt-16 border-t border-charcoal/10 pt-10">
            <h2 className="text-[10px] uppercase tracking-[0.3em] text-gold-muted">
              {t("quickActions")}
            </h2>
            <ul className="mt-6 space-y-3 text-sm">
              <li>
                <Link href="/account/settings" className="link-underline text-charcoal/70 hover:text-gold">
                  {t("settings")}
                </Link>
              </li>
              {hasPassword && (
                <>
                  <li>
                    <Link
                      href="/account/settings#security"
                      className="link-underline text-charcoal/70 hover:text-gold"
                    >
                      {t("changePassword")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/account/settings#email"
                      className="link-underline text-charcoal/70 hover:text-gold"
                    >
                      {t("changeEmail")}
                    </Link>
                  </li>
                </>
              )}
              <li>
                <Link href="/account/orders" className="link-underline text-charcoal/70 hover:text-gold">
                  {t("orders")}
                </Link>
              </li>
            </ul>
            <div className="mt-10">
              <SignOutButton />
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
