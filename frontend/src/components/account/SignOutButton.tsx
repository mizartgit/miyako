"use client";

import { useTranslations } from "next-intl";
import { signOut } from "next-auth/react";

type SignOutButtonProps = {
  variant?: "primary" | "subtle";
  className?: string;
};

export function SignOutButton({
  variant = "subtle",
  className = "",
}: SignOutButtonProps) {
  const t = useTranslations("nav");

  const styles =
    variant === "primary"
      ? "border border-charcoal bg-charcoal px-8 py-3 text-[11px] uppercase tracking-[0.25em] text-stone transition-all duration-500 hover:border-gold hover:bg-ink hover:text-gold"
      : "text-[11px] uppercase tracking-[0.2em] text-charcoal/50 transition-colors duration-500 hover:text-gold";

  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className={`${styles} ${className}`}
    >
      {t("signOut")}
    </button>
  );
}
