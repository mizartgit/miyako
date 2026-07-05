"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { signIn } from "next-auth/react";
import { useState, useTransition } from "react";

const fieldClass =
  "w-full border-b border-charcoal/20 bg-transparent py-3 text-charcoal outline-none transition-[border-color] duration-500 focus:border-gold";

export function SignInForm({ callbackUrl }: { callbackUrl?: string }) {
  const t = useTranslations("auth");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const destination =
    callbackUrl?.replace(/^\/(en|ja)/, "") || "/account";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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
        setError(t("invalidCredentials"));
        return;
      }

      router.push(destination);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <label htmlFor="email" className="text-[10px] uppercase tracking-[0.2em] text-gold-muted">
          {t("emailLabel")}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={fieldClass}
        />
      </div>
      <div>
        <label htmlFor="password" className="text-[10px] uppercase tracking-[0.2em] text-gold-muted">
          {t("passwordLabel")}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={fieldClass}
        />
      </div>

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
        {pending ? t("signingIn") : t("signIn")}
      </button>
    </form>
  );
}
