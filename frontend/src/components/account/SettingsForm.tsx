"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { signOut } from "next-auth/react";
import { useState, useTransition } from "react";
import { ChangeEmailForm } from "@/components/account/ChangeEmailForm";
import { ChangePasswordForm } from "@/components/account/ChangePasswordForm";
import { SignOutButton } from "@/components/account/SignOutButton";
import {
  deleteAccount,
  updateNotificationPrefs,
  updateProfile,
} from "@/lib/actions/auth";
import { SUPPORTED_CURRENCIES } from "@/lib/commerce/types";

const fieldClass =
  "w-full border-b border-charcoal/20 bg-transparent py-3 text-charcoal outline-none transition-[border-color] duration-500 focus:border-gold";

type SettingsFormProps = {
  user: {
    id: string;
    name: string | null;
    email: string;
    locale: string;
    currency: string;
  };
  hasPassword: boolean;
  prefs: {
    orderUpdates: boolean;
    shippingUpdates: boolean;
    selectionReminders: boolean;
    marketing: boolean;
  } | null;
};

export function SettingsForm({ user, hasPassword, prefs }: SettingsFormProps) {
  const t = useTranslations("account");
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function clearFeedback() {
    setMessage(null);
    setError(null);
  }

  function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    clearFeedback();

    const form = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateProfile({
        userId: user.id,
        name: form.get("name") as string,
        locale: form.get("locale") as string,
        currency: form.get("currency") as string,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setMessage(t("profileSaved"));
      router.refresh();
    });
  }

  function handlePrefsSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    clearFeedback();

    const form = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateNotificationPrefs({
        userId: user.id,
        orderUpdates: form.get("orderUpdates") === "on",
        shippingUpdates: form.get("shippingUpdates") === "on",
        selectionReminders: form.get("selectionReminders") === "on",
        marketing: form.get("marketing") === "on",
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setMessage(t("preferencesSaved"));
    });
  }

  function handleDelete() {
    if (!window.confirm(t("deleteConfirm"))) return;

    startTransition(async () => {
      const result = await deleteAccount(user.id);
      if (!result.success) {
        setError(result.error);
        return;
      }
      await signOut({ callbackUrl: "/" });
    });
  }

  return (
    <div className="space-y-16">
      <form onSubmit={handleProfileSubmit} className="space-y-8">
        <h2 className="text-[10px] uppercase tracking-[0.3em] text-gold-muted">
          {t("profileSection")}
        </h2>
        <div>
          <label htmlFor="name" className="text-[10px] uppercase tracking-[0.2em] text-gold-muted">
            {t("nameLabel")}
          </label>
          <input
            id="name"
            name="name"
            defaultValue={user.name ?? ""}
            className={fieldClass}
          />
        </div>
        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <label htmlFor="locale" className="text-[10px] uppercase tracking-[0.2em] text-gold-muted">
              {t("languageLabel")}
            </label>
            <select id="locale" name="locale" defaultValue={user.locale} className={fieldClass}>
              <option value="en">English</option>
              <option value="ja">日本語</option>
            </select>
          </div>
          <div>
            <label htmlFor="currency" className="text-[10px] uppercase tracking-[0.2em] text-gold-muted">
              {t("currencyLabel")}
            </label>
            <select id="currency" name="currency" defaultValue={user.currency} className={fieldClass}>
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          type="submit"
          disabled={pending}
          className="border border-gold/50 px-8 py-3 text-[11px] uppercase tracking-[0.25em] text-gold transition-all duration-500 hover:border-gold hover:bg-gold hover:text-ink disabled:opacity-50"
        >
          {t("saveProfile")}
        </button>
      </form>

      <section id="security" className="space-y-6 border-t border-charcoal/10 pt-12 scroll-mt-28">
        <h2 className="text-[10px] uppercase tracking-[0.3em] text-gold-muted">
          {t("securitySection")}
        </h2>
        <ChangePasswordForm
          hasPassword={hasPassword}
          onSuccess={(msg) => {
            clearFeedback();
            setMessage(msg);
          }}
          onError={(msg) => {
            clearFeedback();
            setError(msg);
          }}
        />
      </section>

      <section id="email" className="space-y-6 border-t border-charcoal/10 pt-12 scroll-mt-28">
        <h2 className="text-[10px] uppercase tracking-[0.3em] text-gold-muted">
          {t("emailSection")}
        </h2>
        <ChangeEmailForm
          currentEmail={user.email}
          hasPassword={hasPassword}
          onSuccess={(msg) => {
            clearFeedback();
            setMessage(msg);
          }}
          onError={(msg) => {
            clearFeedback();
            setError(msg);
          }}
        />
      </section>

      <form onSubmit={handlePrefsSubmit} className="space-y-6 border-t border-charcoal/10 pt-12">
        <h2 className="text-[10px] uppercase tracking-[0.3em] text-gold-muted">
          {t("notificationsSection")}
        </h2>
        {(
          [
            ["orderUpdates", t("orderUpdates")],
            ["shippingUpdates", t("shippingUpdates")],
            ["selectionReminders", t("selectionReminders")],
            ["marketing", t("marketing")],
          ] as const
        ).map(([name, label]) => (
          <label key={name} className="flex items-center gap-3 text-sm text-charcoal/80">
            <input
              type="checkbox"
              name={name}
              defaultChecked={prefs?.[name] ?? name !== "marketing"}
              className="accent-gold"
            />
            {label}
          </label>
        ))}
        <button
          type="submit"
          disabled={pending}
          className="border border-gold/50 px-8 py-3 text-[11px] uppercase tracking-[0.25em] text-gold transition-all duration-500 hover:border-gold hover:bg-gold hover:text-ink disabled:opacity-50"
        >
          {t("savePreferences")}
        </button>
      </form>

      <section className="border-t border-charcoal/10 pt-12">
        <h2 className="text-[10px] uppercase tracking-[0.3em] text-gold-muted">
          {t("sessionSection")}
        </h2>
        <p className="mt-4 text-sm text-charcoal/60">{t("signOutDescription")}</p>
        <div className="mt-6">
          <SignOutButton variant="primary" />
        </div>
      </section>

      <div className="border-t border-charcoal/10 pt-12">
        <h2 className="text-[10px] uppercase tracking-[0.3em] text-gold-muted">
          {t("dangerZone")}
        </h2>
        <p className="mt-4 text-sm text-charcoal/60">{t("deleteDescription")}</p>
        <button
          type="button"
          onClick={handleDelete}
          disabled={pending}
          className="mt-6 border border-charcoal/30 px-8 py-3 text-[11px] uppercase tracking-[0.25em] text-charcoal/60 transition-colors hover:border-charcoal hover:text-charcoal disabled:opacity-50"
        >
          {t("deleteAccount")}
        </button>
      </div>

      {message && <p className="text-sm text-gold">{message}</p>}
      {error && (
        <p className="text-sm text-charcoal/70" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
