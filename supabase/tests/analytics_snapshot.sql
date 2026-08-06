begin;

do $$
declare
  function_security text;
begin
  select prosecdef::text
  into function_security
  from pg_proc
  where oid = 'public.get_analytics_snapshot(uuid,text,text,timestamptz)'::regprocedure;

  if function_security is distinct from 'false' then
    raise exception 'Analytics RPC must remain security invoker';
  end if;

  if has_function_privilege(
    'anon',
    'public.get_analytics_snapshot(uuid,text,text,timestamptz)',
    'execute'
  ) then
    raise exception 'Anon can execute the analytics RPC';
  end if;

  if not has_function_privilege(
    'authenticated',
    'public.get_analytics_snapshot(uuid,text,text,timestamptz)',
    'execute'
  ) then
    raise exception 'Authenticated role cannot execute the analytics RPC';
  end if;

  if not exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and tablename = 'perfumes'
      and indexname = 'perfumes_owner_created_at_idx'
  ) then
    raise exception 'Missing collection growth index';
  end if;
end;
$$;

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
    'authenticated', 'authenticated', 'analytics-owner@example.test', '',
    now(), now(), now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'ffffffff-ffff-4fff-8fff-ffffffffffff',
    'authenticated', 'authenticated', 'analytics-other@example.test', '',
    now(), now(), now()
  );

insert into public.perfumes (
  id, user_id, brand, name, concentration, bottle_format,
  olfactory_families, is_favorite, created_at
)
values
  (
    '77777777-7777-4777-8777-777777777777',
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
    'Marca A', 'Usado', 'eau_de_parfum', 'full_bottle',
    array['Amadeirado'], true, '2026-07-28 12:00:00+00'
  ),
  (
    '88888888-8888-4888-8888-888888888888',
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
    'Marca B', 'Nunca usado', 'eau_de_toilette', 'decant',
    array['Cítrico'], false, '2026-07-20 12:00:00+00'
  ),
  (
    '99999999-9999-4999-8999-999999999999',
    'ffffffff-ffff-4fff-8fff-ffffffffffff',
    'Marca alheia', 'Alheio', 'parfum', 'full_bottle',
    array['Floral'], true, '2026-07-29 12:00:00+00'
  );

insert into public.usage_logs (
  id, user_id, perfume_id, used_at, occasion_key, time_key,
  environment_key, compliments_count, satisfaction, performance_rating,
  weather_source, weather_condition
)
values
  (
    'aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa',
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
    '77777777-7777-4777-8777-777777777777',
    '2026-08-03 02:30:00+00',
    'trabalho', 'noite', 'fechado', 0, 4, null, null, null
  ),
  (
    'aaaaaaaa-2222-4222-8222-aaaaaaaaaaaa',
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
    '77777777-7777-4777-8777-777777777777',
    '2026-08-03 15:00:00+00',
    'trabalho', 'tarde', 'fechado', 0, 5, 4, 'manual', 'Céu limpo'
  ),
  (
    'bbbbbbbb-1111-4111-8111-bbbbbbbbbbbb',
    'ffffffff-ffff-4fff-8fff-ffffffffffff',
    '99999999-9999-4999-8999-999999999999',
    '2026-08-03 15:00:00+00',
    'festa', 'tarde', 'fechado', 50, 1, 1, 'manual', 'Chuva'
  );

set local role authenticated;
set local "request.jwt.claims" =
  '{"sub":"eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee","role":"authenticated"}';

do $$
declare
  snapshot jsonb;
  period_snapshot jsonb;
  empty_snapshot jsonb;
begin
  snapshot := public.get_analytics_snapshot(
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
    '7d',
    'America/Sao_Paulo',
    '2026-08-03 18:00:00+00'
  );

  if (snapshot #>> '{collection,total}')::integer <> 2
    or (snapshot #>> '{usage,total}')::integer <> 2 then
    raise exception 'Owner totals are inconsistent';
  end if;

  if (snapshot #>> '{compliments,total,value}')::integer <> 0
    or snapshot #>> '{compliments,total,status}' <> 'available'
    or (snapshot #>> '{compliments,usageRate,value}')::numeric <> 0 then
    raise exception 'Real zero compliments were treated as missing';
  end if;

  if (snapshot #>> '{satisfaction,average,value}')::numeric <> 4.5 then
    raise exception 'Satisfaction average formula is inconsistent';
  end if;

  if pg_catalog.jsonb_array_length(snapshot #> '{compliments,byClimate}') <> 1 then
    raise exception 'Climate aggregation did not exclude only missing climate';
  end if;

  if pg_catalog.jsonb_array_length(snapshot #> '{usage,forgotten}') <> 1
    or snapshot #>> '{usage,forgotten,0,lastUsedAt}' is not null then
    raise exception 'Never-used perfume was not classified truthfully';
  end if;

  if not (snapshot #> '{meta,buckets}') ? '2026-08-02'
    or not (snapshot #> '{meta,buckets}') ? '2026-08-03' then
    raise exception 'Timezone-local daily buckets are inconsistent';
  end if;

  period_snapshot := public.get_analytics_snapshot(
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
    '30d', 'America/Sao_Paulo', '2026-08-03 18:00:00+00'
  );
  if (period_snapshot #>> '{meta,from}')::timestamptz <> '2026-07-05 03:00:00+00' then
    raise exception '30-day period boundary is inconsistent: %', period_snapshot #>> '{meta,from}';
  end if;

  period_snapshot := public.get_analytics_snapshot(
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
    '90d', 'America/Sao_Paulo', '2026-08-03 18:00:00+00'
  );
  if (period_snapshot #>> '{meta,from}')::timestamptz <> '2026-05-06 03:00:00+00' then
    raise exception '90-day period boundary is inconsistent: %', period_snapshot #>> '{meta,from}';
  end if;

  period_snapshot := public.get_analytics_snapshot(
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
    'year', 'America/Sao_Paulo', '2026-08-03 18:00:00+00'
  );
  if (period_snapshot #>> '{meta,from}')::timestamptz <> '2026-01-01 03:00:00+00' then
    raise exception 'Year period boundary is inconsistent: %', period_snapshot #>> '{meta,from}';
  end if;

  period_snapshot := public.get_analytics_snapshot(
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
    'all', 'America/Sao_Paulo', '2026-08-03 18:00:00+00'
  );
  if (period_snapshot #>> '{meta,from}')::timestamptz <> '2026-07-01 03:00:00+00' then
    raise exception 'All-time period boundary is inconsistent: %', period_snapshot #>> '{meta,from}';
  end if;

  perform pg_catalog.set_config(
    'request.jwt.claims',
    '{"sub":"ffffffff-ffff-4fff-8fff-ffffffffffff","role":"authenticated"}',
    true
  );

  empty_snapshot := public.get_analytics_snapshot(
    'ffffffff-ffff-4fff-8fff-ffffffffffff',
    '7d',
    'America/Sao_Paulo',
    '2026-07-01 18:00:00+00'
  );

  if empty_snapshot #>> '{usage,hasData}' <> 'false'
    or empty_snapshot #>> '{compliments,total,status}' <> 'empty'
    or empty_snapshot #>> '{compliments,total,value}' is not null then
    raise exception 'Empty usage state is misleading';
  end if;
end;
$$;

do $$
begin
  begin
    perform public.get_analytics_snapshot(
      'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
      '7d',
      'America/Sao_Paulo',
      '2026-08-03 18:00:00+00'
    );
    raise exception 'Cross-user analytics call succeeded';
  exception
    when others then
      if sqlerrm = 'Cross-user analytics call succeeded' then raise; end if;
  end;
end;
$$;

rollback;
