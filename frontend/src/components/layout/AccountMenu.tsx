"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { signOut, useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

type AccountMenuProps = {
  solid: boolean;
};

const MENU_ANIM_MS = 280;

type MenuHref =
  | "/sign-in"
  | "/register"
  | "/account"
  | "/account/orders"
  | "/selections"
  | "/account/settings";

type MenuEntry = {
  label: string;
  href?: MenuHref;
  action?: () => void;
};

type MenuItemProps = {
  index: number;
  children: ReactNode;
  onSelect?: () => void;
  href?: MenuHref;
};

function MenuItem({ index, children, onSelect, href }: MenuItemProps) {
  const className =
    "account-menu-item block w-full px-4 py-2.5 text-left text-[11px] uppercase tracking-[0.15em] text-charcoal/70 transition-all duration-300 hover:bg-gold/5 hover:pl-5 hover:text-gold active:scale-[0.98]";

  const style = { animationDelay: `${index * 45}ms` };

  if (href) {
    return (
      <li role="none" style={style} className="account-menu-item">
        <Link role="menuitem" href={href} onClick={onSelect} className={className}>
          {children}
        </Link>
      </li>
    );
  }

  return (
    <li role="none" style={style} className="account-menu-item">
      <button type="button" role="menuitem" onClick={onSelect} className={className}>
        {children}
      </button>
    </li>
  );
}

export function AccountMenu({ solid }: AccountMenuProps) {
  const t = useTranslations("nav");
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateRef = useRef({ open: false, closing: false });

  useEffect(() => {
    stateRef.current = { open, closing };
  }, [open, closing]);

  const iconClass = solid
    ? "text-charcoal/50 group-hover:text-gold"
    : "text-stone/50 group-hover:text-gold";

  const closeMenu = useCallback(() => {
    const { open: isOpen, closing: isClosing } = stateRef.current;
    if (!isOpen || isClosing) return;
    setClosing(true);
    closeTimer.current = setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, MENU_ANIM_MS);
  }, []);

  const toggleMenu = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    if (stateRef.current.open) {
      closeMenu();
    } else {
      setClosing(false);
      setOpen(true);
    }
  }, [closeMenu]);

  useEffect(() => {
    if (!open && !closing) return;

    function onClickOutside(e: MouseEvent) {
      if (ref.current?.contains(e.target as Node)) return;
      closeMenu();
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") closeMenu();
    }

    document.addEventListener("mousedown", onClickOutside, true);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickOutside, true);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open, closing, closeMenu]);

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    [],
  );

  const isLoggedIn = status === "authenticated" && session?.user;
  const showPanel = open || closing;

  const guestItems: MenuEntry[] = [
    { href: "/sign-in", label: t("signIn") },
    { href: "/register", label: t("createAccount") },
  ];

  const authedItems: MenuEntry[] = [
    { href: "/account", label: t("accountOverview") },
    { href: "/account/orders", label: t("orders") },
    { href: "/selections", label: t("selections") },
    { href: "/account/settings", label: t("settings") },
    {
      label: t("signOut"),
      action: () => void signOut({ callbackUrl: "/" }),
    },
  ];

  const items = isLoggedIn ? authedItems : guestItems;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={t("account")}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={toggleMenu}
        className={`group relative transition-all duration-500 ${open ? "text-gold" : iconClass}`}
      >
        <span
          aria-hidden
          className={`absolute -inset-2 rounded-full bg-gold/0 transition-all duration-500 group-hover:bg-gold/5 ${
            open ? "scale-100 bg-gold/10" : "scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100"
          }`}
        />
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden
          className={`relative transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 ${
            open ? "scale-110" : ""
          }`}
        >
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" />
        </svg>
      </button>

      {showPanel && (
        <ul
          role="menu"
          aria-hidden={closing}
          className={`absolute right-0 top-full z-50 mt-2 min-w-[11rem] origin-top-right overflow-hidden border border-gold/15 bg-stone py-2 shadow-[0_12px_40px_rgba(12,12,12,0.1)] backdrop-blur-sm ${
            closing ? "account-menu-out" : "account-menu-in"
          }`}
        >
          {items.map((item, index) =>
            item.action ? (
              <MenuItem
                key={item.label}
                index={index}
                onSelect={() => {
                  closeMenu();
                  item.action?.();
                }}
              >
                {item.label}
              </MenuItem>
            ) : (
              <MenuItem
                key={item.label}
                index={index}
                href={item.href}
                onSelect={closeMenu}
              >
                {item.label}
              </MenuItem>
            ),
          )}
        </ul>
      )}
    </div>
  );
}
