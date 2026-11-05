create extension if not exists pgcrypto;
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  price numeric(10,2) not null check (price >= 0),
  category text not null check (category in ('Tecnología','Ropa','Zapatillas','Accesorios')),
  condition text not null,
  size text,
  status text not null default 'Disponible' check (status in ('Disponible','Reservado','Vendido')),
  images text[] not null default '{}',
  created_at timestamptz not null default now()
);
alter table public.products enable row level security;
create policy "Public can read products" on public.products for select using (true);
create policy "Admin can insert" on public.products for insert to authenticated with check (auth.jwt() ->> 'email' = 'REPLACE_WITH_ADMIN_EMAIL');
create policy "Admin can update" on public.products for update to authenticated using (auth.jwt() ->> 'email' = 'REPLACE_WITH_ADMIN_EMAIL') with check (auth.jwt() ->> 'email' = 'REPLACE_WITH_ADMIN_EMAIL');
