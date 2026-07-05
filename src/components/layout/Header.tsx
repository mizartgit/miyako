"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { Link, usePathname } from "@/i18n/navigation";

export function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { href: "/artists" as const, label: t("artists") },
    { href: "/mission" as const, label: t("mission") },
    { href: "/contact" as const, label: t("contact") },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const solid = !isHome || scrolled;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,box-shadow,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        solid
          ? "border-b border-gold/10 bg-stone/95 shadow-[0_1px_24px_rgba(12,12,12,0.06)] backdrop-blur-md"
          : "bg-transparent"
      } ${menuOpen ? "translate-y-0" : ""}`}
      style={{ height: "var(--header-height)" }}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-6">
        <Link
          href="/"
          onClick={() => setMenuOpen(false)}
          className={`shrink-0 font-serif text-xl tracking-[0.35em] transition-colors duration-500 ${
            solid ? "text-charcoal hover:text-gold" : "text-gold"
          }`}
        >
          MIYAKO
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <nav className="flex items-center gap-10">
            {navLinks.map(({ href, label }) => {
              const active =
                pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`link-underline text-[11px] uppercase tracking-[0.25em] transition-colors duration-500 ${
                    active
                      ? "text-gold"
                      : solid
                        ? "text-charcoal/70 hover:text-gold"
                        : "text-stone/70 hover:text-gold"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
          <LanguageSwitcher solid={solid} />
        </div>

        <div className="flex items-center gap-4 md:hidden">
          <LanguageSwitcher solid={solid || menuOpen} />
          <button
            type="button"
            aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
            aria-expanded={menuOpen}
            className={`relative z-10 flex h-10 w-10 flex-col items-center justify-center gap-1.5 ${
              solid || menuOpen ? "text-charcoal" : "text-gold"
            }`}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span
              className={`block h-px w-6 bg-current transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                menuOpen ? "translate-y-[5px] rotate-45" : ""
              }`}
            />
            <span
              className={`block h-px w-6 bg-current transition-all duration-400 ${
                menuOpen ? "scale-x-0 opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`block h-px w-6 bg-current transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                menuOpen ? "-translate-y-[5px] -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </div>

      <nav
        aria-hidden={!menuOpen}
        className={`overflow-hidden border-t border-gold/10 bg-stone/98 backdrop-blur-md transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] md:hidden ${
          menuOpen
            ? "max-h-80 opacity-100"
            : "pointer-events-none max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col gap-1 px-6 py-6">
          {navLinks.map(({ href, label }, i) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={`py-3 text-sm uppercase tracking-[0.25em] transition-all duration-500 hover:text-gold ${
                pathname === href || pathname.startsWith(`${href}/`)
                  ? "text-gold"
                  : "text-charcoal"
              } ${menuOpen ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
              style={{
                transitionDelay: menuOpen ? `${80 + i * 60}ms` : "0ms",
              }}
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
