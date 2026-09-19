create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  username text unique,
  avatar_url text,
  bio text,
  domain text,
  level text,
  onboarding_goal text,
  onboarding_completed boolean not null default false,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.shops (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  slug text not null unique,
  name text not null,
  description text not null default '',
  logo_url text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  shop_id uuid references public.shops(id) on delete set null,
  slug text not null unique,
  title text not null,
  description text not null default '',
  product_type text not null check (
    product_type in ('ebook', 'formation', 'pack', 'template', 'guide', 'other')
  ),
  category text not null default 'Création de contenu',
  price_cents integer not null default 0 check (price_cents >= 0),
  currency text not null default 'XOF',
  cover_url text,
  file_path text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_shops_owner
on public.shops(owner_id, created_at desc);

create index if not exists idx_products_owner
on public.products(owner_id, created_at desc);

create index if not exists idx_products_shop
on public.products(shop_id, created_at desc);

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists shops_updated_at on public.shops;
create trigger shops_updated_at
before update on public.shops
for each row
execute function public.set_updated_at();

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at
before update on public.products
for each row
execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.shops enable row level security;
alter table public.products enable row level security;

drop policy if exists profiles_owner_select on public.profiles;
create policy profiles_owner_select
on public.profiles for select
using (id = auth.uid());

drop policy if exists profiles_owner_insert on public.profiles;
create policy profiles_owner_insert
on public.profiles for insert
with check (id = auth.uid());

drop policy if exists profiles_owner_update on public.profiles;
create policy profiles_owner_update
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists shops_owner_select on public.shops;
create policy shops_owner_select
on public.shops for select
using (owner_id = auth.uid() or status = 'published');

drop policy if exists shops_owner_insert on public.shops;
create policy shops_owner_insert
on public.shops for insert
with check (owner_id = auth.uid());

drop policy if exists shops_owner_update on public.shops;
create policy shops_owner_update
on public.shops for update
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists shops_owner_delete on public.shops;
create policy shops_owner_delete
on public.shops for delete
using (owner_id = auth.uid());

drop policy if exists products_owner_select on public.products;
create policy products_owner_select
on public.products for select
using (owner_id = auth.uid() or status = 'published');

drop policy if exists products_owner_insert on public.products;
create policy products_owner_insert
on public.products for insert
with check (owner_id = auth.uid());

drop policy if exists products_owner_update on public.products;
create policy products_owner_update
on public.products for update
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists products_owner_delete on public.products;
create policy products_owner_delete
on public.products for delete
using (owner_id = auth.uid());
