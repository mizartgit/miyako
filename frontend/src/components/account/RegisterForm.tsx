"use client";

import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { signIn } from "next-auth/react";
import { useState, useTransition } from "react";
import { registerUser } from "@/lib/actions/auth";
import { resolveAuthErrorMessage, resolveSignInErrorMessage } from "@/lib/auth/client-errors";

const fieldClass =
  "w-full border-b border-charcoal/20 bg-transparent py-3 text-charcoal outline-none transition-[border-color] duration-500 focus:border-gold";

export function RegisterForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = new FormData(e.currentTarget);
    const name = form.get("name") as string;
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    startTransition(async () => {
      const result = await registerUser({ name, email, password });

      if (!result.success) {
        setError(
          resolveAuthErrorMessage(t, {
            code: result.code,
            fallback: result.error,
          }),
        );
        return;
      }

      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError(
          resolveSignInErrorMessage(t, signInResult.error) ||
            t("errors.signInAfterRegisterFailed"),
        );
        router.push("/sign-in");
        return;
      }

      router.push("/account");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <label htmlFor="name" className="text-[10px] uppercase tracking-[0.2em] text-gold-muted">
          {t("nameLabel")}
        </label>
        <input id="name" name="name" type="text" required autoComplete="name" className={fieldClass} />
      </div>
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
        {pending ? t("creatingAccount") : t("createAccount")}
      </button>

      <p className="text-center text-sm text-charcoal/60">
        {t("haveAccount")}{" "}
        <Link href="/sign-in" className="link-underline text-gold">
          {t("signIn")}
        </Link>
      </p>
    </form>
  );
}
