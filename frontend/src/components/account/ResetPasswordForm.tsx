"use client";

import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useState, useTransition } from "react";
import { resetPassword } from "@/lib/actions/password-reset";

const fieldClass =
  "w-full border-b border-charcoal/20 bg-transparent py-3 text-charcoal outline-none transition-[border-color] duration-500 focus:border-gold";

type ResetPasswordFormProps = {
  token: string;
  email: string;
};

export function ResetPasswordForm({ token, email }: ResetPasswordFormProps) {
  const t = useTranslations("auth");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const password = new FormData(e.currentTarget).get("password") as string;

    startTransition(async () => {
      const result = await resetPassword({ email, token, password });
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.push("/sign-in");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <label htmlFor="password" className="text-[10px] uppercase tracking-[0.2em] text-gold-muted">
          {t("newPasswordLabel")}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
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
        {pending ? t("updatingPassword") : t("updatePassword")}
      </button>

      <p className="text-center text-sm text-charcoal/60">
        <Link href="/sign-in" className="link-underline text-gold">
          {t("backToSignIn")}
        </Link>
      </p>
    </form>
  );
}
