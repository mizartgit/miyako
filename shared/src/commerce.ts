/** Supported presentment currencies (JPY is store base currency). */
export const SUPPORTED_CURRENCIES = [
  "JPY",
  "USD",
  "EUR",
  "GBP",
  "CAD",
  "AUD",
  "SGD",
  "HKD",
  "CNY",
  "KRW",
] as const;

export type Currency = (typeof SUPPORTED_CURRENCIES)[number];

export type ProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  quantityAvailable: number | null;
  priceAmount: string;
  priceCurrency: string;
  selectedOptions: { name: string; value: string }[];
};

export type CommerceProduct = {
  id: string;
  handle: string;
  title: string;
  availableForSale: boolean;
  priceAmount: string;
  priceCurrency: string;
  variants: ProductVariant[];
};

export type ProductCommerceState = {
  priceJpy: number;
  available: boolean;
  quantityAvailable: number | null;
  variants: ProductVariant[];
  variantId: string | null;
  source: "medusa" | "content";
};

export type CheckoutResult =
  | { checkoutPath: string; cartId: string }
  | { error: string };
