create table public.perfume_usage_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  perfume_id uuid,
  perfume_name_snapshot text not null check (nullif(btrim(perfume_name_snapshot), '') is not null),
  brand_name_snapshot text,
  image_path_snapshot text,
  used_at timestamptz not null,
  occasion text not null check (
    occasion in ('ar_livre', 'casual', 'encontro', 'festa', 'formal', 'trabalho')
  ),
  satisfaction integer check (satisfaction between 1 and 5),
  compliments_count integer not null default 0 check (compliments_count >= 0),
  notes text check (notes is null or char_length(notes) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint perfume_usage_entries_perfume_owner_fkey
    foreign key (perfume_id, user_id)
    references public.perfumes (id, user_id)
    on delete set null (perfume_id)
);

create index perfume_usage_entries_user_used_at_idx
on public.perfume_usage_entries (user_id, used_at desc, id desc);

create index perfume_usage_entries_user_perfume_idx
on public.perfume_usage_entries (user_id, perfume_id, used_at desc);

create index perfume_usage_entries_user_occasion_idx
on public.perfume_usage_entries (user_id, occasion, used_at desc);

create trigger perfume_usage_entries_set_updated_at
before update on public.perfume_usage_entries
for each row execute function private.set_updated_at();

alter table public.perfume_usage_entries enable row level security;

revoke all on table public.perfume_usage_entries from anon, authenticated;

grant select, insert, update, delete
on table public.perfume_usage_entries
to authenticated;

create policy "perfume_usage_entries_select_own"
on public.perfume_usage_entries
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "perfume_usage_entries_insert_own"
on public.perfume_usage_entries
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "perfume_usage_entries_update_own"
on public.perfume_usage_entries
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "perfume_usage_entries_delete_own"
on public.perfume_usage_entries
for delete
to authenticated
using ((select auth.uid()) = user_id);;
