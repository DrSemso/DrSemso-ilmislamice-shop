-- Shipping outside Serbia is agreed by phone: stored as null, not included in total.
alter table public.orders alter column shipping drop not null;
