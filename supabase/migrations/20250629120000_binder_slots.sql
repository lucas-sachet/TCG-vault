-- Binder pocket layout: one holding per slot position per page
create table if not exists public.binder_slots (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  binder_id text not null references public.binders(id) on delete cascade,
  page_number integer not null check (page_number >= 0),
  slot_number integer not null check (slot_number >= 0 and slot_number <= 8),
  collection_item_id text references public.collection_items(id) on delete set null,
  unique (binder_id, page_number, slot_number),
  unique (collection_item_id)
);

create index if not exists binder_slots_binder_id_idx on public.binder_slots (binder_id);
create index if not exists binder_slots_user_id_idx on public.binder_slots (user_id);

alter table public.binder_slots enable row level security;

create policy "binder_slots_all_own" on public.binder_slots
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
