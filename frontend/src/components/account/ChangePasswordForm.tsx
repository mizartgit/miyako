"use client";

import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { changePassword } from "@/lib/actions/account-security";

const fieldClass =
  "w-full border-b border-charcoal/20 bg-transparent py-3 text-charcoal outline-none transition-[border-color] duration-500 focus:border-gold";

type ChangePasswordFormProps = {
  hasPassword: boolean;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
};

export function ChangePasswordForm({
  hasPassword,
  onSuccess,
  onError,
}: ChangePasswordFormProps) {
  const t = useTranslations("account");
  const [pending, startTransition] = useTransition();

  if (!hasPassword) {
    return (
      <p className="text-sm text-charcoal/60">{t("passwordChangeUnavailable")}</p>
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) {
      onError?.(t("passwordMismatch"));
      return;
    }

    startTransition(async () => {
      const result = await changePassword({
        currentPassword: formData.get("currentPassword") as string,
        newPassword,
      });

      if (!result.success) {
        onError?.(result.error);
        return;
      }

      form.reset();
      onSuccess?.(t("passwordChanged"));
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="currentPassword"
          className="text-[10px] uppercase tracking-[0.2em] text-gold-muted"
        >
          {t("currentPasswordLabel")}
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          className={fieldClass}
        />
      </div>
      <div>
        <label
          htmlFor="newPassword"
          className="text-[10px] uppercase tracking-[0.2em] text-gold-muted"
        >
          {t("newPasswordLabel")}
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={fieldClass}
        />
      </div>
      <div>
        <label
          htmlFor="confirmPassword"
          className="text-[10px] uppercase tracking-[0.2em] text-gold-muted"
        >
          {t("confirmPasswordLabel")}
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={fieldClass}
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="border border-gold/50 px-8 py-3 text-[11px] uppercase tracking-[0.25em] text-gold transition-all duration-500 hover:border-gold hover:bg-gold hover:text-ink disabled:opacity-50"
      >
        {pending ? t("updatingPassword") : t("changePassword")}
      </button>
    </form>
  );
}
