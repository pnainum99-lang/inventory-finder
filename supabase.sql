-- Inventory Finder Pro database
create extension if not exists pgcrypto;
create table if not exists public.inventory (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 product text not null, brand text, model text, condition text default 'Used', buy_price numeric default 0, sell_price numeric default 0,
 profit numeric generated always as (sell_price-buy_price) stored, source text, source_link text, seller_name text, seller_phone text,
 seller_email text, location text, status text default 'NEW', risk text default 'Medium', notes text, image_url text,
 created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists public.listings (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 title text not null, product text, price numeric, source text, source_link text, seller_name text, seller_phone text, seller_email text,
 location text, condition text, status text default 'ACTIVE', notes text, created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists public.search_history (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 query text not null, source text default 'all', location text, result_count integer default 0, searched_at timestamptz default now()
);
alter table public.inventory enable row level security;
alter table public.listings enable row level security;
alter table public.search_history enable row level security;
create policy "inventory own rows" on public.inventory for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "listings own rows" on public.listings for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "history own rows" on public.search_history for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
