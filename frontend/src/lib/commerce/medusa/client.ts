const BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL ?? "http://localhost:9000";

const PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? "";

export function getMedusaBackendUrl(): string {
  return BACKEND_URL.replace(/\/$/, "");
}

export function isMedusaConfigured(): boolean {
  return Boolean(BACKEND_URL && PUBLISHABLE_KEY);
}

type MedusaFetchOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
};

export async function medusaFetch<T>(
  path: string,
  options: MedusaFetchOptions = {},
): Promise<T> {
  const url = `${getMedusaBackendUrl()}${path.startsWith("/") ? path : `/${path}`}`;

  const res = await fetch(url, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      "x-publishable-api-key": PUBLISHABLE_KEY,
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Medusa API ${res.status}: ${text || res.statusText}`);
  }

  return res.json() as Promise<T>;
}
