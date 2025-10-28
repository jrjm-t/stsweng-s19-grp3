-- Enable UUID generation (needed for gen_random_uuid)
create extension if not exists "pgcrypto";

-- 1️⃣ Base table: items
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2️⃣ item_stocks depends on items
create table if not exists public.item_stocks (
  lot_id text primary key,
  item_id uuid not null references public.items(id) on delete cascade,
  item_qty integer not null,
  expiry_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  is_deleted boolean not null default false
);

-- 3️⃣ users depends on auth.users (already exists in Supabase)
create table if not exists public.users (
  id uuid primary key,
  name text not null,
  email text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  is_admin boolean not null default false,
  constraint users_auth_fk foreign key (id) references auth.users(id)
);

-- 4️⃣ transactions depends on users + item_stocks
-- replace type text with an enum later if you wish (e.g. 'IN', 'OUT', 'ADJUSTMENT')
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  lot_id text not null references public.item_stocks(lot_id) on delete cascade,
  type text not null,
  item_qty_change integer not null,
  created_at timestamptz not null default now()
);

-- 5️⃣ corrections depends on users + item_stocks
create table if not exists public.corrections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  lot_id text not null references public.item_stocks(lot_id) on delete cascade,
  item_qty_before integer not null,
  item_qty_after integer not null,
  created_at timestamptz not null default now()
);

-- 6️⃣ life_support (standalone)
create table if not exists public.life_support (
  created_at timestamptz not null default now(),
  constraint life_support_pkey primary key (created_at)
);

-- 7️⃣ notifications (standalone)
-- 'lot_ids' is an array of text
-- 'type' is text for now; change to enum if desired
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  lot_ids text[] not null,
  type text not null,
  message text not null,
  created_at timestamptz default now()
);

-- added enums
-- 1) create enum type
CREATE TYPE transaction_type AS ENUM ('DEPOSIT', 'DISTRIBUTE', 'DISPOSE','DELETE');

-- 2) convert existing column to enum
ALTER TABLE public.transactions
  ALTER COLUMN type TYPE transaction_type
  USING type::transaction_type;
