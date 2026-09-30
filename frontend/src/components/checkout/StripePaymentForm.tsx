"use client";

import {
  PaymentElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useLocale, useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { completeStripeCheckout } from "@/lib/actions/checkout";
import { getStripePublishableKey } from "@/lib/commerce/stripe";
import { useSelections } from "@/contexts/SelectionsContext";

export type StripeBillingDetails = {
  name: string;
  phone?: string;
  address: {
    line1: string;
    city: string;
    postal_code: string;
    country: string;
  };
};

const stripePromise = loadStripe(getStripePublishableKey());

type StripePaymentFormProps = {
  cartId: string;
  clientSecret: string;
  email: string;
  billing: StripeBillingDetails;
};

function StripeCheckoutForm({
  cartId,
  email,
  billing,
}: StripePaymentFormProps) {
  const t = useTranslations("checkout");
  const locale = useLocale();
  const router = useRouter();
  const { clear } = useSelections();
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const submitting = useRef(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements || submitting.current) return;

    submitting.current = true;
    setError(null);

    try {
      // Collect the card while the button is still enabled. Disabling it
      // first leaves confirmPayment waiting on the Payment Element forever.
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message ?? t("paymentFailed"));
        return;
      }

      setPending(true);

      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/${locale}/checkout/success?cart_id=${cartId}`,
          // billingDetails is "never" on the Payment Element, so Stripe rejects
          // the confirm unless every field is present — empty when not collected.
          payment_method_data: {
            billing_details: {
              email,
              name: billing.name,
              phone: billing.phone ?? "",
              address: {
                line1: billing.address.line1,
                line2: "",
                city: billing.address.city,
                state: "",
                postal_code: billing.address.postal_code,
                country: billing.address.country,
              },
            },
          },
        },
        redirect: "if_required",
      });

      if (stripeError) {
        setError(stripeError.message ?? t("paymentFailed"));
        return;
      }

      const status = paymentIntent?.status;
      if (
        status &&
        status !== "succeeded" &&
        status !== "requires_capture" &&
        status !== "processing"
      ) {
        setError(t("paymentFailed"));
        return;
      }

      let result = await completeStripeCheckout(cartId);
      if (!result.ok) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        result = await completeStripeCheckout(cartId);
      }
      if (!result.ok) {
        setError(result.error);
        return;
      }

      clear();
      router.push(
        `/checkout/success?order_id=${result.orderId}${
          result.displayId != null ? `&display_id=${result.displayId}` : ""
        }`,
      );
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : t("paymentFailed"));
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <PaymentElement
        options={{
          layout: "tabs",
          fields: {
            billingDetails: "never",
          },
        }}
      />

      {error && (
        <p
          className="border border-charcoal/15 px-4 py-3 text-sm leading-relaxed text-charcoal"
          role="alert"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!stripe || !elements || pending}
        aria-busy={pending}
        className="w-full border border-charcoal bg-charcoal px-8 py-4 text-[11px] uppercase tracking-[0.25em] text-stone transition-colors duration-500 hover:border-gold hover:bg-ink hover:text-gold disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? t("processingPayment") : t("placeOrder")}
      </button>
    </form>
  );
}

export function StripePaymentForm(props: StripePaymentFormProps) {
  const t = useTranslations("checkout");

  if (!getStripePublishableKey()) {
    return <p className="text-sm text-charcoal/70">{t("stripeNotConfigured")}</p>;
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret: props.clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#8b7355",
            colorText: "#2a2826",
            fontFamily: "system-ui, sans-serif",
          },
        },
      }}
    >
      <StripeCheckoutForm {...props} />
    </Elements>
  );
}
