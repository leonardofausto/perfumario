begin;

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at
)
values (
  '00000000-0000-0000-0000-000000000000',
  '12121212-1212-4212-8212-121212121212',
  'authenticated', 'authenticated', 'analytics-volume@example.test', '',
  now(), now(), now()
);

insert into public.perfumes (
  id, user_id, brand, name, concentration, bottle_format, olfactory_families
)
values (
  '13131313-1313-4313-8313-131313131313',
  '12121212-1212-4212-8212-121212121212',
  'Marca', 'Volume', 'eau_de_parfum', 'full_bottle', array['Amadeirado']
);

insert into public.usage_logs (
  user_id, perfume_id, used_at, occasion_key, time_key,
  environment_key, compliments_count, satisfaction, performance_rating
)
select
  '12121212-1212-4212-8212-121212121212',
  '13131313-1313-4313-8313-131313131313',
  '2026-08-03 12:00:00+00'::timestamptz - (item || ' minutes')::interval,
  case when item % 2 = 0 then 'trabalho' else 'casual' end,
  case when item % 2 = 0 then 'manha' else 'noite' end,
  'fechado',
  item % 3,
  (item % 5) + 1,
  case when item % 4 = 0 then null else (item % 5) + 1 end
from pg_catalog.generate_series(1, 5000) item;

analyze public.usage_logs;

do $$
declare
  plan json;
begin
  execute $explain$
    explain (format json)
    select id
    from public.usage_logs
    where user_id = '12121212-1212-4212-8212-121212121212'
      and used_at >= '2026-08-03 10:00:00+00'
      and used_at < '2026-08-03 11:00:00+00'
  $explain$
  into plan;

  if plan::text not like '%usage_logs_user_used_at_id_idx%' then
    raise exception 'Analytics period query did not use the owner/date index: %', plan;
  end if;

end;
$$;

set local role authenticated;
set local "request.jwt.claims" =
  '{"sub":"12121212-1212-4212-8212-121212121212","role":"authenticated"}';

do $$
declare
  snapshot jsonb;
begin
  snapshot := public.get_analytics_snapshot(
    '12121212-1212-4212-8212-121212121212',
    '90d',
    'America/Sao_Paulo',
    '2026-08-03 18:00:00+00'
  );

  if (snapshot #>> '{usage,total}')::integer <> 5000 then
    raise exception 'Volume aggregation lost rows';
  end if;
end;
$$;

rollback;
