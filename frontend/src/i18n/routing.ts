import { defineRouting } from "next-intl/routing";

/** Add new locales here (e.g. "zh") and create messages/{locale}.json */
export const locales = ["en", "ja"] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: "en",
  localePrefix: "always",
});
