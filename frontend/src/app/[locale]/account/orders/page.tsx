import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { AccountNav } from "@/components/account/AccountNav";
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
  return { title: t("orders") };
}

export default async function OrdersPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("account");

  const session = await auth();
  if (!session?.user?.id) redirect(`/${locale}/sign-in`);

  const orders =
    isDbConfigured()
      ? await prisma.orderMirror.findMany({
          where: { userId: session.user.id },
          orderBy: { createdAt: "desc" },
        })
      : [];

  return (
    <div className="bg-stone pt-[var(--header-height)]">
      <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <Reveal>
          <h1 className="font-serif text-4xl text-charcoal">{t("orders")}</h1>
        </Reveal>

        <Reveal delay={60}>
          <div className="mt-10">
            <AccountNav />
          </div>
        </Reveal>

        {orders.length === 0 ? (
          <Reveal delay={120}>
            <p className="mt-16 text-sm leading-relaxed text-charcoal/60">
              {t("ordersEmpty")}
            </p>
          </Reveal>
        ) : (
          <ul className="mt-16 space-y-6">
            {orders.map((order) => (
              <li
                key={order.id}
                className="border border-charcoal/10 p-6 text-sm"
              >
                <p className="font-serif text-lg text-charcoal">
                  {order.medusaDisplayId ?? order.medusaOrderId}
                </p>
                <p className="mt-2 text-charcoal/60">{order.status}</p>
                {order.trackingUrl && (
                  <a
                    href={order.trackingUrl}
                    className="link-underline mt-4 inline-block text-gold"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t("trackOrder")}
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
