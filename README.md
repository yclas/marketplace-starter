# Yclas Marketplace Starter

A ready-made front end for a [Yclas](https://yclas.com) marketplace. You design the pages your visitors see, in
**Lovable**, **Bolt**, **Replit** or your own editor, and your Yclas site stays the back end: listings, accounts,
messages, payments, seller payouts and moderation.

It's a plain Vite + React + TypeScript + Tailwind app, the same stack Lovable uses, so you can keep changing it by
prompt.

**What's in it**

- **Home:** search box, categories and the latest listings.
- **Browse:** filters for category, location and price, sorting and pages.
- **Listing page:** photos, details, a "Buy or book" button and "Contact the seller".
- **Accounts:** sign up and sign in.
- **Post a listing:** the category's own fields and photos.
- **My listings** and **Messages**.

## Before you start: set up your Yclas site

You need a Yclas site on the **Marketplace** plan.

1. In your Yclas admin panel, open **Integrations > Your own front end**.
2. Add the addresses where this app will run, one per line. For example:
   - `http://localhost:8080`, on your computer.
   - `https://*.lovable.app`, Lovable's preview addresses.
   - `https://your-own-domain.com`, once it's live.
3. Copy your site's **API key**. It's shown in the starter prompt on that page, and in **Settings > General**.

## Configure

Copy `.env.example` to `.env` and fill it in:

| Variable | What it is |
|---|---|
| `VITE_YCLAS_URL` | Your Yclas site, e.g. `https://yourmarketplace.com` |
| `VITE_YCLAS_SITE_KEY` | Your site's API key. Public by design (the mobile apps carry it too); only sign-up and login use it |
| `VITE_SITE_NAME` | Your marketplace's name |
| `VITE_YCLAS_PROXY` | `1` while developing locally, to skip step 2 above for `npm run dev` |

Never put a key that starts with `yck_` in this app. Those keys can read private data and belong on a server.

## Run it

```bash
npm install
npm run dev     # http://localhost:8080
npm run build   # production files in dist/
```

## Open it in an AI app builder

- [Lovable](docs/lovable.md)
- [Bolt](docs/bolt.md)
- [Replit](docs/replit.md)
- [v0](docs/v0.md)
- [Base44](docs/base44.md), which uses the starter prompt instead of this code

Whichever you use, the rules in [AGENTS.md](AGENTS.md) keep the AI working with your Yclas site instead of building
its own database.

## How it talks to Yclas

All API calls are in [`src/lib/yclas.ts`](src/lib/yclas.ts). The full reference for your site:

- `https://<your site>/api/openapi.json` (OpenAPI 3.1)
- `https://<your site>/api/llms.txt` (plain words, for AI tools)
- `https://<your site>/api/docs` (for people)

**Payments.** Buyers pay on your Yclas site, where your gateways, commission and seller payouts already work. The
"Buy or book" button sends them to the listing there, with `return_to` set to the page they came from. After paying,
they get a link back. Card details never touch this app.

## Good to know

- **SEO:** this is a single-page app. If search traffic matters, render it on a server (for example with a
  framework that pre-renders pages), or keep your Yclas pages for search and use this app for the experience.
- **Listing descriptions** are shown as text, never inserted as HTML, because sellers write them.
- **Private sites:** if your Yclas site is private, or only shows listings to signed-in members, the API asks for the
  site key on listings too.

## Licence

MIT. Use it, change it, sell what you build with it.
