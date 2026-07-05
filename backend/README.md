# MIYAKO — Medusa Backend

Headless commerce backend for MIYAKO. Completely independent from the Next.js frontend.

- **Admin**: You upload every Work manually here (no artisan accounts)
- **Store API**: The frontend reads products, carts, and orders via HTTP
- **Database**: PostgreSQL (Neon)
- **Payments**: Stripe-ready (Phase 2)
- **Shipping**: EMS / DHL / FedEx / UPS architecture (Phase 2 live rates)

---

## Step 1 — Prerequisites

Install on your machine:

1. **Node.js 20+** — [nodejs.org](https://nodejs.org/)
2. **PostgreSQL** — [Neon](https://neon.tech) recommended (free tier works)
3. **Redis** (production) — [Upstash](https://upstash.com) or local Docker

---

## Step 2 — Create a PostgreSQL database

### Option A: Neon (recommended)

1. Sign in at [neon.tech](https://neon.tech)
2. Create a project (e.g. `miyako`)
3. Create a database named `miyako_medusa` (or reuse `neondb`)
4. Copy the connection string:

```
postgresql://user:password@ep-xxx.region.aws.neon.tech/miyako_medusa?sslmode=require
```

> **Note:** The frontend Prisma database and Medusa can share the same Neon **project** but should use **separate database names** to keep schemas isolated. Alternatively, use one database — Medusa and Prisma tables coexist with different prefixes.

---

## Step 3 — Configure environment

From the repo root:

```bash
cp backend/.env.template backend/.env
```

Edit `backend/.env`:

```env
DATABASE_URL=postgresql://...your-neon-url...
JWT_SECRET=          # openssl rand -base64 32
COOKIE_SECRET=         # openssl rand -base64 32
STORE_CORS=http://localhost:3003
ADMIN_CORS=http://localhost:9000
AUTH_CORS=http://localhost:3003,http://localhost:9000
MEDUSA_BACKEND_URL=http://localhost:9000
```

Generate secrets:

```bash
openssl rand -base64 32   # JWT_SECRET
openssl rand -base64 32   # COOKIE_SECRET
```

### Redis (optional locally)

For local development Medusa can run without Redis. For production:

```env
REDIS_URL=rediss://default:token@host:6379
```

---

## Step 4 — Install dependencies

The backend is **not** an npm workspace (Medusa conflicts with hoisted installs). Install it independently:

```bash
cd backend
npm install
```

The frontend and shared packages install from the repo root:

```bash
cd ..          # repo root
npm install
```

---

## Step 5 — Run database migrations

```bash
cd backend
npx medusa db:migrate
```

This creates all Medusa tables in PostgreSQL.

---

## Step 6 — Create admin user

```bash
cd backend
npx medusa user -e admin@miyako.art -p your-secure-password
```

---

## Step 7 — Start the backend

From repo root:

```bash
npm run dev:backend
```

Or from `backend/`:

```bash
npm run dev
```

- **API**: [http://localhost:9000](http://localhost:9000)
- **Admin**: [http://localhost:9000/app](http://localhost:9000/app)

Sign in with the admin user from Step 6.

---

## Step 8 — Create a Publishable API Key

The Next.js frontend needs a publishable key to call the Store API.

1. Open Medusa Admin → **Settings** → **Publishable API Keys**
2. Create a key (e.g. `MIYAKO Storefront`)
3. Link it to your sales channel
4. Copy the key into `frontend/.env.local`:

```env
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_...
MEDUSA_BACKEND_URL=http://localhost:9000
```

Restart the frontend dev server.

---

## Step 9 — Configure store (JPY, regions)

In Medusa Admin:

1. **Settings → Store** — set default currency to **JPY**
2. **Settings → Regions** — add regions for international shipping (Japan, US, EU, etc.)
3. **Settings → Sales Channels** — ensure products are published to the default channel

---

## Step 10 — Create your first Work (Product)

In Medusa Admin → **Products** → **Create**:

| Field | Value |
|-------|-------|
| Title | English title (e.g. Moonlit Chawan) |
| Handle | SEO slug — must match `frontend/content/works.json` slug |
| Description | Optional short description |
| Images | Upload work photos |
| Variants | One variant per work (one-of-a-kind) |
| Price | JPY amount |
| Inventory | Set quantity (usually 1 for unique pieces) |
| Collection | Assign to a collection (e.g. Tea Ware) |
| Category | Assign category (e.g. Ceramics) |

### Work metadata (required for MIYAKO)

In the product **Metadata** section, add JSON fields defined in `shared/src/work-metadata.ts`:

```json
{
  "titleEn": "Moonlit Chawan",
  "titleJa": "月影茶碗",
  "artistSlug": "koyo-kiln",
  "artistName": "Koyo Kiln",
  "artistNameJa": "光洋窯",
  "region": "Kyoto",
  "country": "Japan",
  "technique": "Hand-thrown stoneware",
  "materials": "Stoneware, ash glaze",
  "dimensions": "12 × 12 × 8 cm",
  "weight": "320g",
  "storyEn": "...",
  "storyJa": "...",
  "oneOfAKind": true,
  "madeToOrder": false,
  "metaDescription": "...",
  "careInstructions": "Hand wash only."
}
```

The site always displays **both English and Japanese** titles together.

---

## Custom Store API routes

| Route | Description |
|-------|-------------|
| `GET /store/works/:handle` | Product + validated Work metadata |
| `GET /store/shipping/options` | Available carriers + delivery estimates |

---

## Stripe (Phase 2 — prepared)

When ready:

1. Create a [Stripe](https://stripe.com) account
2. Add to `backend/.env`:

```env
STRIPE_API_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

3. Restart Medusa — `medusa-config.ts` auto-registers the Stripe payment module
4. Complete checkout UI in `frontend/src/app/[locale]/checkout/`

See `backend/src/modules/payment/stripe-readme.ts`.

---

## Shipping (Phase 2 — prepared)

Carriers defined in `shared/src/shipping.ts`:

- **EMS** — Japan Post (default)
- **DHL Express**
- **FedEx International**
- **UPS Worldwide**

Stub providers live in `backend/src/modules/fulfillment/`. Phase 2 adds live rate quotes via carrier APIs.

---

## Image uploads

Local file storage is configured via the **File module** with the `@medusajs/medusa/file-local` **provider** (nested under `providers` in `medusa-config.ts`). Uploads are stored in `backend/static/` and served at `/static`.

For production, switch to S3/R2 by replacing the file module in `medusa-config.ts`.

---

## Production checklist

- [ ] Set strong `JWT_SECRET` and `COOKIE_SECRET`
- [ ] Configure `REDIS_URL`
- [ ] Set `STORE_CORS`, `ADMIN_CORS`, `AUTH_CORS` to production domains
- [ ] Use SSL PostgreSQL (`?sslmode=require` on Neon)
- [ ] Create production Publishable API Key
- [ ] Configure Stripe (Phase 2)
- [ ] Set up Medusa worker mode for background jobs
- [ ] Register webhooks → `frontend` `/api/webhooks/medusa`

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Admin won't load | Check `DATABASE_URL`, run `npx medusa db:migrate` |
| Frontend "not configured" on Buy | Set `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` |
| CORS errors | Add `http://localhost:3003` to `STORE_CORS` and `AUTH_CORS` |
| Product not found | Handle must match work slug; product must be **published** |

---

## File structure

```
backend/
├── medusa-config.ts          Main configuration
├── .env.template             Environment template
├── src/
│   ├── api/store/works/      Work enrichment API
│   ├── api/store/shipping/   Shipping options API
│   └── modules/
│       ├── fulfillment/      Carrier architecture
│       └── payment/          Stripe Phase 2 notes
└── static/                   Local image storage (served at /static)
```
