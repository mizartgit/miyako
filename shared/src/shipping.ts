/** International carriers supported by MIYAKO (fulfillment architecture). */
export const MIYAKO_CARRIERS = [
  "ems",
  "dhl",
  "fedex",
  "ups",
] as const;

export type MiyakoCarrier = (typeof MIYAKO_CARRIERS)[number];

export type ShippingQuote = {
  carrier: MiyakoCarrier;
  label: string;
  amount: number;
  currency: string;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
};

/** Default estimated delivery windows (days) per carrier for international orders. */
export const CARRIER_DELIVERY_ESTIMATES: Record<
  MiyakoCarrier,
  { label: string; min: number; max: number }
> = {
  ems: { label: "Japan Post EMS", min: 5, max: 14 },
  dhl: { label: "DHL Express", min: 3, max: 7 },
  fedex: { label: "FedEx International", min: 3, max: 8 },
  ups: { label: "UPS Worldwide", min: 4, max: 10 },
};
