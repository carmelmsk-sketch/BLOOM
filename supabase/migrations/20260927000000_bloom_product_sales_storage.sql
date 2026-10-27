-- Product presentation fields and seller trust signals.
alter table public.shops
  add column if not exists tagline text not null default '',
  add column if not exists specialty text not null default '',
  add column if not exists instagram_url text,
  add column if not exists tiktok_url text,
  add column if not exists facebook_url text;

-- The previous migrations create the product catalog, but not the transactional
-- tables used by the seller dashboard and checkout.
create table if not exists public.favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, product_id)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles(id) on delete restrict,
  total_cents integer not null check (total_cents >= 0),
  currency text not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'cancelled')),
  payment_provider text check (payment_provider in ('kkiapay')),
  payment_status text not null default 'not_started' check (payment_status in ('not_started', 'pending', 'succeeded', 'failed')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  seller_id uuid not null references public.profiles(id) on delete restrict,
  unit_amount_cents integer not null check (unit_amount_cents >= 0),
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  provider text not null check (provider in ('kkiapay')),
  provider_payment_id text,
  status text not null default 'pending' check (status in ('pending', 'succeeded', 'failed')),
  amount_cents integer not null check (amount_cents >= 0),
  raw_payload jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists orders_buyer_created_idx
  on public.orders(buyer_id, created_at desc);
create index if not exists order_items_seller_idx
  on public.order_items(seller_id);

drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

drop trigger if exists payments_updated_at on public.payments;
create trigger payments_updated_at
before update on public.payments
for each row execute function public.set_updated_at();

alter table public.favorites enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;

drop policy if exists favorites_owner_read on public.favorites;
create policy favorites_owner_read on public.favorites
  for select using (user_id = auth.uid());
drop policy if exists favorites_owner_write on public.favorites;
create policy favorites_owner_write on public.favorites
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists orders_participant_read on public.orders;
create policy orders_participant_read on public.orders
  for select using (
    buyer_id = auth.uid()
    or exists (
      select 1 from public.order_items item
      where item.order_id = id and item.seller_id = auth.uid()
    )
  );
drop policy if exists orders_buyer_insert on public.orders;
create policy orders_buyer_insert on public.orders
  for insert with check (buyer_id = auth.uid());

drop policy if exists order_items_participant_read on public.order_items;
create policy order_items_participant_read on public.order_items
  for select using (
    seller_id = auth.uid()
    or exists (
      select 1 from public.orders order_row
      where order_row.id = order_id and order_row.buyer_id = auth.uid()
    )
  );
drop policy if exists order_items_buyer_insert on public.order_items;
create policy order_items_buyer_insert on public.order_items
  for insert with check (
    exists (
      select 1 from public.orders order_row
      where order_row.id = order_id and order_row.buyer_id = auth.uid()
    )
  );

drop policy if exists payments_participant_read on public.payments;
create policy payments_participant_read on public.payments
  for select using (
    exists (
      select 1 from public.orders order_row
      where order_row.id = order_id and order_row.buyer_id = auth.uid()
    )
    or exists (
      select 1 from public.order_items item
      where item.order_id = payments.order_id and item.seller_id = auth.uid()
    )
  );

-- Public cover images are safe to read, but writes are restricted to a
-- directory named after the authenticated user's UUID.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'bloom-covers',
  'bloom-covers',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists bloom_covers_public_read on storage.objects;
create policy bloom_covers_public_read on storage.objects
  for select using (bucket_id = 'bloom-covers');

drop policy if exists bloom_covers_owner_insert on storage.objects;
create policy bloom_covers_owner_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'bloom-covers'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists bloom_covers_owner_update on storage.objects;
create policy bloom_covers_owner_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'bloom-covers'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'bloom-covers'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists bloom_covers_owner_delete on storage.objects;
create policy bloom_covers_owner_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'bloom-covers'
    and (storage.foldername(name))[1] = auth.uid()::text
  );