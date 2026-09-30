"use client";

import { useTranslations } from "next-intl";
import { signIn, useSession } from "next-auth/react";
import { useState, useTransition } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { resolveSignInErrorMessage } from "@/lib/auth/client-errors";
import { useSelections } from "@/contexts/SelectionsContext";
import { formatMoney } from "@/lib/commerce/currency";
import type { CheckoutQuote } from "@/lib/actions/checkout";
import { CheckoutPaymentSection } from "@/components/checkout/CheckoutPaymentSection";

const fieldClass =
  "w-full border-b border-charcoal/20 bg-transparent py-3 text-charcoal outline-none transition-[border-color] duration-500 focus:border-gold";

const alertClass =
  "border border-charcoal/15 px-4 py-3 text-sm leading-relaxed text-charcoal";

type CheckoutClientProps = {
  cartId?: string;
};

export function CheckoutClient({ cartId }: CheckoutClientProps) {
  const t = useTranslations("checkout");
  const tAuth = useTranslations("auth");
  const { items, subtotalJpy, isReady } = useSelections();
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);
  const [quotePending, setQuotePending] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  const [mode, setMode] = useState<"choose" | "guest">("choose");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const isAuthed = status === "authenticated" && Boolean(session?.user);
  // Payment begins once the visitor has chosen a path (guest or signed-in).
  const proceeded = isAuthed || mode === "guest";

  function handleSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    startTransition(async () => {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(resolveSignInErrorMessage(tAuth, result.error));
        return;
      }

      // Session flips to authenticated; local selections merge automatically.
      router.refresh();
    });
  }

  return (
    <div className="mt-12 grid gap-16 lg:grid-cols-[1fr_20rem]">
      {/* ── Left: how to continue ── */}
      <div>
        {!proceeded ? (
          <div className="space-y-10">
            <button
              type="button"
              onClick={() => setMode("guest")}
              className="w-full border border-charcoal bg-charcoal px-8 py-4 text-[11px] uppercase tracking-[0.25em] text-stone transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-gold hover:bg-ink hover:text-gold active:scale-[0.99]"
            >
              {t("continueAsGuest")}
            </button>

            <div className="flex items-center gap-4">
              <span className="h-px flex-1 bg-charcoal/15" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-charcoal/40">
                {t("or")}
              </span>
              <span className="h-px flex-1 bg-charcoal/15" />
            </div>

            <form onSubmit={handleSignIn} className="space-y-8">
              <h2 className="text-[10px] uppercase tracking-[0.3em] text-gold-muted">
                {t("signInTitle")}
              </h2>
              <div>
                <label htmlFor="email" className="text-[10px] uppercase tracking-[0.2em] text-gold-muted">
                  {t("emailLabel")}
                </label>
                <input id="email" name="email" type="email" required autoComplete="email" className={fieldClass} />
              </div>
              <div>
                <label htmlFor="password" className="text-[10px] uppercase tracking-[0.2em] text-gold-muted">
                  {t("passwordLabel")}
                </label>
                <input id="password" name="password" type="password" required autoComplete="current-password" className={fieldClass} />
              </div>

              <label className="flex items-center gap-3 text-sm text-charcoal/70">
                <input
                  type="checkbox"
                  name="rememberMe"
                  defaultChecked
                  className="accent-gold"
                />
                {t("rememberMe")}
              </label>

              {error && (
                <p className={alertClass} role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={pending}
                aria-busy={pending}
                className="w-full border border-gold/50 px-8 py-4 text-[11px] uppercase tracking-[0.25em] text-gold transition-colors duration-500 hover:border-gold hover:bg-gold hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
              >
                {pending ? t("signingIn") : t("signIn")}
              </button>

              <p className="text-sm text-charcoal/60">
                {t("noAccount")}{" "}
                <Link
                  href="/register"
                  className="link-underline text-gold transition-colors hover:text-gold-muted"
                >
                  {t("createAccount")}
                </Link>
              </p>
            </form>
          </div>
        ) : cartId ? (
          <div className="space-y-6">
            <p className="text-sm text-charcoal/70">
              {isAuthed
                ? t("signedInAs", { email: session?.user?.email ?? "" })
                : t("guestNote")}
            </p>
            <CheckoutPaymentSection
              cartId={cartId}
              isGuest={!isAuthed}
              onQuote={setQuote}
              onPendingChange={setQuotePending}
            />
            <Link href="/selections" className="link-underline text-sm text-gold">
              {t("backToSelections")}
            </Link>
          </div>
        ) : (
          <div className="space-y-6 text-sm text-charcoal/70">
            <p>{t("noCart")}</p>
            <Link href="/selections" className="link-underline text-gold">
              {t("backToSelections")}
            </Link>
          </div>
        )}
      </div>

      {/* ── Right: order summary ── */}
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="border border-charcoal/10 p-8">
          <h2 className="text-[10px] uppercase tracking-[0.3em] text-gold-muted">
            {t("orderSummary")}
          </h2>

          {!isReady ? (
            <p className="mt-6 text-sm text-charcoal/50" aria-live="polite">
              {t("summaryLoading")}
            </p>
          ) : items.length > 0 ? (
            <ul className="mt-8 space-y-5 text-sm">
              {items.map((item) => (
                <li key={item.workSlug} className="flex justify-between gap-6">
                  <span className="text-charcoal/70">
                    {item.titleJa ?? item.title}
                    {item.quantity > 1 ? ` × ${item.quantity}` : ""}
                  </span>
                  <span className="shrink-0 tabular-nums text-charcoal">
                    {item.priceJpy > 0
                      ? formatMoney(item.priceJpy * item.quantity, "JPY")
                      : "—"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-8 text-sm text-charcoal/50">{t("emptySummary")}</p>
          )}

          <dl className="mt-8 space-y-3 border-t border-charcoal/10 pt-6 text-sm">
            <div className="flex items-baseline justify-between gap-6">
              <dt className="text-charcoal/60">{t("subtotal")}</dt>
              <dd className="tabular-nums text-charcoal">
                {quote
                  ? formatMoney(quote.subtotal, quote.currencyCode)
                  : subtotalJpy > 0
                    ? formatMoney(subtotalJpy, "JPY")
                    : "—"}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-6">
              <dt className="text-charcoal/60">
                {t("shipping")}
                {quote?.shippingName ? (
                  <span className="mt-1 block text-[11px] tracking-wide text-charcoal/45">
                    {quote.shippingName}
                  </span>
                ) : null}
              </dt>
              <dd className="shrink-0 tabular-nums text-charcoal">
                {quote
                  ? formatMoney(quote.shippingAmount, quote.currencyCode)
                  : quotePending
                    ? t("preparingPayment")
                    : t("shippingAtPayment")}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-6 border-t border-charcoal/10 pt-4">
              <dt className="font-serif text-base text-charcoal">{t("total")}</dt>
              <dd className="font-serif text-base tabular-nums text-charcoal">
                {quote
                  ? formatMoney(quote.total, quote.currencyCode)
                  : subtotalJpy > 0
                    ? formatMoney(subtotalJpy, "JPY")
                    : "—"}
              </dd>
            </div>
          </dl>
        </div>
      </aside>
    </div>
  );
}
