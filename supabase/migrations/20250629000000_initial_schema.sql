-- PokéVault initial schema with RLS policies

create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  nickname text,
  country text,
  about_me text,
  collector_since text,
  profile_pic text,
  prefer_specimen_photo boolean default false,
  onboarded boolean default false,
  languages text[] default '{}',
  show_purchase_prices boolean default true,
  show_roi boolean default true,
  show_collection_value boolean default true,
  collector_profile text,
  cookie_consent_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.cards (
  id text primary key,
  name text not null,
  set text,
  number text,
  rarity text,
  language text,
  image_url text,
  supertype text,
  subtypes text[]
);

create table if not exists public.binders (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  cover_card_id text,
  created_at timestamptz default now()
);

create table if not exists public.collection_items (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  card_id text not null references public.cards(id),
  purchase_date text,
  purchase_price numeric,
  currency text default 'USD',
  quantity integer default 1,
  notes text,
  grade_type text,
  grade_value text,
  cert_number text,
  binder_id text references public.binders(id) on delete set null,
  quality text,
  front_photo_url text,
  back_photo_url text
);

create table if not exists public.wishlist_items (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  card_id text not null references public.cards(id),
  desired_price numeric,
  priority text,
  notes text,
  language text
);

create table if not exists public.goals (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null,
  target_value text,
  created_at timestamptz default now()
);

create table if not exists public.market_prices (
  card_id text primary key references public.cards(id),
  market_price numeric not null,
  updated_at timestamptz default now()
);

create table if not exists public.price_history (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  card_id text not null references public.cards(id),
  market_price numeric not null,
  captured_at text not null
);

create table if not exists public.price_notifications (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  card_id text not null,
  card_name text,
  language text,
  old_price numeric,
  new_price numeric,
  change_percent numeric,
  timestamp text,
  is_read boolean default false
);

create table if not exists public.price_alerts (
  card_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  enabled boolean default false,
  target_price numeric not null,
  primary key (card_id, user_id)
);

alter table public.profiles enable row level security;
alter table public.binders enable row level security;
alter table public.collection_items enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.goals enable row level security;
alter table public.price_history enable row level security;
alter table public.price_notifications enable row level security;
alter table public.price_alerts enable row level security;
alter table public.cards enable row level security;
alter table public.market_prices enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_delete_own" on public.profiles for delete using (auth.uid() = id);

create policy "binders_all_own" on public.binders for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "collection_items_all_own" on public.collection_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "wishlist_items_all_own" on public.wishlist_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "goals_all_own" on public.goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "price_history_all_own" on public.price_history for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "price_notifications_all_own" on public.price_notifications for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "price_alerts_all_own" on public.price_alerts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "cards_read_all" on public.cards for select using (true);
create policy "cards_write_authenticated" on public.cards for insert with check (auth.role() = 'authenticated');
create policy "cards_update_authenticated" on public.cards for update using (auth.role() = 'authenticated');

create policy "market_prices_read_all" on public.market_prices for select using (true);
create policy "market_prices_write_authenticated" on public.market_prices for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
