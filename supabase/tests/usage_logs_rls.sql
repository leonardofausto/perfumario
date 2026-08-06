begin;

do $$
begin
  if to_regclass('public.usage_logs') is null then
    raise exception 'Missing table public.usage_logs';
  end if;

  if not (
    select relrowsecurity
    from pg_class
    where oid = 'public.usage_logs'::regclass
  ) then
    raise exception 'RLS is not enabled on public.usage_logs';
  end if;

  if has_table_privilege('anon', 'public.usage_logs', 'select')
    or has_table_privilege('anon', 'public.usage_logs', 'insert')
    or has_table_privilege('anon', 'public.usage_logs', 'update')
    or has_table_privilege('anon', 'public.usage_logs', 'delete') then
    raise exception 'Anon unexpectedly has usage_logs privileges';
  end if;

  if (
    select count(*)
    from pg_policies
    where schemaname = 'public'
      and tablename = 'usage_logs'
      and roles = array['authenticated'::name]
      and (coalesce(qual, '') || coalesce(with_check, '')) like '%auth.uid()%'
  ) <> 4 then
    raise exception 'Expected four owner-only usage_logs policies';
  end if;
end;
$$;

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'authenticated',
    'authenticated',
    'usage-owner@example.test',
    '',
    now(),
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    'authenticated',
    'authenticated',
    'usage-other@example.test',
    '',
    now(),
    now(),
    now()
  );

insert into public.perfumes (
  id,
  user_id,
  brand,
  name,
  concentration,
  bottle_format,
  olfactory_families
)
values
  (
    '11111111-1111-4111-8111-111111111111',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'Marca',
    'Perfume do dono',
    'eau_de_parfum',
    'full_bottle',
    array['Amadeirado']
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    'Marca',
    'Perfume alheio',
    'eau_de_parfum',
    'full_bottle',
    array['Amadeirado']
  );

set local role authenticated;
set local "request.jwt.claims" =
  '{"sub":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa","role":"authenticated"}';

insert into public.usage_logs (
  id,
  user_id,
  perfume_id,
  used_at,
  occasion_key,
  time_key,
  environment_key,
  compliments_count,
  satisfaction
)
values (
  '33333333-3333-4333-8333-333333333333',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  '11111111-1111-4111-8111-111111111111',
  now() - interval '1 day',
  'trabalho',
  'manha',
  'fechado',
  0,
  4
);

do $$
begin
  begin
    insert into public.usage_logs (
      user_id,
      perfume_id,
      used_at,
      occasion_key,
      time_key,
      environment_key,
      compliments_count,
      satisfaction
    )
    values (
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      '22222222-2222-4222-8222-222222222222',
      now(),
      'trabalho',
      'manha',
      'fechado',
      0,
      4
    );
    raise exception 'Owner created a usage for a foreign perfume';
  exception
    when foreign_key_violation then null;
  end;

  begin
    insert into public.usage_logs (
      user_id,
      perfume_id,
      used_at,
      occasion_key,
      time_key,
      environment_key,
      compliments_count,
      satisfaction
    )
    values (
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      '99999999-9999-4999-8999-999999999999',
      now(),
      'trabalho',
      'manha',
      'fechado',
      0,
      4
    );
    raise exception 'Created usage for a missing perfume';
  exception
    when foreign_key_violation then null;
  end;

  begin
    insert into public.usage_logs (
      user_id,
      perfume_id,
      used_at,
      occasion_key,
      time_key,
      environment_key,
      compliments_count,
      satisfaction
    )
    values (
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      '11111111-1111-4111-8111-111111111111',
      now(),
      'trabalho',
      'manha',
      'fechado',
      -1,
      4
    );
    raise exception 'Accepted negative compliments';
  exception
    when check_violation then null;
  end;

  begin
    insert into public.usage_logs (
      user_id,
      perfume_id,
      used_at,
      occasion_key,
      time_key,
      environment_key,
      compliments_count,
      satisfaction
    )
    values (
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      '11111111-1111-4111-8111-111111111111',
      now(),
      'trabalho',
      'manha',
      'fechado',
      0,
      6
    );
    raise exception 'Accepted satisfaction outside 1..5';
  exception
    when check_violation then null;
  end;
end;
$$;

reset role;
insert into public.usage_logs (
  id,
  user_id,
  perfume_id,
  used_at,
  occasion_key,
  time_key,
  environment_key,
  compliments_count,
  satisfaction
)
values (
  '44444444-4444-4444-8444-444444444444',
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  '22222222-2222-4222-8222-222222222222',
  now() - interval '2 days',
  'casual',
  'tarde',
  'ar_livre',
  2,
  5
);

set local role authenticated;
set local "request.jwt.claims" =
  '{"sub":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa","role":"authenticated"}';

do $$
declare
  visible_count integer;
  changed_count integer;
begin
  select count(*) into visible_count from public.usage_logs;
  if visible_count <> 1 then
    raise exception 'Owner can read foreign usage rows';
  end if;

  update public.usage_logs
  set notes = 'tentativa'
  where id = '44444444-4444-4444-8444-444444444444';
  get diagnostics changed_count = row_count;
  if changed_count <> 0 then
    raise exception 'Owner updated a foreign usage';
  end if;

  delete from public.usage_logs
  where id = '44444444-4444-4444-8444-444444444444';
  get diagnostics changed_count = row_count;
  if changed_count <> 0 then
    raise exception 'Owner deleted a foreign usage';
  end if;

  select count(*)
  into visible_count
  from public.usage_logs
  where used_at >= now() - interval '36 hours'
    and used_at < now();
  if visible_count <> 1 then
    raise exception 'Period filtering did not return the owned usage';
  end if;

  select count(*)
  into visible_count
  from (
    select id
    from public.usage_logs
    order by used_at desc, id desc
    limit 1
  ) page;
  if visible_count <> 1 then
    raise exception 'Usage pagination did not return one row';
  end if;
end;
$$;

rollback;
