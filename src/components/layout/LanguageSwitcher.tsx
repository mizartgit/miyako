"use client";

import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

export function LanguageSwitcher({ solid }: { solid: boolean }) {
  const locale = useLocale();
  const pathname = usePathname();

  const inactiveClass = solid
    ? "text-charcoal/50 hover:text-gold"
    : "text-stone/50 hover:text-gold";

  return (
    <div
      className="flex items-center gap-2 text-[11px] uppercase tracking-[0.15em]"
      aria-label="Language"
    >
      <Link
        href={pathname}
        locale="en"
        className={`transition-colors duration-500 ${
          locale === "en" ? "text-gold" : inactiveClass
        }`}
      >
        EN
      </Link>
      <span className={solid ? "text-charcoal/30" : "text-stone/30"}>|</span>
      <Link
        href={pathname}
        locale="ja"
        className={`transition-colors duration-500 ${
          locale === "ja" ? "text-gold" : inactiveClass
        }`}
      >
        日本語
      </Link>
    </div>
  );
}
