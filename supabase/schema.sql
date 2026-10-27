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

create table if not exists public.ad_campaigns (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  platform text not null default 'meta' check (platform in ('meta', 'google', 'tiktok', 'other')),
  objective text not null default 'brand_awareness',
  budget_cents integer not null default 0 check (budget_cents >= 0),
  currency text not null default 'XOF' check (currency in ('XOF', 'XAF', 'CDF', 'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'CHF', 'MAD', 'DZD', 'TND', 'NGN', 'GHS', 'KES', 'ZAR')),
  audience jsonb not null default '{}'::jsonb,
  creative_url text,
  status text not null default 'draft' check (status in ('draft', 'pending', 'approved', 'running', 'paused', 'rejected', 'failed')),
  payment_status text not null default 'not_started' check (payment_status in ('not_started', 'pending', 'succeeded', 'failed')),
  kkiapay_reference text,
  meta_account_id text,
  meta_campaign_id text,
  meta_adset_id text,
  notes text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  approved_at timestamptz,
  launched_at timestamptz,
  paused_at timestamptz
);

create index if not exists ad_campaigns_owner_idx on public.ad_campaigns(owner_id, created_at desc);
create index if not exists ad_campaigns_status_idx on public.ad_campaigns(status, created_at desc);

drop trigger if exists ad_campaigns_updated_at on public.ad_campaigns;
create trigger ad_campaigns_updated_at before update on public.ad_campaigns for each row execute function public.set_updated_at();

alter table public.ad_campaigns enable row level security;

drop policy if exists ad_campaigns_owner_select on public.ad_campaigns;
create policy ad_campaigns_owner_select on public.ad_campaigns for select using (owner_id = auth.uid() or public.is_admin());

drop policy if exists ad_campaigns_owner_write on public.ad_campaigns;
create policy ad_campaigns_owner_write on public.ad_campaigns for all using (owner_id = auth.uid() or public.is_admin()) with check (owner_id = auth.uid() or public.is_admin());
