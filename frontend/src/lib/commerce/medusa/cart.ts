import { medusaFetch } from "./client";

export type MedusaAddress = {
  first_name: string;
  last_name: string;
  address_1: string;
  city: string;
  postal_code: string;
  country_code: string;
  phone?: string;
};

export type MedusaCart = {
  id: string;
  email?: string | null;
  region_id?: string;
  total?: number;
  currency_code?: string;
  payment_collection?: {
    id: string;
    payment_sessions?: {
      id: string;
      provider_id: string;
      data?: Record<string, unknown>;
    }[];
  } | null;
  shipping_address?: MedusaAddress | null;
};

type CartResponse = { cart: MedusaCart };

type ShippingOption = {
  id: string;
  name: string;
  amount: number;
  currency_code: string;
};

type ShippingOptionsResponse = { shipping_options: ShippingOption[] };

type PaymentProvidersResponse = {
  payment_providers: { id: string }[];
};

type CompleteCartResponse =
  | { type: "order"; order: { id: string; display_id?: number } }
  | { type: "cart"; cart: MedusaCart; error?: { message?: string } };

export async function retrieveCart(cartId: string): Promise<MedusaCart> {
  const { cart } = await medusaFetch<CartResponse>(
    `/store/carts/${cartId}?fields=*payment_collection,*payment_collection.payment_sessions`,
  );
  return cart;
}

export async function updateCart(
  cartId: string,
  body: {
    email?: string;
    shipping_address?: MedusaAddress;
    billing_address?: MedusaAddress;
  },
): Promise<MedusaCart> {
  const { cart } = await medusaFetch<CartResponse>(`/store/carts/${cartId}`, {
    method: "POST",
    body,
  });
  return cart;
}

export async function listShippingOptions(
  cartId: string,
): Promise<ShippingOption[]> {
  const { shipping_options } = await medusaFetch<ShippingOptionsResponse>(
    `/store/shipping-options?cart_id=${cartId}`,
  );
  return shipping_options ?? [];
}

export async function addShippingMethod(
  cartId: string,
  optionId: string,
): Promise<MedusaCart> {
  const { cart } = await medusaFetch<CartResponse>(
    `/store/carts/${cartId}/shipping-methods`,
    {
      method: "POST",
      body: { option_id: optionId },
    },
  );
  return cart;
}

export async function listPaymentProviders(
  regionId: string,
): Promise<string[]> {
  const { payment_providers } = await medusaFetch<PaymentProvidersResponse>(
    `/store/payment-providers?region_id=${regionId}`,
  );
  return payment_providers.map((p) => p.id);
}

export async function createPaymentCollection(cartId: string): Promise<string> {
  const { payment_collection } = await medusaFetch<{
    payment_collection: { id: string };
  }>("/store/payment-collections", {
    method: "POST",
    body: { cart_id: cartId },
  });
  return payment_collection.id;
}

export async function initializePaymentSession(
  paymentCollectionId: string,
  providerId: string,
): Promise<void> {
  await medusaFetch(
    `/store/payment-collections/${paymentCollectionId}/payment-sessions`,
    {
      method: "POST",
      body: { provider_id: providerId },
    },
  );
}

export async function initiateStripePaymentSession(
  cart: MedusaCart,
): Promise<MedusaCart> {
  const stripeProvider = "pp_stripe_stripe";
  const regionId = cart.region_id;
  if (!regionId) {
    throw new Error("Cart has no region.");
  }

  const providers = await listPaymentProviders(regionId);
  if (!providers.includes(stripeProvider)) {
    throw new Error(
      "Stripe is not enabled for this region. Run ensure-stripe-region on the backend.",
    );
  }

  let paymentCollectionId = cart.payment_collection?.id;
  if (!paymentCollectionId) {
    paymentCollectionId = await createPaymentCollection(cart.id);
  }

  await initializePaymentSession(paymentCollectionId, stripeProvider);

  return retrieveCart(cart.id);
}

export async function completeCart(cartId: string): Promise<CompleteCartResponse> {
  return medusaFetch<CompleteCartResponse>(`/store/carts/${cartId}/complete`, {
    method: "POST",
  });
}

export function getStripeClientSecret(cart: MedusaCart): string | null {
  const session = cart.payment_collection?.payment_sessions?.find((s) =>
    s.provider_id.startsWith("pp_stripe"),
  );
  const secret = session?.data?.client_secret;
  return typeof secret === "string" ? secret : null;
}
