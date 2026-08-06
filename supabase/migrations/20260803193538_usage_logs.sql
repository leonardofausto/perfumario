create table public.usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  perfume_id uuid not null,
  used_at timestamptz not null default now()
    check (used_at <= now()),
  occasion_key text not null check (
    occasion_key in ('ar_livre', 'casual', 'encontro', 'festa', 'formal', 'trabalho')
  ),
  time_key text not null check (
    time_key in ('manha', 'tarde', 'noite', 'madrugada')
  ),
  environment_key text not null check (
    environment_key in ('ar_livre', 'fechado')
  ),
  compliments_count integer not null default 0 check (compliments_count >= 0),
  satisfaction smallint not null check (satisfaction between 1 and 5),
  performance_rating smallint check (performance_rating between 1 and 5),
  weather_source text check (weather_source in ('automatic', 'manual')),
  temperature numeric(5, 2) check (temperature between -100 and 100),
  feels_like numeric(5, 2) check (feels_like between -100 and 100),
  weather_condition text check (
    weather_condition is null
    or char_length(weather_condition) between 1 and 120
  ),
  season_key text check (
    season_key in ('primavera', 'verao', 'outono', 'inverno')
  ),
  city text check (
    city is null
    or char_length(city) between 1 and 120
  ),
  notes text check (
    notes is null
    or char_length(notes) between 1 and 500
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint usage_logs_perfume_owner_fkey
    foreign key (perfume_id, user_id)
    references public.perfumes (id, user_id)
    on delete cascade,
  constraint usage_logs_weather_payload_check check (
    weather_source is not null
    or (
      temperature is null
      and feels_like is null
      and weather_condition is null
      and season_key is null
      and city is null
    )
  )
);

comment on table public.usage_logs is
  'Registros privados de usos reais de fragrâncias.';
comment on column public.usage_logs.compliments_count is
  'Quantidade real de elogios recebidos neste uso; zero é um valor válido.';
comment on column public.usage_logs.weather_source is
  'Origem opcional do clima: automatic ou manual; nulo significa sem clima.';

create index usage_logs_user_used_at_id_idx
on public.usage_logs (user_id, used_at desc, id desc);

create index usage_logs_user_perfume_used_at_id_idx
on public.usage_logs (user_id, perfume_id, used_at desc, id desc);

create trigger usage_logs_set_updated_at
before update on public.usage_logs
for each row execute function private.set_updated_at();

alter table public.usage_logs enable row level security;

revoke all on table public.usage_logs from anon, authenticated;
grant select, insert, update, delete on table public.usage_logs to authenticated;

create policy "usage_logs_select_own"
on public.usage_logs
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "usage_logs_insert_own"
on public.usage_logs
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "usage_logs_update_own"
on public.usage_logs
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "usage_logs_delete_own"
on public.usage_logs
for delete
to authenticated
using ((select auth.uid()) = user_id);
