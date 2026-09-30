import type { Metadata } from "next";
import Image from "next/image";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { AccountNav } from "@/components/account/AccountNav";
import { Reveal } from "@/components/ui/Reveal";
import { Link } from "@/i18n/navigation";
import { formatMoney } from "@/lib/commerce/currency";
import { retrieveOrder, type OrderDetail } from "@/lib/commerce/medusa/order";
import { isDbConfigured, prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string; orderId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });
  return { title: t("orders") };
}

export default async function OrderDetailPage({ params }: Props) {
  const { locale, orderId } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("account");
  const format = await getFormatter();

  const session = await auth();
  if (!session?.user?.id) redirect(`/${locale}/sign-in`);

  // Medusa serves any order by ID, so ownership must be confirmed here first.
  const mirror = isDbConfigured()
    ? await prisma.orderMirror.findFirst({
        where: { medusaOrderId: orderId, userId: session.user.id },
        select: { medusaOrderId: true, medusaDisplayId: true },
      })
    : null;
  if (!mirror) notFound();

  let order: OrderDetail | null = null;
  try {
    order = await retrieveOrder(mirror.medusaOrderId);
  } catch (err) {
    console.error(
      `[account] Order detail fetch failed for ${mirror.medusaOrderId}:`,
      err instanceof Error ? err.message : err,
    );
  }

  const orderNumber =
    order?.displayId != null
      ? String(order.displayId)
      : (mirror.medusaDisplayId ?? mirror.medusaOrderId);

  const statusLabel = (group: string, value: string) =>
    value && t.has(`${group}.${value}`) ? t(`${group}.${value}`) : value;

  const money = (amount: number) =>
    formatMoney(amount, order?.currencyCode ?? "JPY");

  const address = order?.shippingAddress;
  const countryName = address?.countryCode
    ? (new Intl.DisplayNames([locale], { type: "region" }).of(
        address.countryCode.toUpperCase(),
      ) ?? address.countryCode.toUpperCase())
    : "";

  return (
    <div className="bg-stone pt-[var(--header-height)]">
      <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <Reveal>
          <Link
            href="/account/orders"
            className="link-underline text-[10px] uppercase tracking-[0.3em] text-gold-muted"
          >
            {t("backToOrders")}
          </Link>
          <h1 className="mt-6 font-serif text-4xl text-charcoal">
            {t("orderNumber", { number: orderNumber })}
          </h1>
        </Reveal>

        <Reveal delay={60}>
          <div className="mt-10">
            <AccountNav />
          </div>
        </Reveal>

        {!order ? (
          <Reveal delay={120}>
            <p className="mt-16 text-sm leading-relaxed text-charcoal/60">
              {t("orderUnavailable")}
            </p>
          </Reveal>
        ) : (
          <>
            <Reveal delay={120}>
              <dl className="mt-16 grid grid-cols-2 gap-6 text-sm md:grid-cols-4">
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.2em] text-gold-muted">
                    {t("orderDate")}
                  </dt>
                  <dd className="mt-2 text-charcoal/80">
                    {format.dateTime(new Date(order.createdAt), {
                      dateStyle: "long",
                      timeZone: "Asia/Tokyo",
                    })}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.2em] text-gold-muted">
                    {t("orderStatus")}
                  </dt>
                  <dd className="mt-2 text-charcoal/80">
                    {statusLabel("orderStatusLabels", order.status)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.2em] text-gold-muted">
                    {t("paymentStatus")}
                  </dt>
                  <dd className="mt-2 text-charcoal/80">
                    {statusLabel("paymentStatusLabels", order.paymentStatus)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.2em] text-gold-muted">
                    {t("fulfillmentStatus")}
                  </dt>
                  <dd className="mt-2 text-charcoal/80">
                    {statusLabel("fulfillmentStatusLabels", order.fulfillmentStatus)}
                  </dd>
                </div>
              </dl>
            </Reveal>

            <Reveal delay={180}>
              <section className="mt-16 border-t border-charcoal/10 pt-10">
                <h2 className="font-serif text-2xl text-charcoal">
                  {t("orderItems")}
                </h2>
                <ul className="mt-8 divide-y divide-charcoal/10 border-y border-charcoal/10">
                  {order.items.map((item) => (
                    <li key={item.id} className="flex gap-6 py-6 text-sm">
                      <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-charcoal/5">
                        {item.thumbnail && (
                          <Image
                            src={item.thumbnail}
                            alt={item.title}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col justify-between gap-4 sm:flex-row">
                        <div>
                          <p className="font-serif text-lg text-charcoal">{item.title}</p>
                          {item.variantTitle && (
                            <p className="mt-1 text-charcoal/60">{item.variantTitle}</p>
                          )}
                          <p className="mt-3 text-charcoal/60">
                            {t("quantityLabel")}: {item.quantity}
                            <span className="mx-2 text-charcoal/30">·</span>
                            {t("unitPriceLabel")}: {money(item.unitPrice)}
                          </p>
                        </div>
                        <p className="text-charcoal sm:text-right">{money(item.subtotal)}</p>
                      </div>
                    </li>
                  ))}
                </ul>

                <dl className="mt-8 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-charcoal/60">{t("orderSubtotal")}</dt>
                    <dd className="text-charcoal">{money(order.itemSubtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-charcoal/60">{t("orderShipping")}</dt>
                    <dd className="text-charcoal">{money(order.shippingTotal)}</dd>
                  </div>
                  <div className="flex justify-between border-t border-charcoal/10 pt-4">
                    <dt className="font-serif text-lg text-charcoal">{t("orderTotal")}</dt>
                    <dd className="font-serif text-lg text-charcoal">{money(order.total)}</dd>
                  </div>
                </dl>
              </section>
            </Reveal>

            <Reveal delay={240}>
              <div className="mt-16 grid gap-10 border-t border-charcoal/10 pt-10 text-sm sm:grid-cols-2">
                <section>
                  <h2 className="text-[10px] uppercase tracking-[0.3em] text-gold-muted">
                    {t("shippingAddress")}
                  </h2>
                  {address && (
                    <address className="mt-4 not-italic leading-relaxed text-charcoal/80">
                      <p>{[address.firstName, address.lastName].filter(Boolean).join(" ")}</p>
                      {address.company && <p>{address.company}</p>}
                      <p>{address.address1}</p>
                      {address.address2 && <p>{address.address2}</p>}
                      <p>
                        {[address.city, address.province, address.postalCode]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                      {countryName && <p>{countryName}</p>}
                    </address>
                  )}
                </section>
                <section>
                  <h2 className="text-[10px] uppercase tracking-[0.3em] text-gold-muted">
                    {t("shippingMethod")}
                  </h2>
                  <ul className="mt-4 space-y-1 text-charcoal/80">
                    {order.shippingMethods.map((method) => (
                      <li key={method.id}>
                        {method.name}
                        <span className="text-charcoal/50"> — {money(method.amount)}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            </Reveal>
          </>
        )}
      </div>
    </div>
  );
}
