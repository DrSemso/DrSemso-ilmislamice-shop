-- Prices in dinars; orders outside Serbia are charged in euros (din / 120).
alter table public.orders add column if not exists currency text not null default 'RSD'
  check (currency in ('RSD', 'EUR'));
alter table public.profiles alter column country drop default;
