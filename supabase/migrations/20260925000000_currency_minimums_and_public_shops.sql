create table if not exists public.currency_minimums (
  currency text primary key,
  min_price_cents integer not null check (min_price_cents > 0)
);

insert into public.currency_minimums (currency, min_price_cents) values
  ('XOF', 55000), ('XAF', 55000), ('CDF', 250000),
  ('USD', 100), ('EUR', 100), ('GBP', 100),
  ('CAD', 140), ('AUD', 150), ('CHF', 90),
  ('MAD', 1000), ('DZD', 13500), ('TND', 300),
  ('NGN', 130000), ('GHS', 1500), ('KES', 13000), ('ZAR', 1800)
on conflict (currency) do update set min_price_cents = excluded.min_price_cents;

alter table public.currency_minimums enable row level security;

create policy "currency_minimums_read_all" on public.currency_minimums
  for select using (true);

create or replace function public.enforce_product_minimum_price()
returns trigger as $$
declare
  minimum integer;
begin
  select min_price_cents into minimum
  from public.currency_minimums
  where currency = new.currency;

  if minimum is null then
    minimum := 55000;
  end if;

  if new.price_cents < minimum then
    raise exception 'price_cents (%) is below the minimum (%) for currency %', new.price_cents, minimum, new.currency;
  end if;

  if new.promo_price_cents is not null and new.promo_price_cents < minimum then
    raise exception 'promo_price_cents (%) is below the minimum (%) for currency %', new.promo_price_cents, minimum, new.currency;
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists products_enforce_minimum_price on public.products;
create trigger products_enforce_minimum_price
  before insert or update on public.products
  for each row execute function public.enforce_product_minimum_price();

alter table public.shops alter column status set default 'published';

update public.shops set status = 'published' where status = 'draft';
