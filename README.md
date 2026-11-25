# ARLEX — Liquid Glass Store

A starter ecommerce storefront for the ARLEX brand. The frontend is React + TypeScript + Vite. The visual design is an Apple-inspired Liquid Glass aesthetic.

## Important: this is a starter, not a live shop yet

The storefront preview, product search/filtering, and local shopping basket work immediately. Accounts and checkout are wired to Supabase/Stripe placeholders but require configuration. Order history/tracking and admin product management still need their dashboard screens and a verified Stripe webhook before accepting real orders.

## Run locally

1. Install Node.js (LTS).
2. In this folder run:
   ```bash
   npm install
   cp .env.example .env
   npm run dev
   ```
3. Open the local URL Vite prints.

## Free/low-cost deployment

- Push this repository to GitHub.
- Connect the repository to Cloudflare Pages.
- Build command: `npm run build`
- Build output directory: `dist`
- Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as Cloudflare Pages environment variables.
- GitHub is your code repository; use Cloudflare Pages for hosting. GitHub Pages is not intended for ecommerce/business hosting.

## Supabase setup

1. Create a Supabase project.
2. Run `supabase/migrations/001_initial.sql` in the Supabase SQL editor.
3. Add products to `public.products`. Prices are stored in pence (e.g. £32.00 = 3200).
4. Configure email authentication and your allowed redirect URLs.
5. Deploy the Edge Function:
   ```bash
   supabase functions deploy create-checkout
   ```
6. Set function secrets:
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_test_...
   supabase secrets set SITE_URL=https://YOUR-SITE.pages.dev
   supabase secrets set ALLOWED_ORIGIN=https://YOUR-SITE.pages.dev
   ```
7. Set the public Supabase URL and anon key in `.env` locally and Cloudflare Pages. The anon key is designed to be public; RLS policies protect the database.

## Security checklist before taking payments

- Never commit `.env`, Stripe secret keys, Supabase service-role keys, webhook signing secrets, or admin credentials.
- Do not use a service-role key in browser code.
- Set `is_admin=true` for your own profile only using the Supabase SQL editor after your first account is created:
  ```sql
  insert into public.profiles (id, is_admin)
  select id, true from auth.users where email = 'YOUR-ADMIN-EMAIL'
  on conflict (id) do update set is_admin = true;
  ```
- Add a Stripe webhook that verifies the Stripe signature and marks an order paid only after Stripe confirms payment. Do not trust the browser success redirect as proof of payment.
- Create the admin dashboard with server-verified admin checks before enabling product/order changes.
- Configure real shipping, tax, privacy, returns, contact details, and legal pages before launch.
- Use Stripe test mode until all webhook and order flows have been tested.

## What's included

- Liquid Glass responsive storefront
- ARLEX branding and sample product catalogue
- Product search and category filters
- Basket drawer and quantity controls
- Supabase magic-link sign-in starter
- Server-side Stripe Checkout starter that reads prices from the database
- Initial Supabase schema and row-level security policies

## Before launch

Replace sample products, images, contact details, and copy. The sample image URLs are remote Unsplash images and should be replaced with product photography you have rights to use.
