-- Run in the Supabase SQL editor. Products are publicly readable; only admins can write.
create table if not exists public.products (
  id text primary key,
  name text not null,
  description text not null default '',
  category text not null default 'General',
  price_pence integer not null check (price_pence >= 0),
  image_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  stripe_session_id text unique,
  status text not null default 'pending',
  total_pence integer not null check (total_pence >= 0),
  tracking_number text,
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null references public.products(id),
  quantity integer not null check (quantity > 0),
  unit_price_pence integer not null check (unit_price_pence >= 0)
);

alter table public.products enable row level security;
alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "Anyone can view active products" on public.products
for select using (active = true);
create policy "Users can view own profile" on public.profiles
for select to authenticated using (id = auth.uid());
create policy "Users can view own orders" on public.orders
for select to authenticated using (user_id = auth.uid());
create policy "Users can view items from own orders" on public.order_items
for select to authenticated using (
  exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
);

-- Admin write policies use the protected profile flag. Set is_admin only from the SQL
-- editor or a trusted server process; never expose a service-role key in the browser.
create policy "Admins manage products" on public.products
for all to authenticated using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
) with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
);
