"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

const links = [
  { href: "/account" as const, key: "profile" as const },
  { href: "/selections" as const, key: "selections" as const },
  { href: "/account/orders" as const, key: "orders" as const },
  { href: "/account/settings" as const, key: "settings" as const },
];

export function AccountNav() {
  const t = useTranslations("account");
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-x-8 gap-y-3 border-b border-charcoal/10 pb-6">
      {links.map(({ href, key }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`text-[11px] uppercase tracking-[0.25em] transition-colors duration-500 ${
              active ? "text-gold" : "text-charcoal/50 hover:text-gold"
            }`}
          >
            {t(key)}
          </Link>
        );
      })}
    </nav>
  );
}
