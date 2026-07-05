import type { Currency } from "./types";
import { SUPPORTED_CURRENCIES } from "./types";

/** ISO country → suggested currency for geo detection. */
const COUNTRY_CURRENCY: Record<string, Currency> = {
  JP: "JPY",
  US: "USD",
  GB: "GBP",
  CA: "CAD",
  AU: "AUD",
  SG: "SGD",
  HK: "HKD",
  CN: "CNY",
  KR: "KRW",
  DE: "EUR",
  FR: "EUR",
  IT: "EUR",
  ES: "EUR",
  NL: "EUR",
  BE: "EUR",
  AT: "EUR",
  IE: "EUR",
  PT: "EUR",
  FI: "EUR",
};

/**
 * Display conversion rates from JPY. Medusa checkout uses store region pricing;
 * these rates are for localized display only and never mutate the store price.
 */
export const EXCHANGE_RATES_FROM_JPY: Record<Currency, number> = {
  JPY: 1,
  USD: 0.0067,
  EUR: 0.0062,
  GBP: 0.0053,
  CAD: 0.0092,
  AUD: 0.0103,
  SGD: 0.009,
  HKD: 0.052,
  CNY: 0.048,
  KRW: 9.2,
};

/** Medusa region country codes for localized Store pricing. */
export const CURRENCY_COUNTRY: Record<Currency, string> = {
  JPY: "JP",
  USD: "US",
  EUR: "DE",
  GBP: "GB",
  CAD: "CA",
  AUD: "AU",
  SGD: "SG",
  HKD: "HK",
  CNY: "CN",
  KRW: "KR",
};

export const CURRENCY_COOKIE = "miyako_currency";

export function isCurrency(value: string): value is Currency {
  return (SUPPORTED_CURRENCIES as readonly string[]).includes(value);
}

export function currencyFromCountry(countryCode: string | null): Currency {
  if (!countryCode) return "JPY";
  return COUNTRY_CURRENCY[countryCode.toUpperCase()] ?? "JPY";
}

export function convertFromJpy(amountJpy: number, currency: Currency): number {
  return amountJpy * EXCHANGE_RATES_FROM_JPY[currency];
}

export function formatPrice(amount: number, currency: Currency): string {
  const fractionDigits =
    currency === "JPY" || currency === "KRW" ? 0 : 2;

  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount);
}

export function formatPriceFromJpy(amountJpy: number, currency: Currency): string {
  return formatPrice(convertFromJpy(amountJpy, currency), currency);
}
