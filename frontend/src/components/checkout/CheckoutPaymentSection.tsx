"use client";

import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { useEffect, useState, useTransition } from "react";
import {
  prepareStripeCheckout,
  type CheckoutQuote,
  type PrepareCheckoutResult,
} from "@/lib/actions/checkout";
import { formatMoney } from "@/lib/commerce/currency";
import { StripePaymentForm, type StripeBillingDetails } from "./StripePaymentForm";

const fieldClass =
  "w-full border-b border-charcoal/20 bg-transparent py-3 text-charcoal outline-none transition-[border-color] duration-500 focus:border-gold disabled:cursor-not-allowed disabled:opacity-50";

const alertClass =
  "border border-charcoal/15 px-4 py-3 text-sm leading-relaxed text-charcoal";

const buttonClass =
  "w-full border border-charcoal bg-charcoal px-8 py-4 text-[11px] uppercase tracking-[0.25em] text-stone transition-colors duration-500 hover:border-gold hover:bg-ink hover:text-gold disabled:cursor-not-allowed disabled:opacity-50";

type CheckoutPaymentSectionProps = {
  cartId: string;
  isGuest: boolean;
  onQuote: (quote: CheckoutQuote | null) => void;
  onPendingChange: (pending: boolean) => void;
};

export function CheckoutPaymentSection({
  cartId,
  isGuest,
  onQuote,
  onPendingChange,
}: CheckoutPaymentSectionProps) {
  const t = useTranslations("checkout");
  const { data: session } = useSession();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [email, setEmail] = useState(session?.user?.email ?? "");
  const [billing, setBilling] = useState<StripeBillingDetails | null>(null);
  const [shippingOptionId, setShippingOptionId] = useState<string>("");
  const [shippingOptions, setShippingOptions] = useState<
    { id: string; name: string; amount: number }[]
  >([]);
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);

  useEffect(() => {
    onPendingChange(pending);
  }, [onPendingChange, pending]);

  function handlePrepare(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = new FormData(e.currentTarget);
    const contactEmail = (form.get("email") as string).trim();
    const shippingAddress = {
      first_name: (form.get("first_name") as string).trim(),
      last_name: (form.get("last_name") as string).trim(),
      address_1: (form.get("address_1") as string).trim(),
      city: (form.get("city") as string).trim(),
      postal_code: (form.get("postal_code") as string).trim(),
      country_code: (form.get("country_code") as string).trim().toLowerCase(),
      phone: ((form.get("phone") as string) || undefined)?.trim(),
    };

    onQuote(null);
    setQuote(null);

    startTransition(async () => {
      // A dropped request rejects here; uncaught, it replaces the whole page
      // with the global error screen. Preparing again on the same cart is safe.
      let result: PrepareCheckoutResult;
      try {
        result = await prepareStripeCheckout({
          cartId,
          email: contactEmail,
          shippingAddress,
          shippingOptionId: shippingOptionId || undefined,
        });
      } catch {
        setError(t("prepareFailed"));
        return;
      }

      if (!result.ok) {
        setError(result.error);
        return;
      }

      const nextQuote: CheckoutQuote = {
        currencyCode: result.currencyCode,
        subtotal: result.subtotal,
        shippingAmount: result.shippingAmount,
        shippingName: result.shippingName,
        total: result.total,
      };
      setEmail(contactEmail);
      setBilling({
        name: `${shippingAddress.first_name} ${shippingAddress.last_name}`.trim(),
        phone: shippingAddress.phone || undefined,
        address: {
          line1: shippingAddress.address_1,
          city: shippingAddress.city,
          postal_code: shippingAddress.postal_code,
          country: shippingAddress.country_code.toUpperCase(),
        },
      });
      setShippingOptions(result.shippingOptions);
      if (!shippingOptionId && result.shippingOptions[0]) {
        setShippingOptionId(result.shippingOptions[0].id);
      }
      setQuote(nextQuote);
      onQuote(nextQuote);
      setClientSecret(result.clientSecret);
    });
  }

  if (clientSecret) {
    return (
      <div className="space-y-10">
        <h2 className="text-[10px] uppercase tracking-[0.3em] text-gold-muted">
          {t("paymentTitle")}
        </h2>
        {quote?.shippingName ? (
          <p className="flex items-baseline justify-between gap-6 text-sm">
            <span className="text-charcoal/70">
              {t("shipping")}
              <span className="mt-1 block text-[11px] tracking-wide text-charcoal/45">
                {quote.shippingName}
              </span>
            </span>
            <span className="shrink-0 tabular-nums text-charcoal">
              {formatMoney(quote.shippingAmount, quote.currencyCode)}
            </span>
          </p>
        ) : null}
        {billing ? (
          <StripePaymentForm
            cartId={cartId}
            clientSecret={clientSecret}
            email={email}
            billing={billing}
          />
        ) : null}
      </div>
    );
  }

  return (
    <form onSubmit={handlePrepare} className="space-y-8" aria-busy={pending}>
      <fieldset disabled={pending} className="min-w-0 space-y-8 border-0 p-0">
      <h2 className="text-[10px] uppercase tracking-[0.3em] text-gold-muted">
        {t("shippingTitle")}
      </h2>

      {(isGuest || !session?.user?.email) && (
        <div>
          <label
            htmlFor="checkout-email"
            className="text-[10px] uppercase tracking-[0.2em] text-gold-muted"
          >
            {t("emailLabel")}
          </label>
          <input
            id="checkout-email"
            name="email"
            type="email"
            required
            defaultValue={email}
            autoComplete="email"
            className={fieldClass}
          />
        </div>
      )}

      {!isGuest && session?.user?.email && (
        <input type="hidden" name="email" value={session.user.email} />
      )}

      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <label
            htmlFor="first_name"
            className="text-[10px] uppercase tracking-[0.2em] text-gold-muted"
          >
            {t("firstNameLabel")}
          </label>
          <input
            id="first_name"
            name="first_name"
            required
            autoComplete="given-name"
            className={fieldClass}
          />
        </div>
        <div>
          <label
            htmlFor="last_name"
            className="text-[10px] uppercase tracking-[0.2em] text-gold-muted"
          >
            {t("lastNameLabel")}
          </label>
          <input
            id="last_name"
            name="last_name"
            required
            autoComplete="family-name"
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="address_1"
          className="text-[10px] uppercase tracking-[0.2em] text-gold-muted"
        >
          {t("addressLabel")}
        </label>
        <input
          id="address_1"
          name="address_1"
          required
          autoComplete="address-line1"
          className={fieldClass}
        />
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <label
            htmlFor="city"
            className="text-[10px] uppercase tracking-[0.2em] text-gold-muted"
          >
            {t("cityLabel")}
          </label>
          <input
            id="city"
            name="city"
            required
            autoComplete="address-level2"
            className={fieldClass}
          />
        </div>
        <div>
          <label
            htmlFor="postal_code"
            className="text-[10px] uppercase tracking-[0.2em] text-gold-muted"
          >
            {t("postalCodeLabel")}
          </label>
          <input
            id="postal_code"
            name="postal_code"
            required
            autoComplete="postal-code"
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="country_code"
          className="text-[10px] uppercase tracking-[0.2em] text-gold-muted"
        >
          {t("countryLabel")}
        </label>
        <select
          id="country_code"
          name="country_code"
          required
          defaultValue="jp"
          className={fieldClass}
        >
          <option value="jp">Japan</option>
          <option value="us">United States</option>
          <option value="gb">United Kingdom</option>
          <option value="au">Australia</option>
          <option value="ca">Canada</option>
          <option value="sg">Singapore</option>
          <option value="hk">Hong Kong</option>
          <option value="kr">South Korea</option>
          <option value="fr">France</option>
          <option value="de">Germany</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="phone"
          className="text-[10px] uppercase tracking-[0.2em] text-gold-muted"
        >
          {t("phoneLabel")}
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          className={fieldClass}
        />
      </div>

      {shippingOptions.length > 1 && (
        <div>
          <label
            htmlFor="shipping_option"
            className="text-[10px] uppercase tracking-[0.2em] text-gold-muted"
          >
            {t("shippingMethodLabel")}
          </label>
          <select
            id="shipping_option"
            value={shippingOptionId}
            onChange={(e) => setShippingOptionId(e.target.value)}
            disabled={pending}
            className={fieldClass}
          >
            {shippingOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {error && (
        <p className={alertClass} role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className={buttonClass}
      >
        {pending ? t("preparingPayment") : t("continueToPayment")}
      </button>
      </fieldset>
    </form>
  );
}
