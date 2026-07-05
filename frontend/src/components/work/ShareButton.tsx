"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

type ShareButtonProps = {
  title: string;
  url: string;
};

export function ShareButton({ title, url }: ShareButtonProps) {
  const t = useTranslations("works");
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* user cancelled */
      }
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="text-[10px] uppercase tracking-[0.2em] text-charcoal/50 transition-colors duration-500 hover:text-gold"
    >
      {copied ? t("linkCopied") : t("share")}
    </button>
  );
}
