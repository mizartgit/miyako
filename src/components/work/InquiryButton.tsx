"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

type InquiryButtonProps = {
  href: string;
  label?: string;
};

export function InquiryButton({ href, label }: InquiryButtonProps) {
  const t = useTranslations("works");
  const text = label ?? t("inquireAboutPiece");

  return (
    <Link
      href={href}
      className="inline-block border border-gold/50 px-8 py-4 text-[11px] uppercase tracking-[0.25em] text-gold transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-gold hover:bg-gold hover:text-ink hover:shadow-[0_8px_32px_rgba(201,169,98,0.25)] active:scale-[0.98]"
    >
      {text}
    </Link>
  );
}
