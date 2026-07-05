import type { MiyakoCarrier } from "@miyako/shared";
import { CARRIER_DELIVERY_ESTIMATES } from "@miyako/shared";

export type FulfillmentProviderStub = {
  id: MiyakoCarrier;
  label: string;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
  enabled: boolean;
};

/** Stub registry — replace with live Medusa fulfillment providers in Phase 2. */
export const FULFILLMENT_PROVIDER_STUBS: FulfillmentProviderStub[] = (
  Object.entries(CARRIER_DELIVERY_ESTIMATES) as [
    MiyakoCarrier,
    (typeof CARRIER_DELIVERY_ESTIMATES)[MiyakoCarrier],
  ][]
).map(([id, meta]) => ({
  id,
  label: meta.label,
  estimatedDaysMin: meta.min,
  estimatedDaysMax: meta.max,
  enabled: id === "ems",
}));
