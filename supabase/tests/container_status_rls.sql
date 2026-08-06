begin;

do $$
begin
  if not (
    select relrowsecurity
    from pg_class
    where oid = 'public.perfumes'::regclass
  ) then
    raise exception 'RLS is not enabled on public.perfumes';
  end if;

  if not exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and tablename = 'perfumes'
      and indexname = 'perfumes_owner_container_alert_idx'
      and indexdef like '%WHERE (container_level = ANY (%'
  ) then
    raise exception 'Missing partial owner alert index';
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
    'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    'authenticated', 'authenticated', 'level-owner@example.test', '',
    now(), now(), now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
    'authenticated', 'authenticated', 'level-other@example.test', '',
    now(), now(), now()
  );

insert into public.perfumes (
  id, user_id, brand, name, concentration, bottle_format, olfactory_families
)
values
  (
    '55555555-5555-4555-8555-555555555555',
    'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    'Marca', 'Perfume próprio', 'eau_de_parfum', 'full_bottle', array['Amadeirado']
  ),
  (
    '66666666-6666-4666-8666-666666666666',
    'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
    'Marca', 'Perfume alheio', 'eau_de_parfum', 'decant', array['Cítrico']
  );

set local role authenticated;
set local "request.jwt.claims" =
  '{"sub":"cccccccc-cccc-4ccc-8ccc-cccccccccccc","role":"authenticated"}';

update public.perfumes
set container_level = 'low', replenishment_intent = 'buy_again'
where id = '55555555-5555-4555-8555-555555555555';

update public.perfumes
set bottle_format = 'decant'
where id = '55555555-5555-4555-8555-555555555555';

do $$
begin
  if (
    select replenishment_intent
    from public.perfumes
    where id = '55555555-5555-4555-8555-555555555555'
  ) is not null then
    raise exception 'Container type change kept an incompatible intention';
  end if;
end;
$$;

update public.perfumes
set bottle_format = 'full_bottle', replenishment_intent = 'buy_again'
where id = '55555555-5555-4555-8555-555555555555';

do $$
declare
  changed_count integer;
begin
  update public.perfumes
  set container_level = 'empty'
  where id = '66666666-6666-4666-8666-666666666666';
  get diagnostics changed_count = row_count;

  if changed_count <> 0 then
    raise exception 'Owner updated a foreign container status';
  end if;

  begin
    update public.perfumes
    set replenishment_intent = 'buy_decant'
    where id = '55555555-5555-4555-8555-555555555555';
    raise exception 'Accepted an intent incompatible with a full bottle';
  exception
    when check_violation then null;
  end;
end;
$$;

rollback;
