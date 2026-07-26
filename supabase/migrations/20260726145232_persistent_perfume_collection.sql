create table public.perfumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  legacy_key text,
  brand text not null check (nullif(btrim(brand), '') is not null),
  name text not null check (nullif(btrim(name), '') is not null),
  description text not null default '',
  concentration text not null check (
    concentration in (
      'parfum',
      'eau_de_parfum',
      'eau_de_toilette',
      'eau_de_cologne',
      'body_splash',
      'perfume_oil',
      'other'
    )
  ),
  bottle_format text not null check (
    bottle_format in ('decant', 'full_bottle')
  ),
  inspiration_kind text not null default 'original' check (
    inspiration_kind in ('original', 'dupe', 'inspiration')
  ),
  inspired_by text,
  olfactory_families text[] not null default '{}',
  image_path text check (
    image_path is null
    or split_part(image_path, '/', 1) = user_id::text
  ),
  image_source_url text,
  description_source_urls text[] not null default '{}',
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint perfumes_id_user_id_key unique (id, user_id),
  constraint perfumes_inspiration_reference_check check (
    (
      inspiration_kind = 'original'
      and inspired_by is null
    )
    or (
      inspiration_kind in ('dupe', 'inspiration')
      and nullif(btrim(inspired_by), '') is not null
    )
  ),
  constraint perfumes_olfactory_families_check check (
    cardinality(olfactory_families) > 0
  )
);

create unique index perfumes_user_legacy_key_key
on public.perfumes (user_id, legacy_key)
where legacy_key is not null;

create index perfumes_user_favorite_name_brand_idx
on public.perfumes (
  user_id,
  is_favorite desc,
  lower(name),
  lower(brand)
);

create table public.perfume_notes (
  id uuid primary key default gen_random_uuid(),
  perfume_id uuid not null,
  user_id uuid not null,
  layer text not null check (layer in ('top', 'heart', 'base')),
  note text not null check (nullif(btrim(note), '') is not null),
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(),
  constraint perfume_notes_perfume_owner_fkey
    foreign key (perfume_id, user_id)
    references public.perfumes (id, user_id)
    on delete cascade,
  constraint perfume_notes_layer_note_key
    unique (perfume_id, layer, note)
);

create index perfume_notes_perfume_layer_order_idx
on public.perfume_notes (perfume_id, layer, display_order);

create index perfume_notes_perfume_owner_idx
on public.perfume_notes (perfume_id, user_id);

create index perfume_notes_user_idx
on public.perfume_notes (user_id);

create table public.perfume_scores (
  id uuid primary key default gen_random_uuid(),
  perfume_id uuid not null,
  user_id uuid not null,
  category text not null check (
    category in ('performance', 'season', 'occasion', 'time')
  ),
  metric_key text not null,
  score integer check (score between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint perfume_scores_perfume_owner_fkey
    foreign key (perfume_id, user_id)
    references public.perfumes (id, user_id)
    on delete cascade,
  constraint perfume_scores_category_metric_key check (
    (category = 'performance' and metric_key in (
      'fixacao',
      'projecao',
      'rastro',
      'versatilidade',
      'presenca'
    ))
    or (category = 'season' and metric_key in (
      'primavera',
      'verao',
      'outono',
      'inverno'
    ))
    or (category = 'occasion' and metric_key in (
      'trabalho',
      'casual',
      'encontro',
      'formal',
      'festa',
      'ar_livre'
    ))
    or (category = 'time' and metric_key in (
      'manha',
      'tarde',
      'noite',
      'madrugada'
    ))
  ),
  constraint perfume_scores_category_metric_key_key
    unique (perfume_id, category, metric_key)
);

create index perfume_scores_perfume_category_idx
on public.perfume_scores (perfume_id, category);

create index perfume_scores_perfume_owner_idx
on public.perfume_scores (perfume_id, user_id);

create index perfume_scores_user_idx
on public.perfume_scores (user_id);

create trigger perfumes_set_updated_at
before update on public.perfumes
for each row execute function private.set_updated_at();

create trigger perfume_scores_set_updated_at
before update on public.perfume_scores
for each row execute function private.set_updated_at();

alter table public.perfumes enable row level security;
alter table public.perfume_notes enable row level security;
alter table public.perfume_scores enable row level security;

revoke all on table
  public.perfumes,
  public.perfume_notes,
  public.perfume_scores
from anon, authenticated;

grant select, insert, update, delete on table
  public.perfumes,
  public.perfume_notes,
  public.perfume_scores
to authenticated;

create policy "perfumes_select_own"
on public.perfumes
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "perfumes_insert_own"
on public.perfumes
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "perfumes_update_own"
on public.perfumes
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "perfumes_delete_own"
on public.perfumes
for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "perfume_notes_select_own"
on public.perfume_notes
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "perfume_notes_insert_own"
on public.perfume_notes
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "perfume_notes_update_own"
on public.perfume_notes
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "perfume_notes_delete_own"
on public.perfume_notes
for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "perfume_scores_select_own"
on public.perfume_scores
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "perfume_scores_insert_own"
on public.perfume_scores
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "perfume_scores_update_own"
on public.perfume_scores
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "perfume_scores_delete_own"
on public.perfume_scores
for delete
to authenticated
using ((select auth.uid()) = user_id);

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'perfume-images',
  'perfume-images',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "perfume_images_select_own"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'perfume-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "perfume_images_insert_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'perfume-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "perfume_images_update_own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'perfume-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'perfume-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "perfume_images_delete_own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'perfume-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
