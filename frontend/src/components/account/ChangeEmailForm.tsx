"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { signOut } from "next-auth/react";
import { useTransition } from "react";
import { changeEmail } from "@/lib/actions/account-security";

const fieldClass =
  "w-full border-b border-charcoal/20 bg-transparent py-3 text-charcoal outline-none transition-[border-color] duration-500 focus:border-gold";

type ChangeEmailFormProps = {
  currentEmail: string;
  hasPassword: boolean;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
};

export function ChangeEmailForm({
  currentEmail,
  hasPassword,
  onSuccess,
  onError,
}: ChangeEmailFormProps) {
  const t = useTranslations("account");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (!hasPassword) {
    return (
      <p className="text-sm text-charcoal/60">{t("emailChangeUnavailable")}</p>
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await changeEmail({
        currentPassword: form.get("currentPassword") as string,
        newEmail: form.get("newEmail") as string,
      });

      if (!result.success) {
        onError?.(result.error);
        return;
      }

      onSuccess?.(t("emailChangedSignIn"));
      await signOut({ redirect: false });
      router.push("/sign-in");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="text-[10px] uppercase tracking-[0.2em] text-gold-muted">
          {t("currentEmailLabel")}
        </label>
        <p className="py-3 text-charcoal/70">{currentEmail}</p>
      </div>
      <div>
        <label
          htmlFor="newEmail"
          className="text-[10px] uppercase tracking-[0.2em] text-gold-muted"
        >
          {t("newEmailLabel")}
        </label>
        <input
          id="newEmail"
          name="newEmail"
          type="email"
          required
          autoComplete="email"
          className={fieldClass}
        />
      </div>
      <div>
        <label
          htmlFor="emailCurrentPassword"
          className="text-[10px] uppercase tracking-[0.2em] text-gold-muted"
        >
          {t("confirmWithPassword")}
        </label>
        <input
          id="emailCurrentPassword"
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          className={fieldClass}
        />
      </div>
      <p className="text-[11px] leading-relaxed text-charcoal/50">
        {t("emailChangeNotice")}
      </p>
      <button
        type="submit"
        disabled={pending}
        className="border border-gold/50 px-8 py-3 text-[11px] uppercase tracking-[0.25em] text-gold transition-all duration-500 hover:border-gold hover:bg-gold hover:text-ink disabled:opacity-50"
      >
        {pending ? t("updatingEmail") : t("changeEmail")}
      </button>
    </form>
  );
}
