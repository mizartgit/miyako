"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navLinks = [
  { href: "/artists", label: "Artists" },
  { href: "/mission", label: "Mission" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = !isHome || scrolled;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        solid
          ? "border-b border-gold/10 bg-stone/95 backdrop-blur-md"
          : "bg-transparent"
      }`}
      style={{ height: "var(--header-height)" }}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
        <Link
          href="/"
          className={`font-serif text-xl tracking-[0.35em] transition-colors ${
            solid ? "text-charcoal" : "text-gold"
          }`}
        >
          MIYAKO
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-[11px] uppercase tracking-[0.25em] transition-colors ${
                pathname === href || pathname.startsWith(href + "/")
                  ? solid
                    ? "text-gold"
                    : "text-gold"
                  : solid
                    ? "text-charcoal/70 hover:text-gold"
                    : "text-stone/70 hover:text-gold"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          aria-label="Toggle menu"
          className={`flex flex-col gap-1.5 md:hidden ${
            solid ? "text-charcoal" : "text-gold"
          }`}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span
            className={`block h-px w-6 bg-current transition-transform ${menuOpen ? "translate-y-[7px] rotate-45" : ""}`}
          />
          <span
            className={`block h-px w-6 bg-current transition-opacity ${menuOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`block h-px w-6 bg-current transition-transform ${menuOpen ? "-translate-y-[7px] -rotate-45" : ""}`}
          />
        </button>
      </div>

      {menuOpen && (
        <nav className="border-t border-gold/10 bg-stone/98 px-6 py-8 md:hidden">
          <div className="flex flex-col gap-6">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="text-sm uppercase tracking-[0.25em] text-charcoal hover:text-gold"
              >
                {label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
