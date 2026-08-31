-- BLOOM foundation schema
-- Apply this file once in the connected Supabase SQL editor.
-- It is intentionally additive and keeps all user-owned records behind RLS.

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
  product_type text not null check (product_type in ('ebook', 'formation', 'pack', 'template', 'guide', 'other')),
  category text not null default 'Création de contenu',
  price_cents integer not null default 0 check (price_cents >= 0),
  currency text not null default 'XOF',
  cover_url text,
  file_path text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, product_id)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles(id) on delete restrict,
  total_cents integer not null default 0 check (total_cents >= 0),
  currency text not null default 'XOF',
  status text not null default 'pending' check (status in ('pending', 'paid', 'cancelled')),
  payment_provider text check (payment_provider in ('mobile_money', 'card')),
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
  provider text not null check (provider in ('mobile_money', 'card')),
  provider_payment_id text,
  status text not null default 'pending' check (status in ('pending', 'succeeded', 'failed')),
  amount_cents integer not null check (amount_cents >= 0),
  raw_payload jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.coach_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null default 'Nouvelle conversation',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.coach_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.coach_conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  cover_url text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  content text not null default '',
  position integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.lesson_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed boolean not null default false,
  progress_percent integer not null default 0 check (progress_percent between 0 and 100),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, lesson_id)
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null default '',
  status text not null default 'active' check (status in ('active', 'completed', 'archived')),
  created_at timestamptz not null default timezone('utc', now()),
  completed_at timestamptz
);

create table if not exists public.missions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  action_key text not null,
  status text not null default 'active' check (status in ('active', 'completed')),
  created_at timestamptz not null default timezone('utc', now()),
  completed_at timestamptz
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null default '',
  read_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_type text not null,
  label text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists products_status_category_idx on public.products(status, category);
create index if not exists products_owner_idx on public.products(owner_id);
create index if not exists orders_buyer_idx on public.orders(buyer_id);
create index if not exists order_items_seller_idx on public.order_items(seller_id);
create index if not exists activity_user_created_idx on public.activity_events(user_id, created_at desc);
create index if not exists notifications_user_created_idx on public.notifications(user_id, created_at desc);

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists shops_updated_at on public.shops;
create trigger shops_updated_at before update on public.shops for each row execute function public.set_updated_at();
drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at before update on public.products for each row execute function public.set_updated_at();
drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at before update on public.orders for each row execute function public.set_updated_at();
drop trigger if exists payments_updated_at on public.payments;
create trigger payments_updated_at before update on public.payments for each row execute function public.set_updated_at();
drop trigger if exists coach_conversations_updated_at on public.coach_conversations;
create trigger coach_conversations_updated_at before update on public.coach_conversations for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

alter table public.profiles enable row level security;
alter table public.shops enable row level security;
alter table public.products enable row level security;
alter table public.favorites enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.coach_conversations enable row level security;
alter table public.coach_messages enable row level security;
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.goals enable row level security;
alter table public.missions enable row level security;
alter table public.notifications enable row level security;
alter table public.activity_events enable row level security;

drop policy if exists profiles_self on public.profiles;
create policy profiles_self on public.profiles for all using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());
drop policy if exists shops_public_read on public.shops;
create policy shops_public_read on public.shops for select using (status = 'published' or owner_id = auth.uid() or public.is_admin());
drop policy if exists shops_owner_write on public.shops;
create policy shops_owner_write on public.shops for all using (owner_id = auth.uid() or public.is_admin()) with check (owner_id = auth.uid() or public.is_admin());
drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products for select using (status = 'published' or owner_id = auth.uid() or public.is_admin());
drop policy if exists products_owner_write on public.products;
create policy products_owner_write on public.products for all using (owner_id = auth.uid() or public.is_admin()) with check (owner_id = auth.uid() or public.is_admin());
drop policy if exists favorites_self on public.favorites;
create policy favorites_self on public.favorites for all using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists orders_buyer_read on public.orders;
create policy orders_buyer_read on public.orders for select using (buyer_id = auth.uid() or public.is_admin() or exists(select 1 from public.order_items oi where oi.order_id = id and oi.seller_id = auth.uid()));
drop policy if exists order_items_participant_read on public.order_items;
create policy order_items_participant_read on public.order_items for select using (seller_id = auth.uid() or exists(select 1 from public.orders o where o.id = order_id and o.buyer_id = auth.uid()) or public.is_admin());
drop policy if exists payments_participant_read on public.payments;
create policy payments_participant_read on public.payments for select using (public.is_admin() or exists(select 1 from public.orders o where o.id = order_id and o.buyer_id = auth.uid()) or exists(select 1 from public.order_items oi join public.orders o on o.id = oi.order_id where o.id = order_id and oi.seller_id = auth.uid()));
drop policy if exists coach_conversations_self on public.coach_conversations;
create policy coach_conversations_self on public.coach_conversations for all using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists coach_messages_self on public.coach_messages;
create policy coach_messages_self on public.coach_messages for all using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists courses_public_read on public.courses;
create policy courses_public_read on public.courses for select using (status = 'published' or public.is_admin());
drop policy if exists lessons_public_read on public.lessons;
create policy lessons_public_read on public.lessons for select using (exists(select 1 from public.courses c where c.id = course_id and c.status = 'published') or public.is_admin());
drop policy if exists lesson_progress_self on public.lesson_progress;
create policy lesson_progress_self on public.lesson_progress for all using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists goals_self on public.goals;
create policy goals_self on public.goals for all using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists missions_self on public.missions;
create policy missions_self on public.missions for all using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists notifications_self on public.notifications;
create policy notifications_self on public.notifications for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists activity_self on public.activity_events;
create policy activity_self on public.activity_events for select using (user_id = auth.uid() or public.is_admin());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

insert into storage.buckets (id, name, public)
values ('bloom-assets', 'bloom-assets', false)
on conflict (id) do nothing;

drop policy if exists bloom_assets_read on storage.objects;
create policy bloom_assets_read on storage.objects for select using (bucket_id = 'bloom-assets' and (owner_id = auth.uid() or public.is_admin()));
drop policy if exists bloom_assets_insert on storage.objects;
create policy bloom_assets_insert on storage.objects for insert with check (bucket_id = 'bloom-assets' and owner_id = auth.uid());
drop policy if exists bloom_assets_delete on storage.objects;
create policy bloom_assets_delete on storage.objects for delete using (bucket_id = 'bloom-assets' and owner_id = auth.uid());