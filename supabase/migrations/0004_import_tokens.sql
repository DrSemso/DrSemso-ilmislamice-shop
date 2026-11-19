-- Short-lived tokens that let the import-kelimeh edge function run without a browser session.
-- RLS on with no policies: only the service role (inside the function) can read it.
create table if not exists public.import_tokens (token text primary key, expires_at timestamptz not null);
alter table public.import_tokens enable row level security;
revoke all on public.import_tokens from anon, authenticated;
