-- ILM webshop schema: catalog, orders, customer profiles, chat messages.
-- Run in Supabase: SQL editor -> paste -> Run (or `supabase db push`).

create extension if not exists "pgcrypto";
create extension if not exists "unaccent" with schema extensions;

-- ---------- Catalog ----------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  parent_id uuid references public.categories(id) on delete set null,
  description text,
  sort int not null default 0,
  created_at timestamptz not null default now()
);
create index on public.categories(parent_id);

create table public.publishers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  logo_url text,
  created_at timestamptz not null default now()
);

create table public.authors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  bio text,
  photo_url text,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  price numeric(10,2) not null check (price >= 0),
  compare_at_price numeric(10,2) check (compare_at_price is null or compare_at_price >= 0),
  stock int not null default 0,
  sku text,
  isbn text,
  pages int,
  binding text,
  year int,
  translator text,
  dimensions text,
  cover_url text,
  images text[] not null default '{}',
  category_id uuid references public.categories(id) on delete set null,
  publisher_id uuid references public.publishers(id) on delete set null,
  author_id uuid references public.authors(id) on delete set null,
  is_set boolean not null default false,
  is_featured boolean not null default false,
  is_new boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.products(category_id);
create index on public.products(publisher_id);
create index on public.products(author_id);
create index on public.products(is_set);

-- Diacritic-free search text ("cetrdeset" finds "Četrdeset"), kept up to date by a trigger.
alter table public.products add column search_text text;
create or replace function public.products_search_text() returns trigger
language plpgsql set search_path = public, extensions as $$
begin
  new.search_text := unaccent(replace(lower(
    coalesce(new.title, '') || ' ' ||
    coalesce((select name from public.authors where id = new.author_id), '') || ' ' ||
    coalesce((select name from public.publishers where id = new.publisher_id), '') || ' ' ||
    coalesce(new.isbn, '')), 'đ', 'dj'));
  new.updated_at := now();
  return new;
end $$;
create trigger products_search_text before insert or update on public.products
  for each row execute function public.products_search_text();

-- Books contained in a set ("Setovi knjiga")
create table public.set_items (
  set_id uuid not null references public.products(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  primary key (set_id, product_id)
);

-- ---------- Customers ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  address text,
  city text,
  postal_code text,
  country text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false)
$$;

-- ---------- Orders (cash on delivery) ----------
create type public.order_status as enum ('nova', 'potvrdjena', 'poslana', 'isporucena', 'otkazana');

create sequence public.order_number_seq start 1001;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  number int not null unique default nextval('public.order_number_seq'),
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  full_name text not null,
  phone text not null,
  address text not null,
  city text not null,
  postal_code text not null,
  country text not null,
  note text,
  subtotal numeric(10,2) not null,
  shipping numeric(10,2) not null,
  total numeric(10,2) not null,
  currency text not null default 'RSD' check (currency in ('RSD', 'EUR')),
  payment_method text not null default 'pouzece',
  status public.order_status not null default 'nova',
  tracking_number text,
  created_at timestamptz not null default now()
);
create index on public.orders(user_id);
create index on public.orders(lower(email));
create index on public.orders(created_at desc);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  title text not null,
  price numeric(10,2) not null,
  quantity int not null check (quantity > 0)
);
create index on public.order_items(order_id);

-- Atomically reduce stock; never below zero.
create or replace function public.decrement_stock(p_id uuid, qty int) returns void
language sql security definer set search_path = public as $$
  update public.products set stock = greatest(stock - qty, 0) where id = p_id
$$;
revoke execute on function public.decrement_stock(uuid, int) from public, anon, authenticated;

-- ---------- Chat widget messages ----------
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  email text,
  message text not null,
  handled boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- Row level security ----------
alter table public.categories enable row level security;
alter table public.publishers enable row level security;
alter table public.authors enable row level security;
alter table public.products enable row level security;
alter table public.set_items enable row level security;
alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.chat_messages enable row level security;

-- Catalog: everyone reads, admins write
create policy "catalog read" on public.categories for select using (true);
create policy "catalog read" on public.publishers for select using (true);
create policy "catalog read" on public.authors for select using (true);
create policy "catalog read" on public.products for select using (active or public.is_admin());
create policy "catalog read" on public.set_items for select using (true);
create policy "admin write" on public.categories for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write" on public.publishers for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write" on public.authors for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write" on public.products for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write" on public.set_items for all using (public.is_admin()) with check (public.is_admin());

-- Profiles: own row (is_admin can't be self-granted)
create policy "own profile read" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "own profile update" on public.profiles for update using (id = auth.uid())
  with check (id = auth.uid() and is_admin = (select p.is_admin from public.profiles p where p.id = auth.uid()));

-- Orders: customers see their own (by account or by the email they log in with); admins see all.
-- Orders are created by the server with the service role, so there is no insert policy.
create policy "own orders" on public.orders for select using (
  user_id = auth.uid()
  or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  or public.is_admin()
);
create policy "admin orders" on public.orders for update using (public.is_admin()) with check (public.is_admin());
create policy "own order items" on public.order_items for select using (
  exists (select 1 from public.orders o where o.id = order_id and (
    o.user_id = auth.uid()
    or lower(o.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    or public.is_admin()))
);
create policy "admin chat" on public.chat_messages for all using (public.is_admin()) with check (public.is_admin());

-- ---------- Storage for product images ----------
insert into storage.buckets (id, name, public) values ('products', 'products', true)
  on conflict (id) do nothing;

-- Trigger-only function: not callable through the API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
