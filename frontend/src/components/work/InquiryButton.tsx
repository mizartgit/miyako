"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

type InquiryButtonProps = {
  href: string;
  label?: string;
  variant?: "default" | "compact";
};

export function InquiryButton({
  href,
  label,
  variant = "default",
}: InquiryButtonProps) {
  const t = useTranslations("works");
  const text = label ?? t("inquireAboutPiece");

  if (variant === "compact") {
    return (
      <Link
        href={href}
        className="text-[10px] uppercase tracking-[0.2em] text-charcoal/50 transition-colors duration-500 hover:text-gold"
      >
        {text}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="inline-block border border-gold/50 px-8 py-4 text-[11px] uppercase tracking-[0.25em] text-gold transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-gold hover:bg-gold hover:text-ink hover:shadow-[0_8px_32px_rgba(201,169,98,0.25)] active:scale-[0.98]"
    >
      {text}
    </Link>
  );
}
