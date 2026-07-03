# MIYAKO

A curated platform introducing exceptional traditional artisans from Japan and China to a global audience. Phase 1 is a content-driven marketing site with manual inquiry flow — no checkout.

## Stack

- Next.js 16 (App Router)
- Tailwind CSS 4
- TypeScript
- Static JSON content

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Content

All content lives in the `content/` directory:

- `content/artists.json` — artist profiles, carousel images, bios
- `content/works.json` — individual works linked to artists via `artistSlug`

To add an artist, append a record to `artists.json` with `workSlugs` referencing works in `works.json`.

## Contact form

The inquiry form uses [Resend](https://resend.com) when `RESEND_API_KEY` is set in `.env.local`. Without it, submissions fall back to opening a `mailto:` link.

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

## Deploy

Deploy to [Vercel](https://vercel.com) with one click. Set environment variables in the Vercel dashboard if using Resend.

```bash
npm run build
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage with hero, mission excerpt, featured works |
| `/mission` | Full mission and how-it-works |
| `/artists` | Interactive artist grid with image carousels |
| `/artists/[slug]` | Artist profile and works |
| `/works/[slug]` | Work detail with inquiry CTA |
| `/contact` | Manual inquiry form |
