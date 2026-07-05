import { currencyFromCountry, isCurrency } from "@/lib/commerce/currency";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const override = url.searchParams.get("currency");

  if (override && isCurrency(override)) {
    return NextResponse.json({ currency: override });
  }

  const country =
    request.headers.get("x-vercel-ip-country") ??
    request.headers.get("cf-ipcountry");

  const currency = currencyFromCountry(country);
  return NextResponse.json({ currency, country });
}
