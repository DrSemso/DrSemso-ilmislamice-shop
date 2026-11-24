-- Optional gift wrapping on an order (price in the order's currency, included in total).
alter table public.orders add column if not exists gift_wrap numeric(10,2);

-- Featured ("poznati") authors are shown at the top of the Authors page.
alter table public.authors add column if not exists is_featured boolean not null default false;
