-- Pays de l'utilisateur
alter table public.profiles
add column if not exists country_code text;

-- Prix promotionnel du produit
alter table public.products
add column if not exists promo_price_cents integer;

-- Contraintes de prix
alter table public.products
drop constraint if exists products_price_minimum_check;

alter table public.products
add constraint products_price_minimum_check
check (price_cents >= 550);

alter table public.products
drop constraint if exists products_promo_price_check;

alter table public.products
add constraint products_promo_price_check
check (
  promo_price_cents is null
  or (
    promo_price_cents >= 550
    and promo_price_cents < price_cents
  )
);

-- Les devises autorisées sont des codes ISO 4217.
alter table public.products
drop constraint if exists products_currency_check;

alter table public.products
add constraint products_currency_check
check (
  currency in (
    'XOF',
    'XAF',
    'CDF',
    'USD',
    'EUR',
    'GBP',
    'CAD',
    'AUD',
    'CHF',
    'MAD',
    'DZD',
    'TND',
    'NGN',
    'GHS',
    'KES',
    'ZAR'
  )
);
