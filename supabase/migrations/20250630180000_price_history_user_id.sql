-- Align price_history with per-user RLS (remote legacy table lacked user_id)

alter table public.price_history
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

update public.price_history price_history_row
set user_id = collection_owner.user_id
from (
  select distinct on (collection_item.card_id)
    collection_item.card_id,
    collection_item.user_id
  from public.collection_items collection_item
  order by collection_item.card_id, collection_item.created_at desc nulls last
) as collection_owner
where price_history_row.card_id = collection_owner.card_id
  and price_history_row.user_id is null;

update public.price_history
set user_id = (
  select profile.id
  from public.profiles profile
  order by profile.created_at nulls last
  limit 1
)
where user_id is null;

update public.price_history
set id = gen_random_uuid()
where id is null;

alter table public.price_history
  drop constraint if exists price_history_pkey;

alter table public.price_history
  alter column id set not null,
  alter column user_id set not null;

alter table public.price_history
  add constraint price_history_pkey primary key (id);

create unique index if not exists price_history_user_card_captured_unique
  on public.price_history (user_id, card_id, captured_at);

drop policy if exists "Anyone can select price history" on public.price_history;
drop policy if exists "Authenticated users can insert price history" on public.price_history;
drop policy if exists "price_history_all_own" on public.price_history;

create policy "price_history_select_own"
  on public.price_history for select
  using (auth.uid() = user_id);

create policy "price_history_insert_own"
  on public.price_history for insert
  with check (auth.uid() = user_id);

create policy "price_history_update_own"
  on public.price_history for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "price_history_delete_own"
  on public.price_history for delete
  using (auth.uid() = user_id);
