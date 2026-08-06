create table public.perfume_autofill_cache (
  user_id uuid not null references auth.users (id) on delete cascade,
  cache_key text not null check (cache_key ~ '^[0-9a-f]{64}$'),
  response jsonb not null check (
    jsonb_typeof(response) = 'object'
    and octet_length(response::text) <= 262144
  ),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, cache_key)
);

create index perfume_autofill_cache_expires_at_idx
on public.perfume_autofill_cache (expires_at);

create table public.perfume_autofill_rate_limits (
  user_id uuid not null references auth.users (id) on delete cascade,
  window_started_at timestamptz not null,
  request_count integer not null check (request_count between 1 and 100),
  updated_at timestamptz not null default now(),
  primary key (user_id, window_started_at)
);

create index perfume_autofill_rate_limits_updated_at_idx
on public.perfume_autofill_rate_limits (updated_at);

create trigger perfume_autofill_cache_set_updated_at
before update on public.perfume_autofill_cache
for each row execute function private.set_updated_at();

create trigger perfume_autofill_rate_limits_set_updated_at
before update on public.perfume_autofill_rate_limits
for each row execute function private.set_updated_at();

alter table public.perfume_autofill_cache enable row level security;
alter table public.perfume_autofill_rate_limits enable row level security;

revoke all on table
  public.perfume_autofill_cache,
  public.perfume_autofill_rate_limits
from public, anon, authenticated;

grant select, insert, update on table
  public.perfume_autofill_cache,
  public.perfume_autofill_rate_limits
to service_role;

create function public.consume_perfume_autofill_quota(
  p_user_id uuid,
  p_window_start timestamptz,
  p_limit integer
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  allowed boolean;
begin
  if p_user_id is null
    or p_window_start is null
    or p_limit not between 1 and 100
  then
    raise exception 'Invalid autofill quota parameters';
  end if;

  insert into public.perfume_autofill_rate_limits (
    user_id,
    window_started_at,
    request_count
  )
  values (p_user_id, p_window_start, 1)
  on conflict (user_id, window_started_at)
  do update
  set request_count =
    public.perfume_autofill_rate_limits.request_count + 1
  where public.perfume_autofill_rate_limits.request_count < p_limit
  returning true into allowed;

  return coalesce(allowed, false);
end;
$$;

revoke all on function public.consume_perfume_autofill_quota(
  uuid,
  timestamptz,
  integer
) from public, anon, authenticated;

grant execute on function public.consume_perfume_autofill_quota(
  uuid,
  timestamptz,
  integer
) to service_role;;
