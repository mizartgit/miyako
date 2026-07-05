"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useState, useTransition } from "react";
import { requestPasswordReset } from "@/lib/actions/password-reset";
import { useLocale } from "next-intl";

const fieldClass =
  "w-full border-b border-charcoal/20 bg-transparent py-3 text-charcoal outline-none transition-[border-color] duration-500 focus:border-gold";

export function ForgotPasswordForm() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    setError(null);

    const email = new FormData(e.currentTarget).get("email") as string;

    startTransition(async () => {
      const result = await requestPasswordReset(email, locale);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setMessage(t("resetEmailSent"));
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <p className="text-sm leading-relaxed text-charcoal/70">{t("forgotPasswordIntro")}</p>
      <div>
        <label htmlFor="email" className="text-[10px] uppercase tracking-[0.2em] text-gold-muted">
          {t("emailLabel")}
        </label>
        <input id="email" name="email" type="email" required autoComplete="email" className={fieldClass} />
      </div>

      {message && <p className="text-sm text-gold">{message}</p>}
      {error && (
        <p className="text-sm text-charcoal/70" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full border border-charcoal bg-charcoal px-8 py-4 text-[11px] uppercase tracking-[0.25em] text-stone transition-all duration-500 hover:border-gold hover:bg-ink hover:text-gold disabled:opacity-50"
      >
        {pending ? t("sendingReset") : t("sendResetLink")}
      </button>

      <p className="text-center text-sm text-charcoal/60">
        <Link href="/sign-in" className="link-underline text-gold">
          {t("backToSignIn")}
        </Link>
      </p>
    </form>
  );
}
