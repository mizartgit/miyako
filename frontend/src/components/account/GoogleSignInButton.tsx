"use client";

import { useTranslations } from "next-intl";
import { signIn } from "next-auth/react";

export function GoogleSignInButton() {
  const t = useTranslations("auth");

  return (
    <button
      type="button"
      onClick={() => signIn("google", { callbackUrl: "/account" })}
      className="block w-full border border-charcoal/20 py-4 text-center text-[11px] uppercase tracking-[0.2em] text-charcoal/70 transition-colors hover:border-gold hover:text-gold"
    >
      {t("googleSignIn")}
    </button>
  );
}
