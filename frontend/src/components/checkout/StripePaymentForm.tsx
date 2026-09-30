"use client";

import {
  PaymentElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { completeStripeCheckout } from "@/lib/actions/checkout";
import { getStripePublishableKey } from "@/lib/commerce/stripe";
import { useSelections } from "@/contexts/SelectionsContext";

const stripePromise = loadStripe(getStripePublishableKey());

type StripePaymentFormProps = {
  cartId: string;
  clientSecret: string;
  email: string;
};

function StripeCheckoutForm({
  cartId,
  clientSecret,
  email,
}: StripePaymentFormProps) {
  const t = useTranslations("checkout");
  const router = useRouter();
  const { clear } = useSelections();
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setPending(true);
    setError(null);

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success?cart_id=${cartId}`,
        payment_method_data: {
          billing_details: { email },
        },
      },
      redirect: "if_required",
    });

    if (stripeError) {
      setError(stripeError.message ?? t("paymentFailed"));
      setPending(false);
      return;
    }

    const result = await completeStripeCheckout(cartId);
    if (!result.ok) {
      setError(result.error);
      setPending(false);
      return;
    }

    clear();
    router.push(
      `/checkout/success?order_id=${result.orderId}${
        result.displayId != null ? `&display_id=${result.displayId}` : ""
      }`,
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <PaymentElement
        options={{
          layout: "tabs",
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
