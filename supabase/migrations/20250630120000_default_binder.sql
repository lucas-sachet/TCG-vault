-- Default binder per user + automatic setup on signup

alter table public.binders
  add column if not exists is_default boolean not null default false;

create unique index if not exists binders_one_default_per_user
  on public.binders (user_id)
  where is_default = true;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, nickname, onboarded, languages)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', 'Trainer'),
    new.raw_user_meta_data->>'nickname',
    true,
    '{}'::text[]
  )
  on conflict (id) do nothing;

  insert into public.binders (id, user_id, name, description, is_default)
  values (
    'binder-default-' || new.id::text,
    new.id,
    'Main Collection',
    'Default binder for cards that are not assigned to a custom binder.',
    true
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
